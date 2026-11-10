import {recipes,ui,localized} from './kiosk-data.js';
import {initialSelection,choose,validSelection,orderPrice,describeOrder} from './kiosk-core.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&quot;':'&quot;',"'":'&#39;'}[c]));
export function mountKiosk({getLanguage,onAdd,money,getPhoto}){
  const strip=document.getElementById('kiosk-strip');
  const dialog=document.getElementById('kiosk-dialog');
  if(!strip||!dialog)return {refresh(){}};
  const content=dialog.querySelector('#kiosk-content');
  let current=null,selection=null,index=0,withDrink=false,lastFocus=null,notice='';
  const lang=()=>getLanguage();
  const t=k=>ui[lang()][k]||ui.tr[k]||k;
  const title=v=>localized(v,lang());
  const label=price=>money(price);
  const img=recipe=>{
    const url=recipe.image&&getPhoto(recipe.image);
    return url?'<img src="'+esc(url)+'" loading="lazy" decoding="async" alt="">':'<div class="kiosk-placeholder" aria-hidden="true">m<span>✳</span></div>';
  };
  function renderStrip(){
    strip.innerHTML='<div class="kiosk-intro"><div><p class="eyebrow">'+esc(t('kicker'))+'</p><h3>'+esc(t('title'))+'</h3><p>'+esc(t('subtitle'))+'</p></div></div><div class="kiosk-entry-list">'+
      Object.entries(recipes).map(([kind,r])=>'<button type="button" class="kiosk-entry" data-k-start="'+kind+'">'+
      '<span class="kiosk-entry-image">'+img(r)+'</span><span class="kiosk-entry-copy"><b>'+esc(title(r.name))+'</b><small>'+esc(title(r.short))+'</small><strong>'+esc(t('from'))+' '+esc(label(r.steps.length?orderPrice(kind,initialSelection(kind)):r.price))+'</strong></span><span class="kiosk-entry-arrow" aria-hidden="true">↗</span></button>').join('')+
      '</div>';
  }
  function open(kind,seedBread){
    if(!recipes[kind])return;
    lastFocus=document.activeElement;current=kind;selection=initialSelection(kind);index=0;withDrink=false;notice='';
    if(kind==='sandwich'&&recipes.sandwich.steps[0].items.some(x=>x.id===seedBread))selection.bread=[seedBread];
    render();
    if(!dialog.open)dialog.showModal();
    content.querySelector('button[data-k-close]')?.focus({preventScroll:true});
  }
  function render(){
    if(!current)return;
    const r=recipes[current],n=r.steps.length;
    const review=index>=n;
    const step=review?null:r.steps[index];
    const price=orderPrice(current,selection);
    const isEstimated=r.estimated;
    const moneyValue=label(price+(review&&withDrink?18000:0));
    const images=img(r);
    const stepLabel=t('step')+' '+(index+1)+' '+t('of')+' '+(n+1);
    const chips=r.steps.map((s,i)=>'<span class="'+(i<=index?'is-active':'')+'"></span>').join('')+'<span class="'+(review?'is-active':'')+'"></span>';
    const choices=step?'<div class="kiosk-choices" role="group" aria-label="'+esc(title(step.title))+'">'+step.items.map(item=>{
      const selected=selection[step.id].includes(item.id);
      return '<button type="button" class="kiosk-option'+(selected?' selected':'')+'" data-k-choice="'+esc(item.id)+'" aria-pressed="'+String(selected)+'"><span class="kiosk-check" aria-hidden="true">'+(selected?'✓':'')+'</span><span class="kiosk-option-name">'+esc(title(item.label))+'</span><span class="kiosk-option-price">'+(item.price?'+'+esc(label(item.price)):selected?'✓':'')+'</span></button>';
    }).join('')+'</div>': '';
    const hint=step?'<p class="kiosk-step-hint">'+esc(step.min===1&&step.max===1?t('selectOne'):t('selectUpTo')+' '+step.max+' · '+(step.min===0?t('optional'):t('selectOne')))+'</p>':'';
    const summary=review?'<div class="kiosk-review"><p class="eyebrow">'+esc(t('review'))+'</p><h3>'+esc(title(r.name))+'</h3>'+
      '<div class="kiosk-summary">'+r.steps.map(s=>{
        const values=selection[s.id].map(id=>s.items.find(x=>x.id===id)).filter(Boolean);
        return values.length?'<div><small>'+esc(title(s.title))+'</small><b>'+esc(values.map(x=>title(x.label)).join(' · '))+'</b></div>':'';
      }).join('')+'</div><p class="kiosk-note">'+esc(title(r.note))+'</p>'+
      '<button type="button" class="kiosk-drink'+(withDrink?' chosen':'')+'" data-k-drink aria-pressed="'+String(withDrink)+'"><span class="kiosk-drink-symbol">☕</span><span><b>'+esc(t('drink'))+'</b><small>'+esc(t('drinkNote'))+'</small></span><span class="kiosk-check" aria-hidden="true">'+(withDrink?'✓':'+')+'</span></button>'+
      '<p class="kiosk-allergens">'+esc(t('allergens'))+'</p></div>':'';
    content.innerHTML='<div class="kiosk-dialog-head"><div><span class="kiosk-wordmark">miora <small>COFFEE · FOOD · PLAY</small></span><p>'+esc(stepLabel)+'</p></div><button type="button" class="kiosk-close" data-k-close aria-label="'+esc(t('close'))+'">×</button></div>'+
      '<div class="kiosk-progress" aria-hidden="true">'+chips+'</div>'+
      '<div class="kiosk-scroll">'+
      (review?'':('<div class="kiosk-hero">'+images+'<div><p class="eyebrow">'+esc(t('kicker'))+'</p><h2>'+esc(title(r.name))+'</h2><p>'+esc(title(r.short))+'</p></div></div>'))+
      (review?summary:('<h3 class="kiosk-step-title">'+esc(title(step.title))+'</h3>'+hint+choices+(index===0&&r.estimated?'<p class="kiosk-note">'+esc(title(r.note))+'</p>':'')))+
      '</div>'+
      '<div class="kiosk-bottom"><div class="kiosk-price"><small>'+esc(isEstimated?t('estimated'):t('total'))+'</small><strong>'+esc(moneyValue)+(isEstimated?'*':'')+'</strong></div>'+
      '<div class="kiosk-buttons"><button type="button" class="kiosk-back" data-k-back '+(index===0?'disabled':'')+'>'+esc(t('previous'))+'</button>'+
      '<button type="button" class="kiosk-next" data-k-next '+(!review&&!validStep(step)?'disabled':'')+'>'+esc(review?t('add'):t('next'))+' <span aria-hidden="true">→</span></button></div>'+
      (isEstimated?'<p class="kiosk-disclaimer">'+esc(t('confirm'))+'</p>':'<p class="kiosk-disclaimer">'+esc(t('staff'))+'</p>')+
      (notice?'<p class="kiosk-notice" role="status">'+esc(notice)+'</p>':'')+
      '</div>';
  }
  function validStep(step){return !step||(selection[step.id]?.length??0)>=step.min;}
  document.addEventListener('click',e=>{
    const start=e.target.closest('[data-k-start]');if(start)open(start.dataset.kStart,start.dataset.kBread);
  });
  dialog.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-k-close')){dialog.close();return;}
    if(b.hasAttribute('data-k-back')){if(index>0){index--;notice='';render();}return;}
    if(b.hasAttribute('data-k-drink')){withDrink=!withDrink;render();return;}
    if(b.hasAttribute('data-k-choice')){
      const step=recipes[current].steps[index];
      const before=selection[step.id];selection=choose(selection,step,b.dataset.kChoice);
      notice=selection[step.id]===before?t('max'):'';
      const y=dialog.querySelector('.kiosk-scroll')?.scrollTop||0;render();
      dialog.querySelector('.kiosk-scroll').scrollTop=y;
      return;
    }
    if(b.hasAttribute('data-k-next')){
      const r=recipes[current];
      if(index<r.steps.length){if(!validStep(r.steps[index]))return;index++;notice='';render();}
      else if(validSelection(current,selection)){
        const accepted=onAdd({kind:current,selection},withDrink);
        if(accepted){dialog.close();}
        else {notice=t('max');render();}
      }
    }
  });
  dialog.addEventListener('close',()=>{current=null;lastFocus?.focus?.({preventScroll:true});});
  function refresh(){renderStrip();if(dialog.open)render();}
  renderStrip();
  return {refresh,open};
}

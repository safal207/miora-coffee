import {recipes,ui,localized} from './kiosk-data.js';
import {initialSelection,choose,validSelection,orderPrice} from './kiosk-core.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phrases={
  tr:{reviewTitle:'Seçimlerin',edit:'Düzenle',finish:'Son kontrol',photo:'Örnek fotoğraf',details:'İçerik',approx:'Başlangıç toplamı',drinkShort:'Cappuccino da ekle',editSave:'Değişiklikleri kaydet',notFinal:'Dolgu fiyatı personelle netleşir'},
  ru:{reviewTitle:'Твой состав',edit:'Изменить',finish:'Проверь и добавь',photo:'Пример фото',details:'Ингредиенты',approx:'Сумма от',drinkShort:'Добавить капучино',editSave:'Сохранить изменения',notFinal:'Цена начинки уточняется в кафе'},
  en:{reviewTitle:'Your ingredients',edit:'Edit',finish:'Review & add',photo:'Illustrative photo',details:'Ingredients',approx:'Total from',drinkShort:'Add a cappuccino',editSave:'Save changes',notFinal:'Confirm filling prices with staff'}
};
const glyphs={
  'purple-carrot':'🍞',labne:'🥛',white:'🧀',strained:'🧀',ezine:'🧀',kasar:'🧀',cheddar:'🧀',
  'avocado-mousse':'🥑',pesto:'🌿','roasted-pepper':'🫑','sun-tomato':'🍅',onion:'🧅',pickle:'🥒',
  turkey:'🥪',avocado:'🥑',beef:'🥩',salmon:'🐟',tuna:'🐟',tomato:'🍅',cucumber:'🥒',
  lettuce:'🥬',rocket:'🥬',parsley:'🌿',dill:'🌿',mint:'🌿',
  large:'🥐',mini:'🥐',bread:'🍞',omelette:'🍳',boiled:'🥚',tahin:'🍯',honey:'🍯',nutella:'🍫'
};
const breadImages={olive:'430240','tomato-walnut':'431177',focaccia:'431179',wholewheat:'430236',plain:'431178'};
const itemVisual=(step,item,getPhoto)=>{
  const id=step.id==='bread'?breadImages[item.id]:null;
  const photo=id&&getPhoto(id);
  return photo?'<img class="kiosk-option-photo" src="'+esc(photo)+'" width="66" height="66" loading="lazy" decoding="async" alt="">':
    '<span class="kiosk-option-glyph" aria-hidden="true">'+(glyphs[item.id]||'✳')+'</span>';
};
export function mountKiosk({getLanguage,onAdd,onUpdate,onEdited,money,getPhoto}){
  const strip=document.getElementById('kiosk-strip');
  const dialog=document.getElementById('kiosk-dialog');
  if(!strip||!dialog)return {refresh(){},open(){},edit(){}};
  const content=dialog.querySelector('#kiosk-content');
  let current=null,selection=null,index=0,withDrink=false,lastFocus=null,notice='',editIndex=null,returnToReview=false;
  const lang=()=>getLanguage();
  const t=k=>ui[lang()][k]||ui.tr[k]||k;
  const p=k=>phrases[lang()][k]||phrases.tr[k]||k;
  const title=v=>localized(v,lang());
  const label=price=>money(price);
  const recipeImg=(r)=>{
    const url=r.image&&getPhoto(r.image);
    return url?'<img src="'+esc(url)+'" loading="lazy" decoding="async" alt="">':
      '<div class="kiosk-placeholder" aria-hidden="true">m<span>✳</span></div>';
  };
  function renderStrip(){
    strip.innerHTML='<div class="kiosk-intro"><div><p class="eyebrow">'+esc(t('kicker'))+'</p><h3>'+esc(t('title'))+'</h3><p>'+esc(t('subtitle'))+'</p></div></div><div class="kiosk-entry-list">'+
      Object.entries(recipes).map(([kind,r])=>'<button type="button" class="kiosk-entry" data-k-start="'+kind+'">'+
      '<span class="kiosk-entry-image">'+recipeImg(r)+'</span><span class="kiosk-entry-copy"><b>'+esc(title(r.name))+'</b><small>'+esc(title(r.short))+'</small><strong>'+esc(t('from'))+' '+esc(label(r.steps.length?orderPrice(kind,initialSelection(kind)):r.price))+'</strong></span><span class="kiosk-entry-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>';
  }
  function open(kind,seedBread,existing=null,lineIndex=null){
    if(!Object.hasOwn(recipes,kind))return;
    lastFocus=document.activeElement;current=kind;
    selection=existing?structuredClone(existing):initialSelection(kind);
    index=existing?recipes[kind].steps.length:0;
    editIndex=Number.isInteger(lineIndex)?lineIndex:null;
    withDrink=false;notice='';returnToReview=false;
    if(!existing&&kind==='sandwich'&&recipes.sandwich.steps[0].items.some(x=>x.id===seedBread))selection.bread=[seedBread];
    render();
    if(!dialog.open)dialog.showModal();
    content.querySelector('[data-k-close]')?.focus({preventScroll:true});
  }
  function validStep(step){return !step||(selection[step.id]?.length??0)>=step.min;}
  function render(){
    if(!current)return;
    const r=recipes[current],n=r.steps.length;
    const review=index>=n;
    const step=review?null:r.steps[index];
    const price=orderPrice(current,selection)+(review&&withDrink?18000:0);
    const photo=recipeImg(r);
    const stepsTotal=n+1;
    const stepLabel=t('step')+' '+(index+1)+' '+t('of')+' '+stepsTotal;
    const dots=Array.from({length:stepsTotal},(_,i)=>'<span class="'+(i<=index?'is-active':'')+'"></span>').join('');
    const choices=step?'<div class="kiosk-choices" role="group" aria-label="'+esc(title(step.title))+'">'+step.items.map(item=>{
      const selected=selection[step.id].includes(item.id);
      return '<button type="button" class="kiosk-option'+(selected?' selected':'')+'" data-k-choice="'+esc(item.id)+'" aria-pressed="'+String(selected)+'">'+
        itemVisual(step,item,getPhoto)+'<span class="kiosk-option-content"><strong>'+esc(title(item.label))+'</strong>'+
        (item.price?'<small>+'+esc(label(item.price))+'</small>':'')+'</span><span class="kiosk-check" aria-hidden="true">'+(selected?'✓':'')+'</span></button>';
    }).join('')+'</div>':'';
    const summary=review?'<div class="kiosk-review"><div class="kiosk-review-heading"><span class="kiosk-review-photo">'+photo+'</span><div>'+
      '<p class="eyebrow">'+esc(p('finish'))+'</p><h2>'+esc(title(r.name))+'</h2><p>'+esc(title(r.short))+'</p></div></div>'+
      (n?'<div class="kiosk-review-grid">'+r.steps.map((s,i)=>{
        const items=selection[s.id].map(id=>s.items.find(x=>x.id===id)).filter(Boolean);
        return '<button class="kiosk-review-item" type="button" data-k-goto="'+i+'">'+
          '<span class="kiosk-review-key">'+esc(title(s.title))+' <em>'+esc(p('edit'))+' ↗</em></span>'+
          '<strong>'+esc(items.length?items.map(v=>title(v.label)).join(' · '):t('optional'))+'</strong></button>';
      }).join('')+'</div>':'<p class="kiosk-note">'+esc(title(r.note))+'</p>')+
      (r.estimated?'<p class="kiosk-price-warning">'+esc(p('notFinal'))+'</p>':'')+
      (editIndex===null?'<button type="button" class="kiosk-drink'+(withDrink?' chosen':'')+'" data-k-drink aria-pressed="'+String(withDrink)+'">'+
        '<span class="kiosk-drink-photo">'+(getPhoto('428772')?'<img src="'+esc(getPhoto('428772'))+'" alt="" loading="lazy">':'☕')+'</span>'+
        '<span class="kiosk-drink-copy"><b>'+esc(p('drinkShort'))+'</b><small>+180 ₺ · '+esc(t('drinkNote').split('·').pop().trim())+'</small></span>'+
        '<span class="kiosk-check" aria-hidden="true">'+(withDrink?'✓':'+')+'</span></button>':'')+
      '<p class="kiosk-allergens">'+esc(t('allergens'))+'</p></div>':'';
    const stepPage=review?'':'<div class="kiosk-step-heading"><span class="kiosk-step-photo">'+photo+'</span><div><h2>'+esc(title(step.title))+'</h2><p>'+esc((lang()==='ru'?'Выбрано ':lang()==='en'?'Selected ':'Seçilen ')+selection[step.id].length+' / '+step.max+' · '+(step.min===0?t('optional'):t('selectOne')))+'</p></div></div>'+
      choices+(index===0&&r.estimated?'<p class="kiosk-note">'+esc(title(r.note))+'</p>':'');
    content.innerHTML='<div class="kiosk-dialog-head"><div><span class="kiosk-wordmark">miora <small>COFFEE · FOOD · PLAY</small></span><p>'+esc(stepLabel)+'</p></div>'+
      '<button type="button" class="kiosk-close" data-k-close aria-label="'+esc(t('close'))+'">×</button></div>'+
      '<div class="kiosk-progress" aria-hidden="true">'+dots+'</div>'+
      '<div class="kiosk-scroll">'+(review?summary:stepPage)+'</div>'+
      '<div class="kiosk-bottom"><div class="kiosk-bottom-row"><button type="button" class="kiosk-back" data-k-back '+(index===0?'disabled':'')+' aria-label="'+esc(t('previous'))+'">←</button>'+
      '<div class="kiosk-price"><small>'+esc(r.estimated?p('approx'):t('total'))+'</small><strong>'+(r.estimated?esc(t('from'))+' ':'')+esc(label(price))+'</strong></div>'+
      '<button type="button" class="kiosk-next" data-k-next '+(!review&&!validStep(step)?'disabled':'')+'>'+esc(review?(editIndex===null?t('add'):p('editSave')):t('next'))+' <span aria-hidden="true">→</span></button></div>'+
      (notice?'<p class="kiosk-notice" role="status">'+esc(notice)+'</p>':'')+'</div>';
  }
  document.addEventListener('click',e=>{
    const start=e.target.closest('[data-k-start]');
    if(start)open(start.dataset.kStart,start.dataset.kBread);
  });
  dialog.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-k-close')){dialog.close();return;}
    if(b.hasAttribute('data-k-back')){if(returnToReview){index=recipes[current].steps.length;returnToReview=false;}else if(index>0)index--;notice='';render();return;}
    if(b.hasAttribute('data-k-goto')){index=Number(b.dataset.kGoto);returnToReview=true;notice='';render();return;}
    if(b.hasAttribute('data-k-drink')){withDrink=!withDrink;render();return;}
    if(b.hasAttribute('data-k-choice')){
      const step=recipes[current].steps[index];
      const before=selection[step.id];selection=choose(selection,step,b.dataset.kChoice);
      notice=selection[step.id]===before?t('max'):'';
      const y=dialog.querySelector('.kiosk-scroll')?.scrollTop||0;
      render();dialog.querySelector('.kiosk-scroll').scrollTop=y;
      return;
    }
    if(b.hasAttribute('data-k-next')){
      const r=recipes[current];
      if(index<r.steps.length){if(!validStep(r.steps[index]))return;index=returnToReview?r.steps.length:index+1;returnToReview=false;notice='';render();}
      else if(validSelection(current,selection)){
        const accepted=editIndex!==null?onUpdate?.({kind:current,selection},editIndex):onAdd({kind:current,selection},withDrink);
        if(accepted){const wasEdit=editIndex!==null;dialog.close();if(wasEdit)queueMicrotask(()=>onEdited?.());}else{notice=t('max');render();}
      }
    }
  });
  dialog.addEventListener('close',()=>{current=null;editIndex=null;lastFocus?.focus?.({preventScroll:true});});
  function refresh(){renderStrip();if(dialog.open)render();}
  renderStrip();
  return {refresh,open,edit:(item,i)=>open(item.kind,null,item.selection,i)};
}

import {recipes,ui,localized} from './kiosk-data.js';
import {initialSelection,choose,validSelection,orderPrice} from './kiosk-core.js';
import {sandwichIdeas,previewForSelection,ideaSelection,localizedIdea,selectedIngredients} from './sandwich-preview.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const phrases={
  tr:{reviewTitle:'Seçimlerin',edit:'Düzenle',finish:'Son kontrol',photo:'Örnek fotoğraf',details:'İçerik',approx:'Başlangıç toplamı',drinkShort:'Cappuccino da ekle',editSave:'Değişiklikleri kaydet',notFinal:'Dolgu fiyatı personelle netleşir',baseImage:'Fotoğrafta sade kruvasan tabanı gösterilir.',aiNote:'Bazı malzeme görselleri yapay zekâ çizimidir; gerçek ürün fotoğrafı değildir.'},
  ru:{reviewTitle:'Твой состав',edit:'Изменить',finish:'Проверь и добавь',photo:'Пример фото',details:'Ингредиенты',approx:'Сумма от',drinkShort:'Добавить капучино',editSave:'Сохранить изменения',notFinal:'Цена начинки уточняется в кафе',baseImage:'На фото — обычный круассан, не готовый десерт с Nutella.',aiNote:'Часть фото ингредиентов создана ИИ для примера, а не снята в Miora.'},
  en:{reviewTitle:'Your ingredients',edit:'Edit',finish:'Review & add',photo:'Illustrative photo',details:'Ingredients',approx:'Total from',drinkShort:'Add a cappuccino',editSave:'Save changes',notFinal:'Confirm filling prices with staff',baseImage:'Photo shows the plain croissant base, not the finished Nutella pastry.',aiNote:'Some ingredient images are AI illustrations, not actual Miora product photos.'}
};
const showcaseCopy={
  tr:{heroTag:'SANA ÖZEL · MIORA',heroTitle:'Kendi sandviçini yarat',heroBody:'Ekmeğini, peynirini ve dolgunu seç. Sana özel küçük bir lezzet.',heroButton:'Sandviçimi kendim hazırlayayım',ideas:'Başlamak için ilham',ideasNote:'Beğendiğin karışımı seç, dilediğin gibi düzenle',preview:'Sandviçin nasıl görünebilir?',photoNote:'Yapay zekâ ile hazırlanmış servis önerisidir; seçtiğin malzemeler farklı görünebilir.',basePreview:'Seçtiğin ekmek',baseOnlyCopy:'Henüz iç malzeme seçmedin. Önce ekmeği gösteriyoruz.',exactIngredients:'Tam seçtiğin malzemeler',pickFilling:'İç malzeme seç',configure:'Bu lezzeti düzenle',from:'Temel fiyat 350 ₺ · iç malzemelerin son fiyatını personelle teyit edin.'},
  ru:{heroTag:'ТВОЙ ВКУС · MIORA',heroTitle:'Создай свой сэндвич',heroBody:'Твой хлеб, сыр, соус и начинка. Собери вкус, который нравится именно тебе.',heroButton:'Собери свой сэндвич',ideas:'Идеи сочетаний',ideasNote:'Выбери вариант и измени любые ингредиенты',preview:'Вот каким может быть твой сэндвич',photoNote:'AI-визуализация подачи. Внешний вид может отличаться от вашего заказа.',basePreview:'Выбранный хлеб',baseOnlyCopy:'Начинка пока не выбрана. Показываем основу, а не готовый сэндвич.',exactIngredients:'Твой точный состав',pickFilling:'Выбрать начинку',configure:'Изменить под себя',from:'Базовая цена 350 ₺ · стоимость начинок уточняется у сотрудника.'},
  en:{heroTag:'MADE FOR YOU · MIORA',heroTitle:'Create your sandwich',heroBody:'Choose your bread, cheese, sauce and filling. Made your way.',heroButton:'Build your sandwich',ideas:'Ideas to start with',ideasNote:'Choose a combination, then customize every ingredient',preview:'Your sandwich could look like this',photoNote:'AI illustration of serving style, not an exact photo of your selection.',basePreview:'Your chosen bread',baseOnlyCopy:'No main filling selected yet. Showing the bread rather than a finished sandwich.',exactIngredients:'Your exact ingredients',pickFilling:'Choose a filling',configure:'Make it yours',from:'350 ₺ base price · confirm filling charges with staff.'}
};
const glyphs={
  'purple-carrot':'🍞',labne:'🥛',white:'🧀',strained:'🧀',ezine:'🧀',kasar:'🧀',cheddar:'🧀',
  'avocado-mousse':'🥑',pesto:'🌿','roasted-pepper':'🫑','sun-tomato':'🍅',onion:'🧅',pickle:'🥒',
  turkey:'🥪',avocado:'🥑',beef:'🥩',salmon:'🐟',tuna:'🐟',tomato:'🍅',cucumber:'🥒',
  lettuce:'🥬',rocket:'🥬',parsley:'🌿',dill:'🌿',mint:'🌿',
  large:'🥐',mini:'🥐',bread:'🍞',omelette:'🍳',boiled:'🥚',tahin:'🍯',honey:'🍯',nutella:'🍫'
};
// Existing Miora photos take priority for known bread variants. Generated atlas fills only gaps.
// Sprite: six columns x four rows, high-resolution 192px source tiles for retina mobile screens.
const breadImages={olive:'430240','tomato-walnut':'431177',focaccia:'431179',wholewheat:'430236',plain:'431178'};
const ingredientAtlas={
  'cheese:labne':[0,0],'cheese:white':[1,0],'cheese:strained':[2,0],
  'cheese:ezine':[3,0],'cheese:kasar':[4,0],'cheese:cheddar':[5,0],
  'sauce:avocado-mousse':[0,1],'sauce:pesto':[1,1],'sauce:roasted-pepper':[2,1],
  'sauce:sun-tomato':[3,1],'sauce:onion':[4,1],'sauce:pickle':[5,1],
  'extra:turkey':[0,2],'extra:beef':[1,2],'extra:salmon':[2,2],
  'extra:tuna':[3,2],'extra:tomato':[4,2],'extra:avocado':[5,2],
  'greens:rocket':[0,3],'greens:lettuce':[1,3],'extra:cucumber':[2,3],'greens:dill':[3,3],
  'greens:mint':[4,3],'bread:purple-carrot':[5,3]
};
export const visualSource=(stepId,itemId)=>ingredientAtlas[stepId+':'+itemId]?'ai':breadImages[itemId]&&stepId==='bread'?'miora':'symbol';
const itemVisual=(step,item,getPhoto)=>{
  const key=step.id+':'+item.id;
  const id=step.id==='bread'?breadImages[item.id]:null;
  const photo=id&&(id==='431178'?'assets/products/431178.jpg':getPhoto(id));
  if(photo)return '<img class="kiosk-option-photo" src="'+esc(photo)+'" width="66" height="66" loading="lazy" decoding="async" alt="">';
  const point=ingredientAtlas[key];
  if(point){
    const x=(point[0]*20).toFixed(2),y=(point[1]*100/3).toFixed(2);
    return '<span class="kiosk-option-photo kiosk-atlas" aria-hidden="true" style="background-position:'+x+'% '+y+'%"></span>';
  }
  return '<span class="kiosk-option-glyph" aria-hidden="true">'+(glyphs[item.id]||'✳')+'</span>';
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
  const v=k=>showcaseCopy[lang()][k]||showcaseCopy.tr[k]||k;
  const title=v=>localized(v,lang());
  const label=price=>money(price);
  const recipeImg=(r)=>{
    const url=r.image&&getPhoto(r.image);
    return url?'<img src="'+esc(url)+'" loading="lazy" decoding="async" alt="">':
      '<div class="kiosk-placeholder" aria-hidden="true">m<span>✳</span></div>';
  };
  function renderStrip(){
    const top=document.getElementById('hero-kiosk-cta');
    if(top){top.innerHTML=esc(v('heroButton'))+' <span aria-hidden="true">→</span>';top.setAttribute('aria-label',v('heroTitle'));}
    const featured='assets/sandwich-salmon.webp';
    const hero='<div class="kiosk-feature"><img src="'+featured+'" alt="" loading="lazy" decoding="async" class="kiosk-feature-photo">'+
      '<div class="kiosk-feature-content"><span class="kiosk-feature-tag">'+esc(v('heroTag'))+'</span>'+
      '<h3>'+esc(v('heroTitle'))+'</h3><p>'+esc(v('heroBody'))+'</p>'+
      '<button type="button" class="kiosk-feature-button" data-k-start="sandwich">'+esc(v('heroButton'))+' <span aria-hidden="true">→</span></button></div></div>';
    const ideas='<div class="kiosk-idea-head"><div><h4>'+esc(v('ideas'))+'</h4><p>'+esc(v('ideasNote'))+'</p></div></div>'+
      '<div class="kiosk-idea-list" role="list">'+sandwichIdeas.map(idea=>{
        const words=localizedIdea(idea,lang());
        return '<div class="kiosk-idea" role="listitem"><button type="button" data-k-idea="'+idea.id+'" aria-label="'+esc(words.name+' · '+v('configure'))+'">'+
          '<img src="assets/sandwich-'+idea.id+'.webp" alt="" loading="lazy" decoding="async" width="220" height="147">'+
          '<span class="kiosk-idea-name">'+esc(words.name)+'</span><small>'+esc(words.desc)+'</small>'+
          '<span class="kiosk-idea-action">'+esc(v('configure'))+' →</span></button></div>';
      }).join('')+'</div>';
    const other=Object.entries(recipes).filter(([kind])=>kind!=='sandwich').map(([kind,r])=>'<button type="button" class="kiosk-entry" data-k-start="'+kind+'">'+
      '<span class="kiosk-entry-image">'+recipeImg(r)+'</span><span class="kiosk-entry-copy"><b>'+esc(title(r.name))+'</b><small>'+esc(title(r.short))+'</small><strong>'+esc(t('from'))+' '+esc(label(r.steps.length?orderPrice(kind,initialSelection(kind)):r.price))+'</strong></span>'+
      '<span class="kiosk-entry-arrow" aria-hidden="true">↗</span></button>').join('');
    strip.innerHTML=hero+ideas+'<p class="kiosk-feature-disclosure">'+esc(v('photoNote'))+'</p>'+
      '<div class="kiosk-intro"><div><p class="eyebrow">'+esc(t('kicker'))+'</p><h3>'+esc(t('title'))+'</h3><p>'+esc(t('subtitle'))+'</p></div></div>'+
      '<div class="kiosk-entry-list">'+other+'</div>';
  }
  function open(kind,seedBread,existing=null,lineIndex=null,idea=null){
    if(!Object.hasOwn(recipes,kind))return;
    lastFocus=document.activeElement;current=kind;
    selection=existing?structuredClone(existing):idea?ideaSelection(idea):initialSelection(kind);
    index=(existing||idea)?recipes[kind].steps.length:0;
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
    const preview=current==='sandwich'?previewForSelection(selection):null;
    const previewMedia=preview
      ?(preview.src?'<img src="'+esc(preview.src)+'" alt="" loading="lazy" decoding="async" width="900" height="600">'
        :'<span class="kiosk-empty-photo" aria-hidden="true">miora</span>'):'';
    const ingredientChips=preview?selectedIngredients(selection,lang()).map(item=>'<span class="kiosk-selected-chip">'+esc(item)+'</span>').join(''):'';
    const stepsTotal=n+1;
    const stepLabel=t('step')+' '+(index+1)+' '+t('of')+' '+stepsTotal;
    const dots=Array.from({length:stepsTotal},(_,i)=>'<span class="'+(i<=index?'is-active':'')+'"></span>').join('');
    const choices=step?'<div class="kiosk-choices" role="group" aria-label="'+esc(title(step.title))+'">'+step.items.map(item=>{
      const selected=selection[step.id].includes(item.id);
      return '<button type="button" class="kiosk-option'+(selected?' selected':'')+'" data-k-choice="'+esc(item.id)+'" aria-pressed="'+String(selected)+'">'+
        itemVisual(step,item,getPhoto)+'<span class="kiosk-option-content"><strong>'+esc(title(item.label))+'</strong>'+
        (item.price?'<small>+'+esc(label(item.price))+'</small>':'')+'</span><span class="kiosk-check" aria-hidden="true">'+(selected?'✓':'')+'</span></button>';
    }).join('')+'</div>':'';
    const summary=review?'<div class="kiosk-review"><div class="kiosk-review-heading"><span class="kiosk-review-photo">'+(current==='sandwich'?previewMedia:photo)+'</span><div>'+
      '<p class="eyebrow">'+esc(p('finish'))+'</p><h2>'+esc(title(r.name))+'</h2><p>'+esc(title(r.short))+'</p></div></div>'+
      (current==='sandwich'?'<figure class="kiosk-finished'+(preview.baseOnly?' kiosk-finished-base':'')+'">'+previewMedia+
        '<figcaption><strong>'+esc(preview.baseOnly?v('basePreview'):v('preview'))+'</strong>'+
        '<span>'+esc(preview.baseOnly?v('baseOnlyCopy'):v('photoNote'))+'</span>'+
        '<span class="kiosk-selected-title">'+esc(v('exactIngredients'))+'</span>'+
        '<div class="kiosk-selected-chips" role="list" aria-label="'+esc(v('exactIngredients'))+'">'+ingredientChips+'</div>'+
        (preview.baseOnly?'<button type="button" class="kiosk-pick-filling" data-k-goto="3">'+esc(v('pickFilling'))+' →</button>':'')+
        '</figcaption></figure>':'')+
      (r.imageIsBase?'<p class="kiosk-photo-note">'+esc(p('baseImage'))+'</p>':'')+
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
      choices+
      (step.items.some(item=>visualSource(step.id,item.id)==='ai')?'<p class="kiosk-ai-note">'+esc(p('aiNote'))+'</p>':'')+
      (index===0&&r.estimated?'<p class="kiosk-note">'+esc(title(r.note))+'</p>':'');
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
    const idea=e.target.closest('[data-k-idea]');
    if(idea)open('sandwich',null,null,null,idea.dataset.kIdea);
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

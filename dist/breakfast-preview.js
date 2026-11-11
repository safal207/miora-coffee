// Breakfast image & copy contracts: real menu photos remain the fallback. 
// Generated art exists for two valid base+egg combinations only; never imply a
// different selection visually is an exact product photograph.
import {recipes,localized} from './kiosk-data.js';
export const breakfastIdeas=[
  {id:'large-omelette',base:'large',egg:'omelette'},
  {id:'bread-boiled',base:'bread',egg:'boiled'},
  {id:'mini-omelette',base:'mini',egg:'omelette'}
];
export const breakfastIdeaSelection=id=>{
  const idea=breakfastIdeas.find(x=>x.id===id);
  if(!idea)return null;
  return Object.fromEntries(recipes.breakfast.steps.map(step=>[
    step.id,step.id==='base'?[idea.base]:step.id==='egg'?[idea.egg]:[]
  ]));
};
export const breakfastVisualForSelection=selection=>{
  const base=selection?.base?.[0]||null;
  const egg=selection?.egg?.[0]||null;
  const key=base&&egg?base+':'+egg:'generic';
  const illustration={
    'large:omelette':'assets/breakfast-large-omelette-ai.webp',
    'bread:boiled':'assets/breakfast-bread-boiled-ai.webp'
  }[key]||null;
  return {key,src:illustration,isAI:Boolean(illustration),fallbackProductId:'431203'};
};
export const breakfastSelectedIngredients=(selection,lang='tr')=>{
  const language=['tr','ru','en'].includes(lang)?lang:'tr';
  return recipes.breakfast.steps.flatMap(step=>{
    const ids=selection?.[step.id]||[];
    return Array.isArray(ids)?ids.map(id=>step.items.find(x=>x.id===id))
      .filter(Boolean).map(x=>localized(x.label,language)):[];
  });
};
export const breakfastCopy={
 tr:{tag:'KAHVALTI · MIORA',title:'Kendi kahvaltını hazırla',body:'Kruvasan veya ekmek, omlet veya haşlanmış yumurta. Tabağını istediğin gibi seç.',cta:'Kahvaltımı hazırlayayım',ideas:'Güne nasıl başlayalım?',ready:'Kahvaltın neredeyse hazır',intro:'Güne lezzetli bir başlangıç',live:'Kahvaltın şekilleniyor',ai:'Bu fotoğraf yapay zekâ ile hazırlanmış servis örneğidir; birebir ürün fotoğrafı değildir.',real:'Miora menüsünden genel tabak fotoğrafı. Seçiminiz birebir aynı görünmeyebilir.',included:'Tabağa dahil olanlar',exact:'Seçtiğin seçenekler',cart:'Senin Miora kahvaltın',promise:'Tam senin zevkine göre'},
 ru:{tag:'ЗАВТРАК · MIORA',title:'Собери свой завтрак',body:'Круассан или хлеб, омлет или варёное яйцо. Утро по твоему вкусу.',cta:'Собрать завтрак',ideas:'С чего начать утро?',ready:'Твой завтрак почти готов',intro:'Вкусное начало утра',live:'Твой завтрак собирается',ai:'AI-визуализация сервировки, а не фотография конкретного заказа. Состав смотри ниже.',real:'Общая фотография завтрака из меню Miora. Твоя комплектация может отличаться.',included:'Что входит в тарелку',exact:'Твой выбор',cart:'Твой завтрак Miora',promise:'Собрано по твоему вкусу'},
 en:{tag:'BREAKFAST · MIORA',title:'Build your breakfast',body:'Croissant or bread, omelette or boiled egg. Start the day your way.',cta:'Build my breakfast',ideas:'Your kind of morning',ready:'Your breakfast is almost ready',intro:'A delicious morning begins here',live:'Your breakfast is taking shape',ai:'AI-generated serving illustration, not a photo of the exact order. See the selected ingredients below.',real:'Generic Miora menu breakfast photo. Your chosen plate may look different.',included:'Included in your plate',exact:'Your selections',cart:'Your Miora breakfast',promise:'Made for your morning'}
};
export const localizedBreakfastIdea=(idea,lang='tr')=>{
 const selection=breakfastIdeaSelection(idea.id);
 return selection?breakfastSelectedIngredients(selection,lang).join(' · '):'';
};

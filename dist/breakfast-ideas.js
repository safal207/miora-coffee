// Three guest-friendly starting points using ONLY confirmed choices on Miora's breakfast menu.
// These are inspiration presets, not promoted as bestsellers and not additional saleable items.
import {recipes} from './kiosk-data.js';

const L=(tr,ru,en)=>({tr,ru,en});
export const breakfastIdeas=Object.freeze([
  {id:'croissant-omelette',icon:'🥐',name:L('Kruvasanlı omlet','Круассан и омлет','Croissant & omelette'),
   caption:L('Büyük kruvasan · omlet','Большой круассан · омлет','Large croissant · omelette'),
   selection:{base:['large'],egg:['omelette'],sweet:[],addons:[]}},
  {id:'mini-egg',icon:'🥚',name:L('Mini kruvasan & yumurta','Мини-круассан и яйцо','Mini croissant & egg'),
   caption:L('Mini kruvasan · haşlanmış yumurta','Мини-круассан · варёное яйцо','Mini croissant · boiled egg'),
   selection:{base:['mini'],egg:['boiled'],sweet:[],addons:[]}},
  {id:'bread-omelette',icon:'🍞',name:L('Ekmekli kahvaltı','Завтрак с хлебом','Bread breakfast'),
   caption:L('Dilim ekmek · omlet','Хлеб · омлет','Sliced bread · omelette'),
   selection:{base:['bread'],egg:['omelette'],sweet:[],addons:[]}}
]);
export const breakfastIdeaSelection=id=>{
  const preset=breakfastIdeas.find(x=>x.id===id);
  if(!preset)return null;
  return Object.fromEntries(recipes.breakfast.steps.map(step=>[step.id,[...(preset.selection[step.id]||[])]]));
};
export const breakfastChoiceLabels=(selection,lang='tr')=>{
  const language=['tr','ru','en'].includes(lang)?lang:'tr';
  return recipes.breakfast.steps.flatMap(step=>{
    const ids=selection?.[step.id];if(!Array.isArray(ids))return [];
    return ids.map(id=>step.items.find(item=>item.id===id)).filter(Boolean)
      .map(item=>item.label[language]||item.label.tr);
  });
};
export const breakfastIdeaText=(idea,lang='tr')=>({
  name:idea.name[lang]||idea.name.tr,
  caption:idea.caption[lang]||idea.caption.tr
});

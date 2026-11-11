// Illustrative photos are keyed to the main filling, never to price or paid popularity.
// They are NOT a pixel-perfect depiction of arbitrary combinations.
import {recipes} from './kiosk-data.js';
const L=(tr,ru,en)=>({tr,ru,en});
const row=(id,name,desc,sel)=>({id,name:L(...name),desc:L(...desc),selection:sel});
export const sandwichIdeas=[
  row('salmon',['Somon & avokado','Лосось и авокадо','Salmon & avocado'],['Focaccia · labne · avokado · roka','Фокачча · лабне · авокадо · руккола','Focaccia · labneh · avocado · rocket'],{
    bread:['focaccia'],cheese:['labne'],sauce:['avocado-mousse'],extra:['salmon'],greens:['rocket','dill']
  }),
  row('turkey',['Hindi & pesto','Индейка и песто','Turkey & pesto'],['Tam buğday · cheddar · pesto','Цельнозерновой · чеддер · песто','Wholegrain · cheddar · pesto'],{
    bread:['wholewheat'],cheese:['cheddar'],sauce:['pesto'],extra:['turkey'],greens:['lettuce']
  }),
  row('beef',['Dana & cheddar','Говядина и чеддер','Beef & cheddar'],['Domatesli ekmek · cheddar · roka','Хлеб с томатами · чеддер · руккола','Tomato-walnut bread · cheddar · rocket'],{
    bread:['tomato-walnut'],cheese:['cheddar'],sauce:['sun-tomato','onion'],extra:['beef'],greens:['rocket']
  }),
  row('tuna',['Ton balığı & yeşillik','Тунец и зелень','Tuna & greens'],['Tam buğday · süzme peynir · turşu','Цельнозерновой · сливочный сыр · корнишоны','Wholegrain · cream cheese · pickles'],{
    bread:['wholewheat'],cheese:['strained'],sauce:['pickle'],extra:['tuna'],greens:['lettuce','parsley']
  }),
  row('veggie',['Sebzeli & labne','Овощной с лабне','Veggie & labneh'],['Sade ekmek · köz biber · yeşillik','Классический хлеб · печёный перец · зелень','Plain bread · roasted pepper · greens'],{
    bread:['plain'],cheese:['labne'],sauce:['roasted-pepper'],extra:['tomato'],greens:['rocket','lettuce']
  })
];
const types=new Set(sandwichIdeas.map(x=>x.id));
const files=Object.freeze(Object.fromEntries(sandwichIdeas.map(x=>[x.id,'assets/sandwich-'+x.id+'.webp'])));
export const photoForFilling=(selection)=>{
  const id=selection?.extra?.[0];
  return types.has(id)?id:'veggie';
};
export const previewForSelection=(selection)=>{
  const kind=photoForFilling(selection);
  return {kind,src:files[kind],illustrative:true};
};
export const ideaSelection=id=>{
  const found=sandwichIdeas.find(x=>x.id===id);
  if(!found)return null;
  return Object.fromEntries(recipes.sandwich.steps.map(step=>[step.id,[...found.selection[step.id]]]));
};
export const localizedIdea=(idea,lang='tr')=>({
  name:idea.name[lang]||idea.name.tr,
  desc:idea.desc[lang]||idea.desc.tr
});

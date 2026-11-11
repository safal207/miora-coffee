import {validSelection} from './kiosk-core.js';

const L=(tr,ru,en)=>({tr,ru,en});
const make=(id,photo,name,tag,selection)=>({id,photo,name:L(...name),tag:L(...tag),selection});
export const sandwichPresets=Object.freeze([
  make('salmon','salmon',['Somon & Avokado','Лосось и авокадо','Salmon & avocado'],['Ferahlık ve lezzet','Нежный и свежий','Fresh & creamy'],
    {bread:['focaccia'],cheese:['labne'],sauce:['avocado-mousse'],extra:['salmon'],greens:['rocket','dill']}),
  make('turkey','turkey',['Hindi & Pesto','Индейка и песто','Turkey & pesto'],['Doyurucu seçim','Сытный выбор','A satisfying bite'],
    {bread:['wholewheat'],cheese:['cheddar'],sauce:['pesto'],extra:['turkey'],greens:['lettuce']}),
  make('beef','beef',['Dana & Cheddar','Говядина и чеддер','Beef & cheddar'],['Güçlü lezzet','Насыщенный вкус','Bold flavours'],
    {bread:['plain'],cheese:['cheddar'],sauce:['sun-tomato'],extra:['beef'],greens:['rocket']}),
  make('tuna','tuna',['Ton Balığı & Labne','Тунец и лабне','Tuna & labneh'],['Hafif bir mola','Лёгкий перекус','A lighter break'],
    {bread:['wholewheat'],cheese:['labne'],sauce:['pickle'],extra:['tuna'],greens:['lettuce']}),
  make('veggie','veggie',['Sebzeli & Krem Peynir','Овощной и сливочный сыр','Veggie & cream cheese'],['Et içermeyen seçenek','Без мяса и рыбы','No meat or fish'],
    {bread:['plain'],cheese:['strained'],sauce:['roasted-pepper'],extra:['tomato'],greens:['rocket','lettuce']})
]);
export const photoPositions=Object.freeze({
  salmon:{x:0,y:0},turkey:{x:50,y:0},beef:{x:100,y:0},tuna:{x:0,y:100},veggie:{x:50,y:100}
});
export const photoStyle=profile=>{
  const position=photoPositions[profile];
  return position?'background-position:'+position.x+'% '+position.y+'%':'';
};
export const selectionForPreset=id=>{
  const preset=sandwichPresets.find(x=>x.id===id);
  if(!preset||!validSelection('sandwich',preset.selection))return null;
  return Object.fromEntries(Object.entries(preset.selection).map(([k,values])=>[k,[...values]]));
};
export const sameSelection=(a,b)=>{
  if(!a||!b)return false;
  const fields=['bread','cheese','sauce','extra','greens'];
  return fields.every(key=>Array.isArray(a[key])&&Array.isArray(b[key])&&
    a[key].length===b[key].length&&[...a[key]].sort().join('|')===[...b[key]].sort().join('|'));
};
/** A photo is an illustrative sample, never claimed to be a rendering of each ingredient. */
export function previewForSelection(selection){
  if(!validSelection('sandwich',selection))return null;
  const exact=sandwichPresets.find(p=>sameSelection(p.selection,selection));
  if(exact)return {profile:exact.photo,exactPreset:true};
  const filling=selection.extra?.[0]||null;
  if(['salmon','turkey','beef','tuna'].includes(filling))return {profile:filling,exactPreset:false};
  const hasOtherIngredients=['cheese','sauce','extra','greens'].some(k=>(selection[k]||[]).length>0);
  return hasOtherIngredients?{profile:'veggie',exactPreset:false}:null;
}

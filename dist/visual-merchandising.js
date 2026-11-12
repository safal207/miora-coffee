// Source-level photo reuse: text differentiates real recipe identities without inventing toppings.
import {photoSources} from './photo-data.js';
// Distinct, existing menu photos make the category circles easy to tell apart.
export const storyCoverIds=Object.freeze({
 featured:'428748',all:'430350',
 '46776':'428974','46810':'429264','46814':'429390','46817':'429436',
 '46818':'430226','47037':'431453','50454':'460119','46885':'430236'
});
const literal={"428743":["Americano","Американо","Americano"],"428748":["Klasik latte","Классический латте","Classic latte"],"428759":["Çikolatalı","Шоколад","Chocolate"],"428787":["Karamel","Карамель","Caramel"],"428961":["Cortado","Кортадо","Cortado"],"428974":["Tek shot","Один шот","Single shot"],"428976":["Çift shot","Двойной шот","Double shot"],"428977":["Filtre kahve","Фильтр-кофе","Filter coffee"],"428979":["Flat white","Флэт уайт","Flat white"],"428981":["Fındık","Фундук","Hazelnut"],"428985":["Lotus sosu","Lotus","Lotus sauce"],"429151":["Vanilya","Ваниль","Vanilla"],"429233":["Beyaz çikolata","Белый шоколад","White chocolate"],"429239":["Tuzlu karamel","Солёная карамель","Salted caramel"],"429243":["Vanilya + karamel","Ваниль + карамель","Vanilla + caramel"],"429244":["Balkabağı + tarçın","Тыква + корица","Pumpkin + cinnamon"],"429252":["Buzlu americano","Айс-американо","Iced Americano"],"429271":["Soğuk mocha","Айс-мокка","Iced mocha"],"429277":["Tuzlu karamel","Солёная карамель","Salted caramel"],"429282":["Karamel","Карамель","Caramel"],"429286":["Fındık","Фундук","Hazelnut"],"429287":["Vanilya","Ваниль","Vanilla"],"429294":["Soğuk demleme","Холодное заваривание","Cold brew"],"429301":["Klasik matcha","Классическая матча","Classic matcha"],"429303":["Şuruplu matcha","Матча с сиропом","Syrup matcha"],"430236":["Tam buğday","Цельнозерновой","Wholegrain"],"431178":["Sade ekşi maya","Классическая закваска","Plain sourdough"]};
const labels=Object.freeze(Object.fromEntries(Object.entries(literal).map(([id,names])=>[id,{tr:names[0],ru:names[1],en:names[2]}])));
export const identityFor=(item,lang='tr')=>{
 const label=labels[item?.id];
 return label?(label[lang]||label.tr):null;
};
export const isSharedPhotoVariant=item=>Boolean(labels[item?.id]);
export const visualSourceOf=item=>photoSources[item.id]||item.id;
// Preserves every item and its relative order wherever possible, but avoids
// back-to-back duplicated photo sources in an explicitly browsed category.
// Do not run on search results, favorites or a personalized ranking.
export function diversifyPhotoOrder(items,getSource=visualSourceOf){
 const pending=[...items],ordered=[];let previous=null;
 while(pending.length){
  const alternative=pending.findIndex(item=>getSource(item)!==previous);
  const idx=alternative>=0?alternative:0;
  const [item]=pending.splice(idx,1);
  ordered.push(item);previous=getSource(item);
 }
 return ordered;
}

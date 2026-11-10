import {recipes,localized} from './kiosk-data.js';
export const initialSelection=kind=>{
  const recipe=Object.hasOwn(recipes,kind)?recipes[kind]:null;if(!recipe)return null;
  return Object.fromEntries(recipe.steps.map(step=>[step.id,step.min===1?[step.items[0].id]:[]]));
};
export function choose(selection,step,itemId){
  const ids=Array.isArray(selection?.[step.id])?selection[step.id]:[];
  if(!step.items.some(option=>option.id===itemId))return selection;
  if(step.max===1)return {...selection,[step.id]:[itemId]};
  if(ids.includes(itemId))return {...selection,[step.id]:ids.filter(id=>id!==itemId)};
  if(ids.length>=step.max)return selection;
  return {...selection,[step.id]:[...ids,itemId]};
}
export function validSelection(kind,selection){
  const r=Object.hasOwn(recipes,kind)?recipes[kind]:null;if(!r||!selection||typeof selection!=='object'||Array.isArray(selection))return false;
  if(Object.keys(selection).some(key=>!r.steps.some(s=>s.id===key)))return false;
  return r.steps.every(step=>{
    const ids=selection[step.id];return Array.isArray(ids)&&ids.length>=step.min&&ids.length<=step.max&&new Set(ids).size===ids.length&&ids.every(id=>step.items.some(o=>o.id===id));
  });
}
export function orderPrice(kind,selection){
  if(!validSelection(kind,selection))return null;
  const r=recipes[kind];
  return r.price+r.steps.reduce((n,step)=>n+selection[step.id].reduce((sum,id)=>sum+step.items.find(o=>o.id===id).price,0),0);
}
export const orderKey=(kind,selection)=>kind+':'+recipes[kind].steps.map(s=>s.id+'='+[...(selection[s.id]||[])].sort().join(',')).join('|');
export function makeOrder(kind,selection,qty=1){
  const price=orderPrice(kind,selection);
  if(price===null||!Number.isInteger(qty)||qty<1||qty>99)return null;
  const copied=Object.fromEntries(recipes[kind].steps.map(s=>[s.id,[...selection[s.id]]]));
  return {kind,selection:copied,qty};
}
export function normalizeOrders(value){
  if(!Array.isArray(value))return [];
  const result=[];
  for(const row of value.slice(0,100)){
    const item=makeOrder(row?.kind,row?.selection,row?.qty);
    if(!item)continue;
    const match=result.find(x=>orderKey(x.kind,x.selection)===orderKey(item.kind,item.selection));
    if(match)match.qty=Math.min(99,match.qty+item.qty);
    else result.push(item);
  }
  return result;
}
export function appendOrder(existing,raw){
  const item=makeOrder(raw?.kind,raw?.selection,1);if(!item)return null;
  const orders=normalizeOrders(existing),key=orderKey(item.kind,item.selection);
  const match=orders.find(row=>orderKey(row.kind,row.selection)===key);
  if(match){if(match.qty>=99)return null;match.qty+=1;}
  else {if(orders.length>=100)return null;orders.push(item);}
  return orders;
}
export function changeOrderQty(existing,index,delta){
  const orders=normalizeOrders(existing);
  if(!Number.isInteger(index)||index<0||index>=orders.length||![-1,1].includes(delta))return orders;
  const n=orders[index].qty+delta;
  if(n<=0)orders.splice(index,1);else if(n<=99)orders[index].qty=n;
  return orders;
}
export function configuredTotals(orders){
  return normalizeOrders(orders).reduce((sum,item)=>({count:sum.count+item.qty,price:sum.price+item.qty*orderPrice(item.kind,item.selection)}),{count:0,price:0});
}
export function describeOrder(order,lang='tr'){
  if(!makeOrder(order?.kind,order?.selection,order?.qty))return '';
  const r=recipes[order.kind];
  const lines=r.steps.map(step=>{
    const values=order.selection[step.id].map(id=>localized(step.items.find(o=>o.id===id).label,lang));
    return values.length?localized(step.title,lang)+': '+values.join(', '):null;
  }).filter(Boolean);
  return [localized(r.name,lang),...lines].join(' · ');
}

// Explicit saved order list. No purchase history, checkout or server-side identity.
import {normalizeCart,totals} from './core.js';
import {normalizeOrders,configuredTotals,orderKey} from './kiosk-core.js';

export const USUAL_STORAGE_KEY='miora:usual-order:v1';
const maxConfigured=100;

export function snapshotUsual({cart={},configuredOrders=[]}={},catalog){
  if(!(catalog instanceof Map))return null;
  const safeCart=normalizeCart(cart,catalog);
  const safeOrders=normalizeOrders(configuredOrders);
  if(!Object.keys(safeCart).length&&!safeOrders.length)return null;
  return {version:1,cart:safeCart,configuredOrders:safeOrders};
}
export function readUsual(storage,catalog){
  try{
    const input=JSON.parse(storage?.getItem(USUAL_STORAGE_KEY)||'null');
    if(input?.version!==1||!input.cart||!Array.isArray(input.configuredOrders))return null;
    return snapshotUsual(input,catalog);
  }catch{return null;}
}
/** Save only after the user clicks Save; existing order remains untouched. */
export function saveUsual(storage,order,catalog){
  const snapshot=snapshotUsual(order,catalog);
  if(!snapshot)return false;
  try{
    if(typeof storage?.setItem!=='function')return false;
    storage.setItem(USUAL_STORAGE_KEY,JSON.stringify(snapshot));
    return true;
  }catch{return false;}
}
export function forgetUsual(storage){
  try{
    if(typeof storage?.removeItem!=='function')return false;
    storage.removeItem(USUAL_STORAGE_KEY);
    return true;
  }catch{return false;}
}
export function usualTotals(saved,catalog){
  if(!saved)return {count:0,price:0};
  const regular=totals(saved.cart,catalog),configured=configuredTotals(saved.configuredOrders);
  return {count:regular.count+configured.count,price:regular.price+configured.price};
}
/** Atomic, all-or-nothing merge. NEVER silently drop a chosen line when limits hit. */
export function appendUsual(current,saved,catalog){
  const a=snapshotUsual(current,catalog);
  const b=snapshotUsual(saved,catalog);
  if(!b)return null;
  const nextCart={...(a?.cart||{})};
  for(const [id,quantity] of Object.entries(b.cart)){
    const next=(nextCart[id]||0)+quantity;
    if(next>99)return null;
    nextCart[id]=next;
  }
  const nextOrders=(a?.configuredOrders||[]).map(row=>({...row,selection:Object.fromEntries(Object.entries(row.selection).map(([k,v])=>[k,[...v]]))}));
  const byKey=new Map(nextOrders.map((row,index)=>[orderKey(row.kind,row.selection),index]));
  for(const row of b.configuredOrders){
    const key=orderKey(row.kind,row.selection);
    if(byKey.has(key)){
      const present=nextOrders[byKey.get(key)];
      if(present.qty+row.qty>99)return null;
      present.qty+=row.qty;
    }else{
      if(nextOrders.length>=maxConfigured)return null;
      byKey.set(key,nextOrders.length);
      nextOrders.push({...row,selection:Object.fromEntries(Object.entries(row.selection).map(([k,v])=>[k,[...v]]))});
    }
  }
  return {cart:nextCart,configuredOrders:nextOrders};
}

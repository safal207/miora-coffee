import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../dist/menu-data.js';
import {initialSelection} from '../dist/kiosk-core.js';
import {USUAL_STORAGE_KEY,snapshotUsual,readUsual,saveUsual,forgetUsual,usualTotals,appendUsual} from '../dist/usual-order.js';

const catalog=new Map(products.map(p=>[p.id,p]));
const storage=()=>{const map=new Map();return {getItem:key=>map.get(key)??null,setItem:(key,val)=>map.set(key,String(val)),removeItem:key=>map.delete(key)};};
const sample={cart:{'428748':2,'430350':1},configuredOrders:[]};

test('no implicit history: save requires a nonempty user-chosen list',()=>{
 const store=storage();
 assert.equal(readUsual(store,catalog),null);
 assert.equal(saveUsual(store,{cart:{},configuredOrders:[]},catalog),false);
 assert.equal(store.getItem(USUAL_STORAGE_KEY),null);
 assert.equal(saveUsual(store,sample,catalog),true);
 assert.deepEqual(readUsual(store,catalog),{version:1,...sample});
});
test('saved list contains only source IDs, quantities and valid configured selections',()=>{
 const store=storage();
 const sandwich=initialSelection('sandwich');
 assert(sandwich);
 assert.equal(saveUsual(store,{cart:{'428748':2,'unknown':10},configuredOrders:[{kind:'sandwich',selection:sandwich,qty:2}]},catalog),true);
 const saved=readUsual(store,catalog);
 assert.deepEqual(saved.cart,{'428748':2});
 assert.equal(saved.configuredOrders.length,1);
 assert.equal(saved.configuredOrders[0].qty,2);
 assert.deepEqual(Object.keys(saved).sort(),['cart','configuredOrders','version']);
 assert(!store.getItem(USUAL_STORAGE_KEY).includes('email'));
});
test('repeat adds to existing quantities without modifying either source object',()=>{
 const selected=snapshotUsual(sample,catalog);
 const current={cart:{'428748':3,'428772':1},configuredOrders:[]};
 const before=JSON.stringify(current),savedBefore=JSON.stringify(selected);
 const merged=appendUsual(current,selected,catalog);
 assert.deepEqual(merged.cart,{'428748':5,'428772':1,'430350':1});
 assert.equal(merged.configuredOrders.length,0);
 assert.equal(JSON.stringify(current),before);
 assert.equal(JSON.stringify(selected),savedBefore);
});
test('quantity limit is atomic, refusing whole repeat instead of partially adding',()=>{
 const saved=snapshotUsual(sample,catalog);
 assert.equal(appendUsual({cart:{'428748':98},configuredOrders:[]},saved,catalog),null);
 const sandwich=initialSelection('sandwich');
 const special=snapshotUsual({cart:{'430350':1},configuredOrders:[{kind:'sandwich',selection:sandwich,qty:2}]},catalog);
 assert.equal(appendUsual({cart:{},configuredOrders:[{kind:'sandwich',selection:sandwich,qty:98}]},special,catalog),null);
});
test('customized orders with identical selections merge and preserve their ingredients',()=>{
 const selection=initialSelection('sandwich');
 const custom={kind:'sandwich',selection,qty:2};
 const stored=snapshotUsual({cart:{},configuredOrders:[custom]},catalog);
 assert.equal(stored.configuredOrders.length,1);
 const merged=appendUsual({cart:{'428772':1},configuredOrders:[{...custom,qty:3}]},stored,catalog);
 assert.equal(merged.configuredOrders.length,1);
 assert.equal(merged.configuredOrders[0].qty,5);
 assert.deepEqual(merged.configuredOrders[0].selection,selection);
 assert.equal(merged.cart['428772'],1);
 assert.equal(appendUsual({cart:{},configuredOrders:[]},stored,catalog).configuredOrders[0].qty,2);
});
test('totals always come from current catalog; saved amounts cannot freeze prices',()=>{
 const saved=snapshotUsual(sample,catalog);
 const total=usualTotals(saved,catalog);
 const revised=new Map(catalog),old=revised.get('428748');
 revised.set('428748',{...old,price:old.price+1000});
 assert.equal(usualTotals(saved,revised).price,total.price+2000);
 assert.equal(usualTotals(saved,revised).count,total.count);
});
test('forget removes only the saved list, not current cart or independent taste preferences',()=>{
 const store=storage();
 store.setItem('miora:favorites','["428748"]');
 store.setItem('miora:taste-memory:v1','{"enabled":true,"recent":["428772"]}');
 saveUsual(store,sample,catalog);
 assert.equal(forgetUsual(store),true);
 assert.equal(readUsual(store,catalog),null);
 assert.equal(store.getItem('miora:favorites'),'["428748"]');
 assert.equal(store.getItem('miora:taste-memory:v1'),'{"enabled":true,"recent":["428772"]}');
});
test('malformed versions and unavailable IDs never resurrect stale prices or crash',()=>{
 const store=storage();
 store.setItem(USUAL_STORAGE_KEY,'{oops');
 assert.equal(readUsual(store,catalog),null);
 store.setItem(USUAL_STORAGE_KEY,JSON.stringify({version:99,cart:sample.cart,configuredOrders:[]}));
 assert.equal(readUsual(store,catalog),null);
 store.setItem(USUAL_STORAGE_KEY,JSON.stringify({version:1,cart:{'999999':3,'428748':1},configuredOrders:[]}));
 assert.deepEqual(readUsual(store,catalog)?.cart,{'428748':1});
 store.setItem(USUAL_STORAGE_KEY,JSON.stringify({version:1,cart:{'999999':3},configuredOrders:[]}));
 assert.equal(readUsual(store,catalog),null);
});
test('blocked storage fails safely and never claims an order was saved',()=>{
 const blocked={getItem:()=>{throw Error('blocked');},setItem:()=>{throw Error('blocked');},removeItem:()=>{throw Error('blocked');}};
 assert.equal(saveUsual(blocked,sample,catalog),false);
 assert.equal(forgetUsual(blocked),false);
 assert.equal(readUsual(blocked,catalog),null);
});

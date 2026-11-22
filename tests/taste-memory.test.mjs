import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../dist/menu-data.js';
import {TASTE_STORAGE_KEY,MAX_TASTE_CHOICES,readTasteMemory,setTasteMemoryEnabled,rememberTasteChoice,tasteSuggestions} from '../dist/taste-memory.js';

const catalog=new Map(products.map(item=>[item.id,item]));
function store(){
 const map=new Map();
 return {getItem:key=>map.has(key)?map.get(key):null,setItem:(key,value)=>map.set(key,String(value)),
   removeItem:key=>map.delete(key)};
}
test('no implicit tracking: adding before opt-in never saves taste history',()=>{
 const storage=store();
 assert.deepEqual(readTasteMemory(storage,catalog),{enabled:false,recent:[]});
 assert.equal(rememberTasteChoice(storage,'428748',catalog),false);
 assert.equal(storage.getItem(TASTE_STORAGE_KEY),null);
});
test('opt-in stores only known valid item IDs; repeating a choice moves it to the front',()=>{
 const storage=store();
 assert.equal(setTasteMemoryEnabled(storage,true,catalog),true);
 assert.equal(rememberTasteChoice(storage,'428748',catalog),true);
 assert.equal(rememberTasteChoice(storage,'430350',catalog),true);
 assert.equal(rememberTasteChoice(storage,'428748',catalog),true);
 assert.deepEqual(readTasteMemory(storage,catalog),{enabled:true,recent:['428748','430350']});
 assert.equal(rememberTasteChoice(storage,'somebody@example.com',catalog),false);
 assert.equal(rememberTasteChoice(storage,'431302',catalog),false,'no missing-price items');
 assert.equal(rememberTasteChoice(storage,'999999',catalog),false);
});
test('memory is limited to six valid, deduplicated source menu items',()=>{
 const storage=store();
 setTasteMemoryEnabled(storage,true,catalog);
 for(const id of products.filter(p=>Number.isSafeInteger(p.price)&&p.price>0).slice(0,12).map(p=>p.id))
   assert.equal(rememberTasteChoice(storage,id,catalog),true);
 const memory=readTasteMemory(storage,catalog);
 assert.equal(memory.recent.length,MAX_TASTE_CHOICES);
 assert.equal(new Set(memory.recent).size,MAX_TASTE_CHOICES);
});
test('disable erases recent history while leaving independently saved favorites untouched',()=>{
 const storage=store();
 const favorites=['428748'];
 setTasteMemoryEnabled(storage,true,catalog);
 rememberTasteChoice(storage,'430350',catalog);
 assert.equal(setTasteMemoryEnabled(storage,false,catalog),true);
 assert.equal(storage.getItem(TASTE_STORAGE_KEY),null);
 assert.deepEqual(readTasteMemory(storage,catalog),{enabled:false,recent:[]});
 assert.deepEqual(tasteSuggestions({favorites,memory:readTasteMemory(storage,catalog),catalog}).map(p=>p.id),['428748']);
});
test('favorites come first with genuine source prices, followed by opt-in recent choices',()=>{
 const storage=store();
 setTasteMemoryEnabled(storage,true,catalog);
 rememberTasteChoice(storage,'430350',catalog);
 rememberTasteChoice(storage,'428772',catalog);
 const picks=tasteSuggestions({favorites:new Set(['428748','430350']),memory:readTasteMemory(storage,catalog),catalog});
 assert.deepEqual(picks.map(p=>p.id),['428748','430350','428772']);
 assert.equal(picks[0].price,catalog.get('428748').price);
 assert.deepEqual(tasteSuggestions({favorites:['428748'],memory:{enabled:false,recent:['428772']},catalog}).map(p=>p.id),['428748']);
 assert.deepEqual(tasteSuggestions({favorites:['431302','unknown'],catalog}),[]);
 assert.deepEqual(tasteSuggestions({favorites:['428748'],catalog,limit:0}),[]);
});
test('malformed and stale storage data is sanitized without exceptions',()=>{
 const storage=store();
 storage.setItem(TASTE_STORAGE_KEY,JSON.stringify({enabled:true,recent:['bad','428748','428748','431302','430350']}));
 assert.deepEqual(readTasteMemory(storage,catalog),{enabled:true,recent:['428748','430350']});
 storage.setItem(TASTE_STORAGE_KEY,'{broken');
 assert.deepEqual(readTasteMemory(storage,catalog),{enabled:false,recent:[]});
});
test('blocked storage does not crash menu and cannot be presented as enabled',()=>{
 const blocked={getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');},removeItem:()=>{throw Error('denied');}};
 assert.equal(setTasteMemoryEnabled(blocked,true,catalog),false);
 assert.equal(setTasteMemoryEnabled(blocked,false,catalog),false);
 assert.equal(rememberTasteChoice(blocked,'428748',catalog),false);
 assert.deepEqual(readTasteMemory(blocked,catalog),{enabled:false,recent:[]});
});
test('no contact details, timestamps, prices, or payment assumptions are persisted in Taste Memory',()=>{
 const storage=store();
 setTasteMemoryEnabled(storage,true,catalog);
 rememberTasteChoice(storage,'428748',catalog);
 const state=JSON.parse(storage.getItem(TASTE_STORAGE_KEY));
 assert.deepEqual(Object.keys(state).sort(),['enabled','recent']);
 assert.deepEqual(state.recent,['428748']);
});

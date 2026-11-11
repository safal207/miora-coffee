import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {recipes} from '../dist/kiosk-data.js';
import {initialSelection,choose,orderPrice,validSelection,makeOrder,replaceOrder,changeOrderQty} from '../dist/kiosk-core.js';
import {breakfastIdeas,breakfastIdeaSelection,breakfastVisualForSelection,breakfastSelectedIngredients,breakfastCopy,localizedBreakfastIdea} from '../dist/breakfast-preview.js';

test('all breakfast presets are valid, priced from actual Miora breakfast recipe',()=>{
 assert.equal(breakfastIdeas.length,3);
 const r=recipes.breakfast;
 for(const idea of breakfastIdeas){
  const sel=breakfastIdeaSelection(idea.id);
  assert.ok(validSelection('breakfast',sel),idea.id);
  assert.ok(r.steps[0].items.some(x=>x.id===sel.base[0]));
  assert.ok(r.steps[1].items.some(x=>x.id===sel.egg[0]));
  assert.deepEqual(sel.sweet,[]);
  assert.deepEqual(sel.addons,[]);
  assert.equal(orderPrice('breakfast',sel),r.steps[0].items.find(x=>x.id===idea.base).price);
  for(const lang of ['ru','tr','en']) assert.ok(localizedBreakfastIdea(idea,lang).length);
 }
 assert.equal(breakfastIdeaSelection('fictional'),null);
});

test('every 3x2 breakfast variation has honest photo fallback and no false photo claim',()=>{
 const bread=recipes.breakfast.steps[0].items.map(x=>x.id);
 const eggs=recipes.breakfast.steps[1].items.map(x=>x.id);
 let aiCount=0;
 for(const base of bread)for(const egg of eggs){
  const sel={base:[base],egg:[egg],sweet:[],addons:[]};
  assert.ok(validSelection('breakfast',sel));
  const image=breakfastVisualForSelection(sel);
  assert.equal(image.fallbackProductId,'431203');
  if(image.isAI){
    aiCount++;
    const file=readFileSync('dist/'+image.src);
    assert.equal(file.toString('ascii',0,4),'RIFF');
    assert.equal(file.toString('ascii',8,12),'WEBP');
    assert.ok(file.length<180000,'mobile image must be <= 180 KB');
  }else assert.equal(image.src,null,'unverified combinations must fall back to source menu photo');
 }
 assert.equal(aiCount,2,'only owner-reviewable AI concepts for exact two base+egg combinations');
 assert.equal(breakfastVisualForSelection({base:['mini'],egg:[]}).src,null);
});

test('language, exact included items and prices survive breakfast changes and cart editing',()=>{
 const r=recipes.breakfast;
 for(const lang of ['tr','ru','en']){
   for(const key of ['title','cta','live','ready','ai','real','cart','included','exact']) assert.ok(breakfastCopy[lang][key],lang+' '+key);
 }
 let s=initialSelection('breakfast');
 assert.equal(validSelection('breakfast',s),true);
 assert.equal(orderPrice('breakfast',s),45000);
 s=choose(s,r.steps[0],'bread');
 s=choose(s,r.steps[1],'boiled');
 assert.equal(breakfastVisualForSelection(s).src,'assets/breakfast-bread-boiled-ai.webp');
 assert.ok(breakfastSelectedIngredients(s,'ru').includes('Варёное яйцо'));
 assert.equal(orderPrice('breakfast',s),35000);
 s=choose(s,r.steps[2],'honey');
 s=choose(s,r.steps[3],'mini');
 assert.equal(orderPrice('breakfast',s),39000);
 assert.ok(breakfastSelectedIngredients(s,'ru').includes('Дополнительный мини-круассан'));
 const order=makeOrder('breakfast',s,2);
 const edit=replaceOrder([order],0,{kind:'breakfast',selection:choose(s,r.steps[1],'omelette')});
 assert.equal(edit[0].qty,2);
 assert.ok(validSelection('breakfast',edit[0].selection));
 assert.equal(changeOrderQty(edit,0,-1)[0].qty,1);
});

test('breakfast visual journey is exposed in homepage builder and full-width cart',()=>{
 const kiosk=readFileSync('dist/kiosk.js','utf8');
 const app=readFileSync('dist/app.js','utf8');
 const css=readFileSync('dist/kiosk.css','utf8');
 assert.match(kiosk,/kiosk-breakfast-feature/);
 assert.match(kiosk,/kiosk-breakfast-ideas/);
 assert.match(kiosk,/data-k-breakfast-idea/);
 assert.match(kiosk,/breakfastVisualForSelection\(selection\)/);
 assert.match(kiosk,/breakfastSelectedIngredients\(selection,lang\(\)\)/);
 assert.match(kiosk,/kiosk-breakfast-finished/);
 assert.match(app,/const showFood=sandwich\|\|breakfast/);
 assert.match(app,/const featuredPhoto=showFood&&!staffMode/);
 assert.match(app,/kiosk-cart-breakfast/);
 assert.match(css,/kiosk-breakfast-feature/);
 assert.match(css,/prefers-reduced-motion/);
});

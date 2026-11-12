import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {sandwichIdeas,previewForSelection,photoForFilling,ideaSelection,localizedIdea,selectedIngredients} from '../dist/sandwich-preview.js';
import {recipes} from '../dist/kiosk-data.js';
import {validSelection,orderPrice,initialSelection,choose} from '../dist/kiosk-core.js';

test('five localized ready-to-customize ideas use only permitted Miora options',()=>{
 assert.equal(sandwichIdeas.length,5);
 assert.deepEqual(sandwichIdeas.map(x=>x.id).sort(),['beef','salmon','tuna','turkey','veggie']);
 for(const idea of sandwichIdeas){
   const sel=ideaSelection(idea.id);
   assert.ok(validSelection('sandwich',sel),idea.id+' invalid options');
   assert.equal(orderPrice('sandwich',sel),35000);
   for(const lang of ['ru','tr','en']){
     const words=localizedIdea(idea,lang);
     assert.ok(words.name && words.desc,idea.id+': '+lang);
   }
   const item=sel.extra[0];
   const expected=['salmon','turkey','beef','tuna'].includes(item)?item:'veggie';
   assert.equal(photoForFilling(sel),expected);
 }
 assert.equal(ideaSelection('unknown'),null);
});

test('photo is keyed to actual selected filling, not whatever preset was originally chosen',()=>{
 const salmon=ideaSelection('salmon');
 assert.equal(previewForSelection(salmon).kind,'salmon');
 const withoutSalmon=choose(salmon,recipes.sandwich.steps.find(x=>x.id==='extra'),'tomato');
 assert.equal(previewForSelection(withoutSalmon).kind,'veggie');
 assert.notEqual(previewForSelection(withoutSalmon).src,previewForSelection(salmon).src);
 const turkey=choose(withoutSalmon,recipes.sandwich.steps.find(x=>x.id==='extra'),'turkey');
 assert.equal(previewForSelection(turkey).kind,'turkey');
 assert.equal(previewForSelection({...salmon,extra:[]}).kind,'bread');
 assert.equal(previewForSelection({...salmon,extra:[]}).src,'assets/products/431179.jpg');
 const empty=previewForSelection(initialSelection('sandwich'));
 assert.equal(empty.kind,'bread');
 assert.equal(empty.src,'assets/products/430240.jpg');
 assert.ok(empty.baseOnly);
 assert.ok(empty.illustrative);
 assert.equal(previewForSelection({...salmon,bread:['purple-carrot'],extra:[]}).src,null);
});

test('all five images are valid WebP, bounded size and present in deploy folder',()=>{
 let total=0;
 for(const idea of sandwichIdeas){
   const url=previewForSelection(idea.selection).src;
   const path='dist/'+url;
   const image=readFileSync(path);
   total+=image.length;
   assert.equal(image.toString('ascii',0,4),'RIFF');
   assert.equal(image.toString('ascii',8,12),'WEBP');
   assert.ok(image.length<=90000,'Image too heavy: '+path);
 }
 assert.ok(total<400000,'Previews total too heavy: '+total);
});


test('the first-screen hero exposes an accessible custom sandwich entry point',()=>{
  const html=readFileSync('dist/index.html','utf8');
  const kiosk=readFileSync('dist/kiosk.js','utf8');
  const css=readFileSync('dist/kiosk.css','utf8');
  assert.match(html,/id="hero-kiosk-cta"[^>]*data-k-start="sandwich"/);
  assert.match(kiosk,/getElementById\('hero-kiosk-cta'\)/);
  assert.match(kiosk,/top\.setAttribute\('aria-label',v\('heroTitle'\)\)/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.match(css,/\.hero-actions \.hero-kiosk-btn/);
});

test('final preview shows the exact selected ingredient labels in every supported language',()=>{
 const chosen=ideaSelection('salmon');
 const ru=selectedIngredients(chosen,'ru');
 assert.deepEqual(ru,['Фокачча','Лабне','Мусс из авокадо','Лосось','Руккола','Укроп']);
 assert.ok(selectedIngredients(chosen,'en').includes('Salmon'));
 assert.ok(selectedIngredients(chosen,'tr').includes('Somon balığı'));
 const removed=choose(chosen,recipes.sandwich.steps.find(step=>step.id==='extra'),'tomato');
 assert.ok(!selectedIngredients(removed,'ru').includes('Лосось'));
 assert.ok(selectedIngredients(removed,'ru').includes('Помидор'));
 assert.equal(selectedIngredients({...removed,extra:[]},'ru').includes('Помидор'),false);
 assert.deepEqual(selectedIngredients({bread:['unknown'],extra:['unknown']},'ru'),[]);
});


test('food desire flow retains honest preview while giving sandwich a prominent live and cart photo',()=>{
 const kiosk=readFileSync('dist/kiosk.js','utf8');
 const app=readFileSync('dist/app.js','utf8');
 const css=readFileSync('dist/kiosk.css','utf8');
 for(const k of ['starterInspiration','livePreview','starterBody','liveBody']){
  assert.match(kiosk,new RegExp(k+':'));
 }
 assert.match(kiosk,/const livePreview=\(current==='sandwich'\|\|isBreakfast\)&&!review/);
 assert.match(kiosk,/isStart\?\(isBreakfast\?'assets\/breakfast-large-omelette-ai\.webp':'assets\/sandwich-salmon\.webp'\):preview\.src/);
 assert.match(kiosk,/preview\.baseOnly\?v\('basePreview'\)/);
 assert.match(kiosk,/selectedIngredients\(selection,lang\(\)\)/);
 assert.ok(kiosk.indexOf('livePreview+')<kiosk.indexOf('+choices+'));
 assert.match(kiosk,/\+choices\+/);
 assert.match(app,/const featuredPhoto=showFood&&!staffMode/);
 assert.match(app,/kiosk-cart-showcase/);
 assert.match(app,/kiosk-cart-promise/);
 assert.match(app,/const previewPhoto=breakfast\?/);
 assert.match(app,/visual\?\.src\|\|null/);
 assert.match(app,/staffMode\?' kiosk-cart-staff':''/);
 assert.match(css,/\.kiosk-live-intro/);
 assert.match(css,/\.kiosk-cart-showcase>img/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.match(css,/prefers-reduced-motion/);
});

test('each variant keeps its main filling correctly reflected in all preview destinations',()=>{
 for(const idea of sandwichIdeas){
  const selected=ideaSelection(idea.id);
  const preview=previewForSelection(selected);
  assert.ok(preview.src?.startsWith('assets/sandwich-'));
  assert.equal(preview.baseOnly,false);
  assert.ok(selectedIngredients(selected,'en').length>2);
  const breadOnly={...selected,extra:[]};
  assert.equal(previewForSelection(breadOnly).kind,'bread');
  assert.ok(previewForSelection(breadOnly).baseOnly);
  assert.notEqual(previewForSelection(breadOnly).src,preview.src);
 }
});

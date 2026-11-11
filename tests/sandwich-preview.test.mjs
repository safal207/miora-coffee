import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {sandwichIdeas,previewForSelection,photoForFilling,ideaSelection,localizedIdea} from '../dist/sandwich-preview.js';
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
 assert.equal(previewForSelection({...salmon,extra:[]}).kind,'veggie');
 assert.equal(previewForSelection(initialSelection('sandwich')).kind,'veggie');
 assert.ok(previewForSelection(initialSelection('sandwich')).illustrative);
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

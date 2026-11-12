import test from 'node:test';
import assert from 'node:assert/strict';
import {products,categories,featured} from '../dist/menu-data.js';
import {desireSections,journeys,journeyCopy} from '../dist/desire-journey.js';
test('every desire path preserves each source product exactly once in its real category',()=>{
 for(const cat of categories){
  const items=products.filter(p=>p.cat===cat.id),groups=desireSections(items,{category:cat.id,categories});
  const ids=groups.flatMap(g=>g.items.map(p=>p.id));
  assert.equal(ids.length,items.length);assert.equal(new Set(ids).size,items.length);
  assert.deepEqual([...ids].sort(),items.map(p=>p.id).sort());
  for(const g of journeys[cat.id])for(const lang of ['ru','tr','en'])assert.ok(g.title[lang]);
 }
 const all=desireSections(products,{category:'all',categories}).flatMap(g=>g.items.map(p=>p.id));
 assert.equal(all.length,93);assert.equal(new Set(all).size,93);
});
test('search, saved items and featured results retain their exact memberships and order',()=>{
 const picked=[products[6],products[2],products[0]];
 for(const config of [{category:'favorites'},{category:'featured'},{category:'all',search:'coffee'}]){
  assert.deepEqual(desireSections(picked,config).flatMap(g=>g.items),picked);
 }
 const future={id:'future-item',cat:'46818'};
 assert.ok(desireSections([future],{category:'46818'}).flatMap(g=>g.items).includes(future));
 for(const lang of ['ru','tr','en'])assert.ok(journeyCopy[lang].noPhoto&&journeyCopy[lang].add);
});

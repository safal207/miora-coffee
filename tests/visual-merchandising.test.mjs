import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {products,categories,featured} from '../dist/menu-data.js';
import {hasPhoto,photoUrl} from '../dist/photos.js';
import {photoSources,photoPlaceholders} from '../dist/photo-data.js';
import {identityFor,isSharedPhotoVariant,diversifyPhotoOrder,visualSourceOf,storyCoverIds} from '../dist/visual-merchandising.js';

test('every story circle has a distinct real photo matching its category',()=>{
 const categoryIds=['featured','all',...categories.map(c=>c.id)];
 const urls=categoryIds.map(category=>{
  const item=products.find(p=>p.id===storyCoverIds[category]);
  assert.ok(item&&hasPhoto(item),category);
  if(category==='featured')assert.ok(featured.includes(item.id));
  else if(category!=='all')assert.equal(item.cat,category);
  return photoUrl(item,160);
 });
 assert.equal(new Set(urls).size,categoryIds.length,'no reused source photos between circles');
});

test('only verified reused product photo sources have truthful multilingual flavor tags',()=>{
 const groups={};
 for(const p of products)(groups[visualSourceOf(p)]??=[]).push(p);
 const repeated=Object.values(groups).filter(items=>items.length>1&&items[0].id!=='placeholder');
 assert.equal(repeated.length,9,'nine reused photo source groups');
 assert.equal(repeated.flat().length,27,'27 reused-photo products');
 for(const p of repeated.flat()){
  assert.ok(isSharedPhotoVariant(p),p.id);
  for(const lang of ['ru','tr','en'])assert.ok(identityFor(p,lang)?.length,p.id+' '+lang);
 }
 for(const p of products.filter(x=>photoPlaceholders.includes(x.id)))assert.equal(identityFor(p,'ru'),null);
 assert.equal(identityFor({id:'does-not-exist'},'ru'),null);
});

test('category photo variety ordering keeps the original catalog and spreads repeat images when possible',()=>{
 const hot=products.filter(p=>p.cat==='46776');
 const ordered=diversifyPhotoOrder(hot);
 assert.equal(ordered.length,hot.length);
 assert.deepEqual(ordered.map(x=>x.id).sort(),hot.map(x=>x.id).sort());
 const adjacent=items=>items.slice(1).filter((p,i)=>visualSourceOf(p)===visualSourceOf(items[i])).length;
 assert.ok(adjacent(ordered)<=adjacent(hot));
 assert.equal(diversifyPhotoOrder([]).length,0);
 assert.deepEqual(diversifyPhotoOrder(hot.slice(0,1)),hot.slice(0,1));
});

test('marketing presentation varies photo grouping, not search/favorites or product truth',()=>{
 const js=readFileSync('dist/app.js','utf8'),css=readFileSync('dist/kiosk.css','utf8');
 assert.match(js,/!search&&!\['all','featured','favorites'\]\.includes\(category\)\?diversifyPhotoOrder\(list\):list/);
 assert.match(js,/flavorChip\(p\)/);
 assert.match(css,/\.miora-photo-identity/);
 assert.match(css,/@media\(max-width:620px\)/);
 assert.ok(photoSources['429239']==='428759');
 assert.ok(photoSources['429287']==='429271');
});

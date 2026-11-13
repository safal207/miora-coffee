import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {products,categories} from '../dist/menu-data.js';
import {focusedPhotos} from '../dist/focus-photo-data.js';
import {photoUrl,photoKind,photoSet,hasAlternatePhoto} from '../dist/photos.js';
import {spotlightItems,motionCopy,imageLabel,DWELL_MS,TRANSITION_MS} from '../dist/menu-motion.js';
test('focused images keep independently addressable originals and verified reference hashes',()=>{
 const manifest=JSON.parse(readFileSync(new URL('../docs/focused-menu-images-2026-11-13.json',import.meta.url)));
 assert.equal(Object.keys(focusedPhotos).length,6);
 const hash=b=>createHash('sha256').update(b).digest('hex');
 for(const [id,p] of Object.entries(manifest.photos)){
  const item=products.find(p=>p.id===id);assert.ok(hasAlternatePhoto(item));assert.equal(photoKind(item),'generated');
  assert.notEqual(photoKind(item,'original'),'generated');assert.notEqual(photoUrl(item),photoUrl(item,640,'original'));
  assert.equal(hash(readFileSync(new URL('../dist/'+p.referenceAsset,import.meta.url))),p.referenceSha256);
  assert.ok(p.prompt.length>100);assert.equal(p.visualReview,'accepted');
  for(const [size,a] of Object.entries(p.assets)){
   const bytes=readFileSync(new URL('../dist/'+a.path,import.meta.url));assert.equal(hash(bytes),a.sha256);assert.ok(bytes.length<250000);assert.ok(a.dimensions[0]<=p.sourceDimensions[0]&&a.dimensions[0]<=Number(size));
  }
  assert.match(photoSet(item,'100vw'),/360w/);
  for(const lang of ['ru','tr','en']){assert.match(imageLabel(item,lang),/AI/);assert.ok(imageLabel(item,lang,'original'));}
 }
});
test('spotlight respects category membership, actual prices and distinct pictures',()=>{
 assert.equal(DWELL_MS,7000);assert.equal(TRANSITION_MS,650);
 for(const cat of categories){
  const source=products.filter(p=>p.cat===cat.id),selection=spotlightItems(source);
  assert.ok(selection.length>=2&&selection.length<=3,cat.id);
  assert.equal(new Set(selection.map(p=>photoUrl(p,160))).size,selection.length);
  assert.ok(selection.every(p=>source.includes(p)&&p.price!==null));
 }
 assert.deepEqual(spotlightItems([]),[]);assert.deepEqual(spotlightItems([{...products[0],price:null}]),[]);
 for(const lang of ['ru','tr','en'])for(const key of Object.keys(motionCopy.en))assert.ok(motionCopy[lang][key]);
});

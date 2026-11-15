import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {products} from '../dist/menu-data.js';
import {dessertPhotos} from '../dist/dessert-photo-data.js';
import {photoUrl,photoSet,photoKind,photoVariants} from '../dist/photos.js';
import {galleryMarkup} from '../dist/menu-motion.js';
const expected=['430198','429872','430207','431299','430214','431304','431302'].sort();
test('seven reviewed dessert covers preserve original photos, recipe gaps and exact provenance',()=>{
 const m=JSON.parse(readFileSync(new URL('../docs/dessert-angles-2026-11-15.json',import.meta.url))),hash=b=>createHash('sha256').update(b).digest('hex');
 assert.deepEqual(Object.keys(dessertPhotos).sort(),expected);
 for(const [id,p] of Object.entries(m.photos)){
  const item=products.find(p=>p.id===id);assert.equal(photoKind(item),'generated');assert.equal(photoKind(item,'original'),'original');assert.notEqual(photoUrl(item),photoUrl(item,640,'original'));assert.deepEqual(photoVariants(item),['focus','original']);
  assert.equal(p.referenceAsset,`assets/originals/${id}-1200.webp`);assert.equal(hash(readFileSync(new URL('../dist/'+p.referenceAsset,import.meta.url))),p.referenceSha256);assert.equal(p.sourceIngredients,item.description);assert.equal(p.visualReview,'accepted');assert.ok(p.prompt.length>200);
  for(const [size,a] of Object.entries(p.assets)){const b=readFileSync(new URL('../dist/'+a.path,import.meta.url));assert.equal(hash(b),a.sha256);assert.equal(b.length,a.bytes);assert.ok(b.length<250000);assert.ok(a.dimensions[0]<=p.sourceDimensions[0]&&a.dimensions[0]<=Number(size));}
  assert.match(photoSet(item,'100vw'),/360w/);
 }
 for(const id of ['431302','431304']){assert.equal(products.find(p=>p.id===id).description,'');assert.equal(m.photos[id].sourceIngredients,'');}
});
test('new covers stay disclosed and source-selectable in every language, with distinct Magnum variants',()=>{
 for(const id of expected)for(const lang of ['ru','tr','en']){
  const p=products.find(p=>p.id===id),markup=galleryMarkup(p,lang,p.name[lang],'Details');
  assert.ok(markup.includes('data-source-view="original"'));assert.ok(markup.includes('data-source-view="focus"'));assert.match(markup,/AI/);assert.ok(markup.includes('1/2'));assert.ok(!/<iframe|<video|autoplay/.test(markup));
 }
 const small=products.find(p=>p.id==='431304'),large=products.find(p=>p.id==='431302');assert.notEqual(photoUrl(small),photoUrl(large));assert.notEqual(photoUrl(small,640,'original'),photoUrl(large,640,'original'));
});

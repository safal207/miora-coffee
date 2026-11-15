import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {products} from '../dist/menu-data.js';
import {cakePhotos} from '../dist/cake-photo-data.js';
import {hasCakeInterior,cakeIngredientInfo,cakeViewerMarkup,cakeCopy} from '../dist/cake-interiors.js';
import {photoVariants,photoUrl,photoKind} from '../dist/photos.js';
import {galleryMarkup} from '../dist/menu-motion.js';
const expected=['430226','430222','429826','429828','429921','429808','429822','431314','429834'].sort();
const byId=new Map(products.map(p=>[p.id,p]));
test('nine additional cutaways preserve covers, recipe membership and source provenance',()=>{
 assert.deepEqual(Object.keys(cakePhotos).sort(),expected);
 const manifest=JSON.parse(readFileSync(new URL('../docs/cake-interiors-2026-11-13.json',import.meta.url)));
 const hash=b=>createHash('sha256').update(b).digest('hex');
 for(const [id,record] of Object.entries(manifest.photos)){
  const p=byId.get(id);assert.ok(hasCakeInterior(p));assert.ok(photoVariants(p).includes('inside'));assert.equal(photoKind(p,'inside'),'generated');assert.notEqual(photoUrl(p),photoUrl(p,640,'inside'));
  assert.equal(record.sourceIngredients,p.description);assert.equal(hash(readFileSync(new URL('../dist/'+record.referenceAsset,import.meta.url))),record.referenceSha256);assert.equal(record.visualReview,'accepted');assert.ok(record.prompt.length>200);
  for(const [size,a] of Object.entries(record.assets)){const bytes=readFileSync(new URL('../dist/'+a.path,import.meta.url));assert.equal(hash(bytes),a.sha256);assert.equal(bytes.length,a.bytes);assert.ok(bytes.length<250000);assert.ok(a.dimensions[0]<=record.sourceDimensions[0]&&a.dimensions[0]<=Number(size));}
 }
 assert.equal(hasCakeInterior(null),false);assert.equal(cakeIngredientInfo(byId.get('428748')),null);
});
test('ingredient translations include every source token and preview never adds a recipe claim',()=>{
 for(const id of expected){const p=byId.get(id),source=p.description.split(',').map(x=>x.trim()).filter(Boolean);
  for(const lang of ['ru','tr','en']){const info=cakeIngredientInfo(p,lang);assert.deepEqual(info.source,source);assert.equal(info.parts.length,source.length);assert.ok(info.parts.every(x=>x.length>0));assert.ok(info.preview.every(x=>info.parts.includes(x)));assert.equal(info.remaining,info.parts.length-info.preview.length);if(lang!=='tr')assert.ok(info.parts.every(x=>!/[ŞşĞğıİÇçÜüÖö]/.test(x)));}
 }
 const unknown=byId.get('429828');assert.deepEqual(cakeIngredientInfo(unknown,'en').parts,[]);const html=cakeViewerMarkup(unknown,'en',unknown.name.en,'inside');assert.ok(html.includes(cakeCopy.en.missing));assert.ok(!html.includes('data-cake-ingredients'));
 assert.ok(cakeIngredientInfo(byId.get('429921'),'ru').parts.includes('Фундук'));
 assert.ok(cakeIngredientInfo(byId.get('429834'),'en').parts.includes('Oil / fat'));assert.ok(!cakeIngredientInfo(byId.get('429834'),'en').parts.includes('Butter'));
});
test('localized gallery and ingredient viewer preserve real source and manual controls',()=>{
 for(const id of expected)for(const lang of ['ru','tr','en']){
  const p=byId.get(id),views=photoVariants(p),gallery=galleryMarkup(p,lang,p.name[lang],'Details'),viewer=cakeViewerMarkup(p,lang,p.name[lang],'inside');
  assert.equal((gallery.match(/class="gallery-frame"/g)||[]).length,views.length);assert.ok(gallery.includes('data-source-view="inside"'));assert.ok(gallery.includes(`1/${views.length}`));
  assert.ok(viewer.includes('type="range"'));assert.ok(viewer.includes('value="100"'));assert.ok(viewer.includes(cakeCopy[lang].art));assert.ok(viewer.includes(cakeCopy[lang].range));assert.ok(!/<iframe|<video|autoplay/.test(viewer));
 }
 assert.deepEqual(photoVariants(byId.get('429808')),['focus','inside','original']);assert.deepEqual(photoVariants(byId.get('430226')),['focus','inside']);assert.deepEqual(photoVariants(byId.get('460119')),['focus','original']);
 assert.equal(cakeViewerMarkup(byId.get('428748'),'en','Latte'),'');
});

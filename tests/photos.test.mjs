import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,readdirSync} from 'node:fs';
import {products} from '../dist/menu-data.js';
import {photoSources,photoPlaceholders} from '../dist/photo-data.js';
import {hasPhoto,photoUrl,photoSet} from '../dist/photos.js';
const file=p=>new URL(`../${p}`,import.meta.url);
const manifest=JSON.parse(readFileSync(file('docs/photo-refresh-2026-11-06.json')));
const byId=new Map(products.map(p=>[p.id,p]));
const hash=b=>createHash('sha256').update(b).digest('hex');
test('retouched photos are indexed completely; source logo placeholders remain explicit',()=>{
  assert.equal(photoPlaceholders.length,8);
  const ids=Object.values(manifest.photos).flatMap(p=>p.productIds).sort();
  assert.deepEqual(Object.keys(photoSources).sort(),ids);
  if(manifest.complete){assert.equal(ids.length,84);assert.equal(Object.keys(manifest.photos).length,66);}
  for(const id of photoPlaceholders){assert.equal(hasPhoto(byId.get(id)),false);assert.equal(photoSet(byId.get(id),'100vw'),'');}
  const missing=byId.get('429448');assert.equal(hasPhoto(missing),false);assert.equal(photoUrl(missing),'favicon.svg');
});
test('published responsive photos match reviewed asset hashes and original product identities',()=>{
  const listed=[];
  for(const [canonical,p] of Object.entries(manifest.photos)){
    assert.equal(p.visualReview,'accepted',canonical);
    assert.ok(p.generatedDimensions.every(n=>n>=1024),canonical);
    for(const id of p.productIds){assert.equal(photoSources[id],canonical);assert.equal(hash(readFileSync(file(`dist/assets/products/${id}.jpg`))),p.sourceSha256,id);}
    for(const [width,a] of Object.entries(p.assets)){
      const bytes=readFileSync(file(`dist/${a.path}`));
      assert.equal(hash(bytes),a.sha256,a.path);assert.equal(bytes.length,a.bytes,a.path);
      assert.deepEqual(a.dimensions,[+width,+width],a.path);
      assert.equal(bytes.subarray(0,4).toString(),'RIFF');assert.equal(bytes.subarray(8,12).toString(),'WEBP');
      assert.ok(bytes.length<350000,`Photo size budget: ${a.path}`);listed.push(a.path.split('/').at(-1));
    }
  }
  assert.deepEqual(readdirSync(file('dist/assets/enhanced')).sort(),listed.sort());
});
test('shared source photos reuse the same retouch and small surfaces use thumbnails',()=>{
  const latte=byId.get('428748');assert.equal(photoUrl(latte),photoUrl(byId.get('428787')));
  assert.equal(photoUrl(latte,160),'assets/enhanced/428748-160.webp');
  assert.equal(photoUrl(latte,999),'assets/enhanced/428748-640.webp');
  assert.match(photoSet(latte,'100vw'),/428748-1200.webp 1200w/);
  const original=products.find(p=>hasPhoto(p)&&!photoSources[p.id]);
  if(original)assert.equal(photoUrl(original),`assets/products/${original.id}.jpg`);
});

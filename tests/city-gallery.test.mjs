import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {CITY_GALLERY,GALLERY_COPY,gallerySlide,galleryStep,galleryTitle} from '../dist/city-gallery.js';

test('only the four specifically approved frames are included; fifth is absent',()=>{
  assert.deepEqual(CITY_GALLERY.map(x=>x.id),['town','shop','family','slide']);
  assert.deepEqual(CITY_GALLERY.map(x=>x.src),[
    'assets/city/gallery/01-play-town.webp',
    'assets/city/gallery/02-shop-and-houses.webp',
    'assets/city/gallery/03-family-corner.webp',
    'assets/city/gallery/04-slide.webp'
  ]);
  assert.equal(new Set(CITY_GALLERY.map(x=>x.src)).size,4);
  assert.equal(CITY_GALLERY.some(x=>x.src.includes('rocket')||x.src.includes('05-')),false);
});
test('optimized WebP images exist and decode as WebP; at most 200KB each',()=>{
  for(const item of CITY_GALLERY){
    const url=new URL('../dist/'+item.src,import.meta.url);
    const data=readFileSync(url);
    assert.equal(data.subarray(0,4).toString(),'RIFF');
    assert.equal(data.subarray(8,12).toString(),'WEBP');
    assert(statSync(url).size>20000&&statSync(url).size<200000,item.src);
    assert(item.width>=800&&item.height>=800||item.width===1440);
  }
});
test('gallery index wraps predictably with no persistence or server API',()=>{
  assert.equal(galleryStep(0,-1),3);
  assert.equal(galleryStep(3,1),0);
  assert.equal(galleryStep(1,1),2);
  assert.equal(gallerySlide(999).id,'town');
});
test('RU/TR/EN captions disclose artificial editing, never imply unchanged documentary images',()=>{
  for(const lang of ['ru','tr','en']){
    const c=GALLERY_COPY[lang];
    for(const key of ['heading','lead','disclaimer','enlarge','previous','next','close','of'])assert(c[key]?.length>0,lang+':'+key);
    assert.match(c.disclaimer,/AI|yapay zekâ/i);
    for(let i=0;i<4;i++)assert(galleryTitle(lang,i).length>3);
  }
  const code=readFileSync(new URL('../dist/city-gallery.js',import.meta.url),'utf8');
  assert.doesNotMatch(code,/localStorage|sessionStorage|fetch\(|sendBeacon|checkout/i);
});
test('source-photo map remains separate, and original logo/menu are not overwritten',()=>{
  const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert.match(app,/CITY_ASSETS\.panorama/);
  assert.match(app,/galleryMarkup\(\)/);
  assert.match(app,/data-city-gallery-open/);
  assert.match(html,/city-gallery\.css\?v=20261122-v1/);
  assert.match(html,/assets\/logo-source\.jpg/);
});

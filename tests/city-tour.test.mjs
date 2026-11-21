import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {TOUR_SPOTS,TOUR_COPY,validTourSpot,nextTourSpot,getTourCopy} from '../dist/city-tour.js';
import {CITY_ASSETS} from '../dist/city-guide.js';

test('every tourist stop is grounded in the provided Miora venue photos',()=>{
  assert.deepEqual(TOUR_SPOTS,['houses','shop','slide','coffee']);
  assert.equal(CITY_ASSETS.panorama,'assets/city/miora-city.webp');
  assert.equal(new Set(TOUR_SPOTS).size,4);
  assert.equal(validTourSpot('childAge'),false);
  assert.equal(validTourSpot('shop'),true);
  assert.equal(validTourSpot('__proto__'),false);
});
test('next stop is deterministic and cycles without tracking visitor identity',()=>{
  for(let i=0;i<TOUR_SPOTS.length;i++){
    assert.equal(nextTourSpot(TOUR_SPOTS[i]),TOUR_SPOTS[(i+1)%TOUR_SPOTS.length]);
  }
  assert.equal(nextTourSpot('other'),TOUR_SPOTS[0]);
});
test('Russian, Turkish and English explain the four spaces with clear labels',()=>{
  for(const lang of ['tr','ru','en']){
    const copy=TOUR_COPY[lang];
    for(const key of ['prompt','hint','progress','next','photo'])assert(copy[key]?.length>3,lang+':'+key);
    for(const key of TOUR_SPOTS){
      assert(copy[key]?.label?.length>2,lang+':'+key+'.label');
      assert(copy[key]?.story?.length>40,lang+':'+key+'.story');
      assert.deepEqual(getTourCopy(lang,key),copy[key]);
      assert.doesNotMatch(copy[key].story,/₺|discount|скидк|indirim|к оплате|покупай|buy now/i);
    }
    assert.equal(getTourCopy(lang,'missing'),copy.houses);
  }
});
test('tour never sends answers, stores child data or invents play supervision',()=>{
  const code=readFileSync(new URL('../dist/city-tour.js',import.meta.url),'utf8');
  const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
  const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
  assert(!/(?:localStorage|sessionStorage|fetch\(|sendBeacon|childName|childAge|checkout|rewardCount)/.test(code));
  assert.match(app,/function selectTourSpot\(spot\)/);
  assert.match(app,/city-tour-pin-/);
  assert.match(app,/data-city-tour-next/);
  assert.match(html,/city-tour\.css\?v=20261121-v1/);
  assert.match(html,/app\.js\?v=20261121-citytour1/);
});

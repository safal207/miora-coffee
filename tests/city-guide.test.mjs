import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {products,categories} from '../dist/menu-data.js';
import {CITY_CATEGORY,CITY_ASSETS,CITY_COPY,cityNext,cityProducts} from '../dist/city-guide.js';

test('guided conversation has explicit child-neutral, adult and skip paths',()=>{
 assert.equal(cityNext('hello','family'),'family');
 assert.equal(cityNext('hello','adults'),'adults');
 assert.equal(cityNext('family','tour'),'town');
 assert.equal(cityNext('family','choose'),'choose');
 assert.equal(cityNext('adults','choose'),'choose');
 assert.equal(cityNext('town','choose'),'choose');
 for(const mood of ['coffee','dessert','food']){
  assert.equal(cityNext('choose',mood),mood);
  assert.equal(cityNext(mood,'choose'),'choose');
 }
 assert.equal(cityNext('hello','unknown'),null);
 assert.equal(cityNext('town','childrenAge'),null);
 assert.equal(cityNext('town','reset'),'hello');
});
test('only existing menu categories are chosen by guided actions',()=>{
 const allowed=new Set(categories.map(c=>c.id));
 for(const category of Object.values(CITY_CATEGORY))assert(allowed.has(category));
 const priced=products.filter(p=>Number.isSafeInteger(p.price)&&p.price>0);
 for(const mood of Object.keys(CITY_CATEGORY)){
  const picks=cityProducts(mood,products);
  assert(picks.length>0&&picks.length<=3);
  for(const p of picks){assert(priced.includes(p));assert.equal(p.cat,CITY_CATEGORY[mood]);}
 }
 assert.deepEqual(cityProducts('unknown',products),[]);
 assert.deepEqual(cityProducts('dessert',products,0),[]);
});
test('the original menu has real source prices, without invented deals',()=>{
 const subset=cityProducts('coffee',products);
 assert(subset.every(p=>p.price===products.find(item=>item.id===p.id).price));
 assert.equal(new Set(subset.map(p=>p.id)).size,subset.length);
});
test('all visitor scenarios have fully translated labels in tr, ru and en',()=>{
 const required=['eyebrow','title','hello','family','adults','town','choose','coffee','dessert','food','familyChoice','adultChoice','tour','pick','coffeeChoice','dessertChoice','foodChoice','openCategory','skip','back','reopen','notChat','panorama','privacy'];
 for(const lang of ['tr','ru','en'])for(const key of required){
  assert.equal(typeof CITY_COPY[lang][key],'string',lang+'.'+key);
  assert(CITY_COPY[lang][key].trim().length>0,lang+'.'+key);
 }
});
test('authentic child-safe venue photo collage is present in bundled assets',()=>{
 assert.equal(CITY_ASSETS.panorama,'assets/city/miora-city.webp');
 const file=new URL('../dist/'+CITY_ASSETS.panorama,import.meta.url);
 const binary=readFileSync(file);
 assert.equal(binary.subarray(0,4).toString(),'RIFF');
 assert.equal(binary.subarray(8,12).toString(),'WEBP');
 assert(statSync(file).size>2500);
 assert(statSync(file).size<30000,'small enough for quick first visit');
});
test('guide is truly optional and its paths never record family status',()=>{
 const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const markup=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 const script=readFileSync(new URL('../dist/city-guide.js',import.meta.url),'utf8');
 assert.match(app,/if\(d\.cityAction\)\{cityAction\(d\.cityAction\)/);
 assert.match(app,/if\(action==='skip'\|\|action==='category'\)/);
 assert.match(markup,/id="city-guide"/);
 assert.match(markup,/id="city-open"/);
 assert.match(markup,/city-guide\.css\?v=20261121-v1/);
 assert.doesNotMatch(script,/localStorage|sessionStorage|fetch\(|navigator\.sendBeacon|childId|childrenAge|childName/);
 assert.doesNotMatch(script,/discount|offer_accepted|checkout/);
});

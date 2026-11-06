import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {products,categories,featured} from '../dist/menu-data.js';
import {normalizeCart,totals,updateCart,addPair,filterProducts,resolveView} from '../dist/core.js';
const catalog=new Map(products.map(p=>[p.id,p]));
const source=JSON.parse(readFileSync(new URL('../docs/source-menu-2026-11-05.json',import.meta.url)));
test('all 93 source products retain identity, category and exact price',()=>{
  assert.equal(products.length,93);assert.equal(catalog.size,93);assert.equal(categories.length,8);
  for(const p of source.products){const item=catalog.get(p.id);assert.ok(item);assert.equal(item.cat,p.cat);assert.equal(item.name.tr,p.name);assert.equal(item.description,p.description);assert.equal(item.price,p.price===null?null:Math.round(Number(p.price.replace('₺','').replace('.','').replace(',','.'))*100));assert.equal(item.kcal,p.kcal);}
});
test('all available source photos and the logo are packaged locally',()=>{
  assert.equal(products.filter(p=>p.image).length,92);
  for(const p of products.filter(p=>p.image))assert.ok(existsSync(new URL(`../dist/assets/products/${p.id}.jpg`,import.meta.url)),p.id);
  assert.ok(existsSync(new URL('../dist/assets/logo-source.jpg',import.meta.url)));
});
test('corrupt persisted quantities, unknown items and unpriced dishes cannot enter an order',()=>{
  assert.deepEqual(normalizeCart({'428748':2,'431302':1,'431333':1,'000000':1,'428772':-1,'429264':'2','429441':100,'429442':1.5},catalog),{'428748':2});
  assert.deepEqual(normalizeCart(null,catalog),{});assert.deepEqual(normalizeCart([],catalog),{});
});
test('latte, cappuccino and cheesecake total in integer kuruş',()=>{
  assert.deepEqual(totals({'428748':2,'428772':1,'430226':1},catalog),{count:4,price:83000});
});
test('removing the last portion removes its line and total',()=>{
  const next=updateCart({'428748':1},'428748',-1,catalog);assert.deepEqual(next,{});assert.deepEqual(totals(next,catalog),{count:0,price:0});
});
test('unpriced items stay visible but cannot be added',()=>{
  assert.deepEqual(products.filter(p=>p.price===null).map(p=>p.id),['431302','431333']);
  assert.deepEqual(updateCart({},'431302',1,catalog),{});assert.deepEqual(updateCart({},'431333',1,catalog),{});
});
test('pairing adds its two separately priced products for 430 lira',()=>{
  const next=addPair({},['428772','430226'],catalog);assert.deepEqual(next,{'428772':1,'430226':1});assert.equal(totals(next,catalog).price,43000);
});
test('pairing is atomic when a line reaches its quantity limit',()=>{
  const prior={'428772':99};assert.equal(addPair(prior,['428772','430226'],catalog),null);assert.deepEqual(prior,{'428772':99});
});
test('search accepts Turkish without diacritics and translated product names',()=>{
  assert.ok(filterProducts(products,{category:'all',search:'sicak cikolata'}).some(p=>p.id==='429400'));
  assert.ok(filterProducts(products,{category:'all',search:'капучино'}).some(p=>p.id==='428772'));
  assert.equal(filterProducts(products,{category:'all',search:'not-a-dish-xyz'}).length,0);
});
test('favorites and category filters respect their actual memberships',()=>{
  assert.deepEqual(filterProducts(products,{category:'favorites',favorites:['429441']}).map(p=>p.id),['429441']);
  for(const cat of source.categories)assert.equal(filterProducts(products,{category:cat.id}).length,cat.count);
  assert.equal(filterProducts(products,{category:'featured',featured}).length,8);
});
test('a shared feed URL overrides an older stored grid or list preference',()=>{
  assert.equal(resolveView('feed','grid'),'feed');
  assert.equal(resolveView('feed','list'),'feed');
  assert.equal(resolveView('list','feed'),'list');
});
test('new visitors see the feed while valid saved modes and legacy URLs remain supported',()=>{
  assert.equal(resolveView(null,null),'feed');
  assert.equal(resolveView('unsupported','grid'),'grid');
  assert.equal(resolveView(null,'list'),'list');
  assert.equal(resolveView('grid','feed'),'grid');
  assert.equal(resolveView(null,{}),'feed');
});

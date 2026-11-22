import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const origin=process.env.SMOKE_ORIGIN||'http://127.0.0.1:8123';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['tr',390],['ru',320],['en',1280]]){
  const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/?lang='+lang+'&view=grid&category=all',{waitUntil:'domcontentloaded'});
  const usual=page.locator('#usual-order');
  assert.equal(await usual.isVisible(),false,'no saved order should be invented');
  await page.locator('#products [data-add="428748"]').click();
  await page.locator('#products [data-add="428748"]').click();
  await page.locator('#products [data-add="430350"]').click();
  await page.locator('#cart-open').click();
  await page.locator('#cart-footer [data-usual-save]').click();
  await usual.locator('[data-usual-repeat]').waitFor();
  assert.equal(await usual.isVisible(),true);
  assert.equal(await usual.locator('.usual-order-meta b').textContent().then(x=>x.includes('3')),true);
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('miora:usual-order:v1')));
  assert.deepEqual(stored.cart,{'428748':2,'430350':1});
  assert.deepEqual(stored.configuredOrders,[]);
  await page.locator('#cart-dialog [data-close]').click();
  await usual.scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/usual-order-'+lang+'-'+width+'.png'});

  await page.locator('#cart-open').click();
  await page.locator('#cart-footer [data-action="clear-cart"]').click();
  assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),0);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('#cart-open').click();
  await page.locator('#cart-footer [data-usual-repeat]').click();
  assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),3,
    'explicit repeat from empty cart restores saved line quantities');
  await page.locator('#cart-dialog [data-close]').click();
  await page.locator('#products [data-add="428772"]').click();
  await usual.locator('[data-usual-repeat]').click();
  assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),7,
    'explicit repeat appends rather than silently replacing the active list');

  await page.evaluate(()=>localStorage.setItem('miora:cart',JSON.stringify({'428748':98,'428772':1})));
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),99);
  await usual.locator('[data-usual-repeat]').click();
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('miora:cart'))),
    {'428748':98,'428772':1},'overflow cannot partially append saved lines');

  await usual.locator('[data-usual-forget]').click();
  assert.equal(await usual.isVisible(),false,'forget hides card immediately');
  assert.equal(await page.evaluate(()=>localStorage.getItem('miora:usual-order:v1')),null);
  assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),99,
    'forgetting a saved shortcut must not erase the current list');
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await usual.isVisible(),false);
  assert.deepEqual(errors,[],'no browser errors');
  console.log('PASS Usual Order '+lang+' '+width+'px: explicit save, reload, repeat, append, atomic limit, erase');
  await context.close();
 }
}finally{await browser.close();}

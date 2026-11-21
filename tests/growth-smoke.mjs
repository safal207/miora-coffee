import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const origin=process.env.SMOKE_ORIGIN || 'http://127.0.0.1:8123';
const browser=await chromium.launch({headless:true});
try{
  for(const [lang,width] of [['tr',390],['ru',320],['en',1280]]){
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/?lang='+lang+'&view=grid&category=all',{waitUntil:'domcontentloaded'});
    await page.locator('#products [data-add="428748"]').click();
    assert.equal(await page.locator('#cart-open .cart-count').textContent(),'1');
    await page.locator('#cart-open').click();
    const offer=page.locator('[data-growth-offer="430226"]');
    await offer.waitFor();
    assert.match(await offer.innerText(),/₺/,'exact menu price is visible');
    await offer.scrollIntoViewIfNeeded();
    await page.waitForFunction(()=>(JSON.parse(localStorage.getItem('miora:growth-events:v1')||'[]')).some(event=>event.type==='offer_visible'));
    assert.equal(await page.locator('#cart-open .cart-count').textContent(),'1','impression must not modify order');

    // A refusal is honored for the rest of this browsing session.
    await offer.locator('[data-growth-dismiss]').click();
    assert.equal(await page.locator('.growth-offer').count(),0);
    await page.locator('[data-close="cart-dialog"]').click();
    await page.locator('#cart-open').click();
    assert.equal(await page.locator('.growth-offer').count(),0,'dismissed offer must stay hidden');
    await page.locator('[data-action="clear-cart"]').click();
    await page.locator('[data-close="cart-dialog"]').click();

    // Complementary coffee for food-only basket; one-click adds only on explicit action.
    await page.locator('#products [data-add="430350"]').click();
    await page.locator('#cart-open').click();
    const coffee=page.locator('[data-growth-offer="428772"]');
    await coffee.waitFor();
    await coffee.locator('[data-growth-add]').click();
    assert.equal(await page.locator('#cart-open .cart-count').textContent(),'2');
    assert.equal(await page.locator('.growth-offer').count(),0,'no repeated upsell immediately after acceptance');
    await page.locator('[data-action="show-staff"]').click();
    assert.equal(await page.locator('.growth-offer').count(),0,'staff view contains only chosen goods');

    const events=await page.evaluate(()=>JSON.parse(localStorage.getItem('miora:growth-events:v1')||'[]'));
    assert(events.some(e=>e.type==='offer_visible' && e.productId==='430226'));
    assert(events.some(e=>e.type==='offer_dismissed' && e.productId==='430226'));
    assert(events.some(e=>e.type==='offer_accepted' && e.productId==='428772'));
    assert(events.some(e=>e.type==='staff_preview'));
    assert.deepEqual(errors,[],'no uncaught browser errors');
    console.log('PASS Growth Engine '+lang+' '+width+'px: show, dismiss, accept, staff');
    await context.close();
  }
}finally{await browser.close();}

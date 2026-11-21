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
  await page.goto(origin+'/?lang='+lang+'&view=grid&category=46776',{waitUntil:'domcontentloaded'});
  const card=page.locator('#products [data-product="428748"]');
  await card.locator('.miora-reactions').waitFor();
  const buttons=card.locator('[data-sticker-id="428748"]');
  assert.equal(await buttons.count(),3,'every hot coffee has exactly three sticker reactions');
  assert.equal(await page.locator('#sticker-collection').isVisible(),false,'personal collection is empty at start');
  assert.equal(await card.locator('[data-favorite="428748"]').getAttribute('aria-pressed'),'false');
  const cartBefore=await page.locator('#cart-open .cart-count').textContent();

  await card.locator('[data-sticker-code="cozy"]').click();
  assert.equal(await card.locator('[data-sticker-code="cozy"]').getAttribute('aria-pressed'),'true');
  assert.equal(await card.locator('[data-favorite="428748"]').getAttribute('aria-pressed'),'false','stickers must not automatically toggle favorite hearts');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('miora:personal-stickers:v1'))),
    {version:1,items:{'428748':'cozy'}});
  assert.equal(await page.locator('#sticker-collection').isVisible(),true);
  assert.match(await page.locator('#sticker-collection summary').textContent(),/1/);

  await card.locator('[data-sticker-code="energy"]').click();
  assert.equal(await card.locator('[data-sticker-code="cozy"]').getAttribute('aria-pressed'),'false');
  assert.equal(await card.locator('[data-sticker-code="energy"]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('miora:personal-stickers:v1')).items),{'428748':'energy'});
  await card.locator('[data-sticker-code="energy"]').click();
  assert.equal(await page.evaluate(()=>localStorage.getItem('miora:personal-stickers:v1')),null,'tapping again erases personal sticker');
  assert.equal(await page.locator('#sticker-collection').isVisible(),false);
  await card.locator('[data-sticker-code="cozy"]').click();

  await page.locator('#view-feed').click();
  const feed=page.locator('#products [data-product="428748"]');
  assert.equal(await feed.locator('[data-sticker-id="428748"]').count(),3);
  assert.equal(await feed.locator('[data-sticker-code="cozy"]').getAttribute('aria-pressed'),'true');
  await feed.locator('[data-sticker-code="energy"]').click();
  await page.locator('#view-list').click();
  assert.equal(await page.locator('#products [data-product="428748"] [data-sticker-code="energy"]').getAttribute('aria-pressed'),'true','list retains chosen sticker');
  await page.locator('#view-grid').click();

  await card.locator('.product-title').click();
  const detail=page.locator('#detail-dialog');
  assert.equal(await detail.evaluate(el=>el.open),true);
  assert.equal(await detail.locator('[data-sticker-id="428748"]').count(),3);
  assert.equal(await detail.locator('[data-sticker-code="energy"]').getAttribute('aria-pressed'),'true');
  await detail.locator('[data-sticker-code="adore"]').click();
  assert.equal(await card.locator('[data-sticker-code="adore"]').getAttribute('aria-pressed'),'true','detail and catalog stay synchronized');
  await detail.locator('[data-close]').click();

  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await card.locator('[data-sticker-code="adore"]').getAttribute('aria-pressed'),'true','personal choice survives reload on same device');
  await page.locator('#sticker-collection summary').click();
  await page.locator('#sticker-collection button[data-detail="428748"]').click();
  assert.equal(await detail.evaluate(el=>el.open),true,'album reopens real original product detail');
  await detail.locator('[data-close]').click();

  await page.goto(origin+'/?lang='+lang+'&view=grid&category=46818',{waitUntil:'domcontentloaded'});
  const dessert=page.locator('#products [data-product="430226"]');
  await dessert.locator('[data-sticker-code="yum"]').click();
  assert.equal(await page.locator('#sticker-collection summary b').textContent(),'2','album counts selected items only');
  await page.locator('#sticker-collection summary').click();
  await page.locator('#sticker-collection').scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/miora-reactions-'+lang+'-'+width+'.png'});
  assert.equal(await page.locator('#sticker-collection').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'album cannot overflow narrow viewports');
  assert.equal(await dessert.locator('.miora-reactions').evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'sticker buttons cannot overflow product card');
  assert.equal(await page.locator('#cart-open .cart-count').textContent(),cartBefore,'stickers do not cause orders or payments');

  assert.deepEqual(errors,[],'no uncaught browser errors');
  console.log('PASS Miora Reactions '+lang+' '+width+'px: three category choices, replace/remove, views, detail, reload, album, independence');
  await context.close();
 }
}finally{await browser.close();}

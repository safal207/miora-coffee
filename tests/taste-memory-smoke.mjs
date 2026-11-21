import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const origin=process.env.SMOKE_ORIGIN||'http://127.0.0.1:8123';
const browser=await chromium.launch({headless:true});
try{
  for(const [lang,width] of [['tr',390],['ru',320],['en',1280]]){
    const context=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto(origin+'/?lang='+lang+'&view=grid&category=all',{waitUntil:'domcontentloaded'});
    const taste=page.locator('#taste-memory');
    await taste.locator('[data-taste-toggle]').waitFor();
    assert.equal(await taste.locator('.taste-card').count(),0);
    assert.equal(await taste.locator('[data-taste-toggle]').getAttribute('aria-pressed'),'false');

    await page.locator('#products [data-add="428748"]').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('miora:taste-memory:v1')),null,
      'adding without opt-in must not create choice history');

    await page.locator('#products [data-favorite="428748"]').click();
    await taste.locator('[data-taste-add="428748"]').waitFor();
    await page.reload({waitUntil:'domcontentloaded'});
    await taste.locator('[data-taste-add="428748"]').waitFor();
    assert.equal(await page.evaluate(()=>localStorage.getItem('miora:taste-memory:v1')),null,
      'explicit heart favorite is independent from remembered add history');

    await taste.locator('[data-taste-toggle]').click();
    assert.equal(await taste.locator('[data-taste-toggle]').getAttribute('aria-pressed'),'true');
    assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('miora:taste-memory:v1'))),
      {enabled:true,recent:[]});

    await page.locator('#products [data-add="430350"]').click();
    await page.locator('#products [data-add="428772"]').click();
    await page.reload({waitUntil:'domcontentloaded'});
    await taste.locator('[data-taste-add="428748"]').waitFor();
    await taste.locator('[data-taste-add="430350"]').waitFor();
    await taste.locator('[data-taste-add="428772"]').waitFor();
    assert.equal(await taste.locator('.taste-card').first().locator('[data-taste-add]').getAttribute('data-taste-add'),
      '428748','favorite should appear ahead of recent choices');

    const countBefore=Number(await page.locator('#cart-open .cart-count').textContent());
    await taste.locator('[data-taste-add="430350"]').click();
    assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),countBefore+1,
      'a remembered choice is added only after the visitor presses add');

    await taste.locator('[data-taste-toggle]').click();
    assert.equal(await page.evaluate(()=>localStorage.getItem('miora:taste-memory:v1')),null,
      'turning off must erase all recently remembered choices');
    await page.reload({waitUntil:'domcontentloaded'});
    await taste.locator('[data-taste-add="428748"]').waitFor();
    assert.equal(await taste.locator('[data-taste-add="430350"]').count(),0);
    assert.equal(await taste.locator('[data-taste-toggle]').getAttribute('aria-pressed'),'false');

    await page.locator('#view-feed').click();
    assert.equal(await taste.locator('[data-taste-add="428748"]').count(),1,'saved picks survive layout changes');
    await page.locator('#view-list').click();
    assert.equal(await taste.locator('[data-taste-add="428748"]').count(),1);

    assert.deepEqual(errors,[],'no browser exceptions');
    console.log('PASS Taste Memory '+lang+' '+width+'px: opt-in, recall, reload, repeat, erase, layouts');
    await context.close();
  }
}finally{await browser.close();}

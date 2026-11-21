import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const origin=process.env.SMOKE_ORIGIN||'http://127.0.0.1:8123';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['tr',390],['ru',320],['en',1280]]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await ctx.newPage(),exceptions=[];
  page.on('pageerror',e=>exceptions.push(e.message));
  const response=await page.goto(origin+'/?lang='+lang+'&view=feed',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  const guide=page.locator('#city-guide');
  await guide.locator('[data-city-action="family"]').waitFor();
  assert.equal(await guide.isVisible(),true);
  assert.equal(await page.locator('#city-open').isVisible(),false);
  const cartBefore=await page.locator('#cart-open .cart-count').textContent();
  await guide.scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/miora-city-welcome-'+lang+'-'+width+'.png'});
  await guide.locator('[data-city-action="family"]').click();
  assert.equal(await guide.locator('[data-city-action="tour"]').count(),1);
  assert.equal(await guide.locator('#city-guide-title').evaluate(el=>el===document.activeElement),true,'keyboard focus follows dialog progress');
  await guide.locator('[data-city-action="tour"]').click();
  const panorama=guide.locator('.city-guide-mosaic img');
  await panorama.waitFor();
  await panorama.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const image=document.querySelector('.city-guide-mosaic img');return image?.complete&&image.naturalWidth>0;});
  assert.match(await panorama.getAttribute('src'),/assets\/city\/miora-city\.webp$/);
  assert.equal(await guide.locator('.city-guide-mosaic figcaption span').count(),3);
  assert(await guide.locator('.city-guide-mosaic figcaption span').evaluateAll(nodes=>nodes.every(el=>el.textContent.length<20)),
    'zone captions must be readable on narrow phones');
  assert(await guide.evaluate(el=>el.scrollWidth<=el.clientWidth+1),
    'guide cannot introduce horizontal overflow');
  const photoSize=await panorama.boundingBox();
  assert(photoSize&&photoSize.width<=500,'do not enlarge a 390px authentic photo into blurry desktop hero');
  await page.screenshot({path:'artifacts/miora-city-guide-'+lang+'-'+width+'.png'});

  await guide.locator('[data-city-action="back"]').click();
  assert.equal(await guide.locator('[data-city-action="choose"]').count(),1);
  await guide.locator('[data-city-action="choose"]').click();
  await guide.locator('[data-city-action="coffee"]').click();
  assert.equal(await guide.locator('.city-guide-product').count(),3);
  assert.equal(await page.locator('#cart-open .cart-count').textContent(),cartBefore,'looking at recommendations adds nothing');
  await guide.locator('[data-city-action="category"]').click();
  assert.equal(await guide.isVisible(),false);
  assert.equal(await page.locator('#city-open').isVisible(),true);
  assert.equal(new URL(page.url()).searchParams.get('category'),'46776');
  assert.equal(await page.locator('#result-title').evaluate(el=>document.activeElement===el),true,
    'category navigation returns keyboard focus to the menu');
  await page.locator('#city-open').click();
  await guide.locator('[data-city-action="adults"]').click();
  await guide.locator('[data-city-action="choose"]').click();
  await guide.locator('[data-city-action="dessert"]').click();
  await guide.locator('[data-city-action="category"]').click();
  assert.equal(new URL(page.url()).searchParams.get('category'),'46818');

  await page.locator('#city-open').click();
  await guide.locator('[data-city-action="skip"]').click();
  assert.equal(new URL(page.url()).searchParams.get('category'),'all');
  assert.equal(await guide.isVisible(),false,'guide can be skipped without purchase');
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('miora:city-guide-dismissed:v1')),'1',
    'remember only dismissed state in the current browsing session');
  assert.equal(await page.locator('#cart-open .cart-count').textContent(),cartBefore);
  assert.equal(await page.evaluate(()=>localStorage.getItem('miora:city-guide')),null,'never store family status');
  await page.evaluate(()=>{
    localStorage.setItem('miora:usual-order:v1',JSON.stringify({version:1,cart:{'428748':2},configuredOrders:[]}));
    localStorage.setItem('miora:favorites',JSON.stringify(['428748']));
  });
  await page.reload({waitUntil:'domcontentloaded'});
  assert.equal(await guide.isVisible(),false,'skipped guide stays out of the way after reload');
  assert.equal(await page.locator('#city-open').isVisible(),true,'visitor can reopen the guide');
  assert.equal(await page.locator('#cart-open .cart-count').textContent(),cartBefore,'saved list must not automatically enter cart');
  await page.locator('#city-open').click();
  assert.equal(await page.evaluate(()=>sessionStorage.getItem('miora:city-guide-dismissed:v1')),null,
    'explicit re-open resets session dismissal without storing answers');
  await guide.locator('[data-city-action="usual"]').click();
  assert.equal(await page.locator('#cart-open .cart-count').textContent(),'2','saved list requires an explicit action');
  assert.equal(await page.locator('#cart-dialog').evaluate(el=>el.open),true);
  await page.locator('#cart-dialog [data-close]').click();
  await page.locator('#city-open').click();
  await guide.locator('[data-city-action="family"]').click();
  await guide.locator('[data-city-action="favorites"]').click();
  assert.equal(new URL(page.url()).searchParams.get('category'),'favorites');
  assert.equal(await page.locator('#result-title').evaluate(el=>document.activeElement===el),true,
    'favorites shortcut returns keyboard focus');
  assert.equal(await page.locator('#result-count').textContent().then(x=>x.includes('1')),true);
  assert.deepEqual(exceptions,[]);
  console.log('PASS Miora City Guide '+lang+' '+width+'px: dialogue, authentic photo, keyboard, categories, opt-out');
  await ctx.close();
 }
}finally{await browser.close();}

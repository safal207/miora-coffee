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
  const panorama=guide.locator('.city-tour-image > img');
  await panorama.waitFor();
  await panorama.scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>{const image=document.querySelector('.city-tour-image > img');return image?.complete&&image.naturalWidth>0;});
  assert.match(await panorama.getAttribute('src'),/assets\/city\/miora-city\.webp$/);
  const gallery=guide.locator('.city-gallery');
  await gallery.locator('[data-city-gallery-open]').waitFor();
  assert.equal(await gallery.locator('.city-gallery-thumbs [data-city-gallery]').count(),4,
    'exactly four approved slides, never the rejected fifth');
  assert.match(await gallery.locator('.city-gallery-disclaimer').textContent(),/AI|yapay zekâ/i,
    'gallery must disclose generative adjustments in every language');
  await page.waitForFunction(()=>{
    const image=document.querySelector('#city-gallery-photo');return image?.complete&&image.naturalWidth>0;
  });
  await gallery.locator('[data-city-gallery="1"]').click();
  assert.equal(await gallery.locator('[data-city-gallery="1"]').getAttribute('aria-pressed'),'true');
  assert.match(await gallery.locator('#city-gallery-photo').getAttribute('src'),/02-shop-and-houses\.webp$/);
  await gallery.locator('.city-gallery-actions [data-city-gallery-next]').click();
  assert.match(await gallery.locator('#city-gallery-photo').getAttribute('src'),/03-family-corner\.webp$/);
  await gallery.locator('[data-city-gallery-open]').click();
  const photoDialog=gallery.locator('#city-gallery-dialog');
  assert.equal(await photoDialog.evaluate(el=>el.open),true,'large viewer opens only by visitor action');
  await photoDialog.locator('[data-city-gallery-next]').click();
  assert.match(await photoDialog.locator('#city-gallery-full-photo').getAttribute('src'),/04-slide\.webp$/);
  await page.keyboard.press('Escape');
  assert.equal(await photoDialog.evaluate(el=>el.open),false);
  await page.waitForFunction(()=>{const image=document.querySelector('#city-gallery-photo');return image?.complete&&image.naturalWidth>0;});
  await gallery.scrollIntoViewIfNeeded();
  await page.screenshot({path:'artifacts/miora-four-gallery-'+lang+'-'+width+'.png'});
  if(width>=800){
    const gap=await page.evaluate(()=>{
      const map=document.querySelector('.city-tour-figure').getBoundingClientRect();
      const details=document.querySelector('.city-tour-bottom').getBoundingClientRect();
      return details.top-map.bottom;
    });
    assert(gap>=0&&gap<36,'tour map and landmark story must stay visually adjacent on desktop');
  }
  assert(await gallery.evaluate(el=>el.scrollWidth<=el.clientWidth+1),
    'gallery cannot create horizontal overflow on phone or desktop');
  assert.equal(await page.locator('#cart-open .cart-count').textContent(),cartBefore,
    'gallery view/zoom never adds products');
  assert.equal(await guide.locator('.city-tour-pin').count(),4);
  assert.equal(await guide.locator('.city-tour-stop').count(),4);
  assert.equal(await guide.locator('.city-tour-pin[data-city-spot="houses"]').getAttribute('aria-pressed'),'true');
  assert.equal(await guide.locator('#city-tour-name').textContent(),
    lang==='ru'?'Домики':lang==='en'?'Little houses':'Evler');
  await guide.locator('.city-tour-pin[data-city-spot="shop"]').click();
  assert.equal(await guide.locator('.city-tour-stop[data-city-spot="shop"]').getAttribute('aria-pressed'),'true');
  assert.match(await guide.locator('#city-tour-description').textContent(),/SHOP/);
  await guide.locator('.city-tour-stop[data-city-spot="slide"]').click();
  assert.equal(await guide.locator('.city-tour-pin[data-city-spot="slide"]').getAttribute('aria-pressed'),'true');
  await guide.locator('[data-city-tour-next]').click();
  assert.equal(await guide.locator('.city-tour-stop[data-city-spot="coffee"]').getAttribute('aria-pressed'),'true');
  assert.equal(await guide.locator('.city-tour-stop[data-city-spot="coffee"]').evaluate(el=>document.activeElement===el),true,
    'next-stop button should place keyboard focus on the newly selected stop');
  assert(await guide.evaluate(el=>el.scrollWidth<=el.clientWidth+1),
    'guide cannot introduce horizontal overflow');
  const photoSize=await panorama.boundingBox();
  assert(photoSize&&photoSize.width<=500,'do not enlarge a 390px authentic photo into blurry desktop hero');
  const stopTargets=await guide.locator('.city-tour-stop').evaluateAll(nodes=>nodes.map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height})));
  assert(stopTargets.every(r=>r.h>=44&&r.w>=44),'all text hotspot buttons must have 44px touch targets');
  await page.screenshot({path:'artifacts/miora-city-guide-'+lang+'-'+width+'.png'});

  assert.equal(await page.locator('#cart-open .cart-count').textContent(),cartBefore,
    'exploring interactive landmarks must never add products to the order');
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

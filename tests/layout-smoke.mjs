import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

// Layout regression measures actual DOM rectangles instead of trusting CSS declarations.
const origin=process.env.SMOKE_ORIGIN||'http://127.0.0.1:8123';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
const widths=[320,360,390,414,620,768,1024,1440];
const configs=[...widths.map(width=>({width,lang:'ru',theme:width===390?'dark':'light'})),
 {width:390,lang:'tr',theme:'dark'},{width:390,lang:'en',theme:'light'},
 {width:768,lang:'tr',theme:'light'}];
let assertions=0;
const rect=locator=>locator.boundingBox();
const within=(child,parent,tolerance=2)=>!!child&&!!parent&&
 child.x>=parent.x-tolerance&&child.x+child.width<=parent.x+parent.width+tolerance&&
 child.y>=parent.y-tolerance&&child.y+child.height<=parent.y+parent.height+tolerance;
async function checkOverflow(page,context){
 const diff=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 assert(diff<=2,context+' horizontal overflow '+diff);
 assertions++;
}
async function capture(page,prefix,{width,lang}){
 if([320,390,768,1440].includes(width)&&lang==='ru'){
  await page.screenshot({path:'artifacts/'+prefix+'-'+lang+'-'+width+'.png'});
 }
}
try{
 for(const {width,lang,theme} of configs){
  const context=await browser.newContext({
   viewport:{width,height:850},deviceScaleFactor:1,
   isMobile:width<=620,hasTouch:width<=620,reducedMotion:'reduce',
   colorScheme:theme
  });
  const page=await context.newPage();
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e.message)));
  const response=await page.goto(origin+'/?view=list&lang='+lang+'&category=all',{waitUntil:'domcontentloaded'});
  assert.equal(response.status(),200);
  await page.locator('#products .product-card').first().waitFor();
  assert.equal(await page.locator('body').getAttribute('data-view'),'list');
  assert.equal(await page.locator('#products .product-card').count(),93);
  await checkOverflow(page,'list '+width+' '+lang);
  for(const i of [0,1,2,12,30,55,92]){
   const card=page.locator('#products .product-card').nth(i);
   const media=card.locator('.product-media'),body=card.locator('.product-body');
   const cardRect=await rect(card),imageRect=await rect(media),bodyRect=await rect(body);
   const titleRect=await rect(card.locator('.product-title'));
   const priceRect=await rect(card.locator('.photo-price'));
   const addRect=await rect(card.locator('.product-bottom button'));
   assert(cardRect&&imageRect&&bodyRect&&titleRect&&priceRect&&addRect);
   assert(imageRect.width<=cardRect.width*.43,'media too wide at '+width+' card '+i);
   assert(imageRect.x+imageRect.width<=bodyRect.x+2,'media overlaps text column at '+width+' card '+i);
   assert(within(titleRect,bodyRect),'title outside body at '+width+' card '+i);
   assert(within(priceRect,imageRect),'price outside photo at '+width+' card '+i);
   assert(within(addRect,bodyRect),'add outside body at '+width+' card '+i);
   const rail=card.locator('.product-media > .photo-actions');
   assert.equal(await rail.locator('button').count(),2,'two list reactions');
   assert.equal(await rail.locator('[data-view-count]').count(),1,'local view count');
   for(const button of await rail.locator('button').all()){
    assert(within(await rect(button),imageRect),'social outside photo at '+width+' card '+i);
   }
   assertions+=9;
  }
  if(width<=620){
   const search=await rect(page.locator('.toolbar .search'));
   const switcher=await rect(page.locator('.toolbar .view-switch'));
   assert(search&&switcher&&switcher.y>=search.y+search.height-2,'search not given its own row');
   const controls=page.locator('#view-grid');
   assert(await controls.isVisible(),'grid switch visible');
  }
  await capture(page,'layout-list',{width,lang});

  // All layout modes use the same page, preserving cart/local state.
  await page.locator('#view-grid').click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'grid');
  assert.equal(await page.locator('.product-card').count(),93);
  await checkOverflow(page,'grid '+width+' '+lang);
  const gridCards=page.locator('.product-card');
  for(const i of [0,1,4,30,92]){
   const card=gridCards.nth(i);
   const cardRect=await rect(card);
   const priceRect=await rect(card.locator('.photo-price'));
   const social=card.locator('.product-media .photo-actions');
   assert.equal(await social.locator('button').count(),2);
   const socialRect=await rect(social),photoRect=await rect(card.locator('.product-media'));
   assert(within(socialRect,photoRect),'grid actions escape photo '+width+' / '+i);
   assert(within(priceRect,photoRect),'grid price escapes photo '+width+' / '+i);
   assert(socialRect.y+socialRect.height<=priceRect.y,'price overlaps the reactions '+width+' / '+i);
   assertions+=3;
  }
  await capture(page,'layout-grid',{width,lang});

  await page.locator('#view-feed').click();
  assert.equal(await page.locator('body').getAttribute('data-view'),'feed');
  await page.locator('.feed-post').first().waitFor();
  await checkOverflow(page,'feed '+width+' '+lang);
  const feed=page.locator('.feed-post').first();
  const rail=await rect(feed.locator('.photo-actions'));
  const photo=await rect(feed.locator('.feed-media'));
  assert(within(rail,photo),'feed reactions outside photo at '+width);
  assert(within(await rect(feed.locator('.photo-price')),photo),'feed price outside photo at '+width);
  await capture(page,'layout-feed',{width,lang});
  assert.deepEqual(errors,[],'runtime browser errors '+width+' '+lang);
  if(width===390&&lang==='ru'){
   // Regression for user's screenshot with a nonempty floating order bar.
   await page.locator('#view-list').click();
   const before=Number(await page.locator('#cart-open .cart-count').textContent());
   await page.locator('.product-card [data-add]').first().click();
   assert.equal(Number(await page.locator('#cart-open .cart-count').textContent()),before+1);
   assert(await page.locator('#mobile-cart:not([hidden])').isVisible());
   const sticky=await rect(page.locator('#mobile-cart .button'));
   assert(sticky&&sticky.x>=0&&sticky.x+sticky.width<=width+1,'sticky cart offscreen');
   await page.locator('#mobile-cart-open').click();
   assert(await page.locator('#cart-dialog[open]').isVisible());
   await page.locator('#cart-dialog [data-close]').click();
   await page.screenshot({path:'artifacts/layout-list-cart-dark-390.png'});
  }
  console.log('PASS '+width+'px '+lang+' '+theme+': list/grid/feed geometry, reactions, no overlap');
  await page.close();
  await context.close();
 }
 console.log('PASS '+configs.length+' layout configurations; '+assertions+' measured checks');
}finally{
 await browser.close();
}

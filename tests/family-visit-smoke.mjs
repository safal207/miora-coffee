import assert from 'node:assert/strict';

const welcomeCaptions = {ru:'Возьми с собой',tr:'Miora’yı yanına al',en:'Take it with you'};

async function verifyWelcome(page, origin, lang, width, motion) {
  const appRequest = /\/app\.js(?:\?|$)/;
  let releaseApp;
  const appReady = new Promise(resolve => { releaseApp = resolve; });
  await page.route(appRequest, async route => {
    await appReady;
    await route.continue();
  });

  const welcome = page.locator('#miora-welcome');
  try {
    await page.goto(origin+'/?view=kiosk&lang='+lang,{waitUntil:'commit'});
    await welcome.waitFor({state:'visible'});
    assert.equal(await welcome.locator('#welcome-caption').innerText(), welcomeCaptions[lang]);
    assert.equal(await welcome.getAttribute('lang'),lang);
    assert.equal(await welcome.evaluate(el=>getComputedStyle(el).pointerEvents),'none');
    const cup = welcome.locator('.welcome-cup');
    const frame = await cup.boundingBox();
    assert(frame && frame.height >= 100 && Math.abs((frame.x + frame.width / 2) - width / 2) < 2,
      'cup is centered and recognizable during startup');
    assert.equal(await welcome.locator('.welcome-heart').evaluate(el=>getComputedStyle(el).animationName),
      motion==='reduce'?'none':'miora-heart-beat');
    assert.equal(await page.locator('#quick-results .quick-card').count(),0,'the menu script is still pending');
    if(width===320) {
      await cup.locator('img').first().evaluate(image=>image.decode());
      await page.screenshot({path:'artifacts/miora-welcome-ru-320.png'});
    }
  } finally {
    releaseApp();
  }

  await page.waitForLoadState('domcontentloaded');
  assert.equal(await welcome.isVisible(),false,'splash clears when startup finishes, without a timer');
  assert(await page.locator('#quick-results .quick-card').first().isVisible());
  await page.unroute(appRequest);
}

export async function verifyFamilyVisit(browser, origin) {
  for (const [lang, width, motion] of [['ru',320,'no-preference'],['tr',390,'reduce'],['en',1280,'no-preference']]) {
    const context = await browser.newContext({viewport:{width,height:800}, isMobile:width < 620, hasTouch:width < 620, reducedMotion:motion});
    await context.addInitScript(() => {
      Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async ()=>{}}});
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await verifyWelcome(page,origin,lang,width,motion);
    await page.locator('#kiosk-menu [data-family-entry]').click();
    const combos = page.locator('#family .family-grid article');
    assert.equal(await combos.count(),3);
    const frames = await combos.locator('.family-photos').evaluateAll(photos => photos.map(photo => {
      const {width,height}=photo.getBoundingClientRect();
      return [width,height];
    }));
    assert(frames.every(([w,h])=>Math.abs(w-h*1.65)<2),'the photos preserve their frame when portrait images load');
    assert.deepEqual(await combos.locator('.family-photos .photo-price').allTextContents(),['140 ₺','390 ₺','530 ₺']);
    assert.equal(await combos.locator('.photo-price').count(),3,'one price per combo');
    const room = page.locator('#family-care');
    assert(await room.locator('img').getAttribute('src'));
    const mini = page.locator('#family-mini');
    await mini.locator('.family-photos').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('#family-mini [data-view-count]').textContent === '1');
    const like = mini.locator('[data-favorite]');
    await like.click();
    assert.equal(await like.getAttribute('aria-pressed'),'true');
    await mini.locator('[data-share]').click();
    const link = await page.locator('#share-link').inputValue();
    assert.equal(new URL(link).searchParams.get('card'),'family-mini');
    await page.locator('#copy-link').click();
    assert.equal(await mini.locator('[data-share-count]').innerText(),'1');
    await page.locator('#share-dialog [data-close]').click();
    if(width !== 390){
      await page.locator('#family-title').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
      await mini.locator('img').first().evaluate(img=>img.decode());
      await page.screenshot({path:`artifacts/miora-family-${lang}-${width}.png`});
    }
    await page.locator('[data-family-add="family-share"]').click();
    await page.locator('#cart-open').click();
    assert.equal(await page.locator('#cart-dialog .total-line strong').innerText(),'530 ₺');
    assert.equal(await page.locator('#cart-open .cart-count').innerText(),'4');
    await page.locator('#cart-dialog [data-close]').click();
    await page.goto(link,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => document.activeElement.id === 'family-mini');
    assert.equal(await like.getAttribute('aria-pressed'),'true');
    assert.equal(await mini.locator('[data-share-count]').innerText(),'1');
    assert.equal(await page.locator('#miora-welcome').isVisible(),false,'splash is hidden on a fast shared-link navigation');
    await page.goto(origin+'/?view=kiosk&card=pair-latte&lang='+lang);
    const pair = page.locator('#pair-latte');
    await pair.waitFor();
    assert.equal(await pair.locator('.card-engagement button').count(),2);
    await page.goto(origin+'/?view=feed&card=build-sandwich&lang='+lang);
    await page.locator('#kiosk-dialog[open]').waitFor();
    await page.locator('#kiosk-dialog [data-k-close]').click();
    await page.locator('#builder-menu > summary').click();
    assert.equal(await page.locator('[data-builder-card="build-sandwich"] [data-view-count]').innerText(),'1');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'page remains inside the viewport');
    assert.deepEqual(errors,[]);
    if(width===320){
      await page.route(/\/app\.js(?:\?|$)/, route=>route.abort());
      await page.goto(origin+'/?view=kiosk&lang=ru',{waitUntil:'domcontentloaded'});
      assert.equal(await page.locator('#miora-welcome').isVisible(),false,'a failed script does not leave the splash on screen');
      assert(await page.locator('.footer a[data-i18n="originalMenu"]').isVisible());
    }
    await context.close();
  }
  console.log('Family combos, splash during startup, local engagement and shared links passed in RU/TR/EN.');
}

import assert from 'node:assert/strict';

export async function verifyFamilyVisit(browser, origin) {
  for (const [lang, width, motion] of [['ru',320,'no-preference'],['tr',390,'reduce'],['en',1280,'no-preference']]) {
    const context = await browser.newContext({viewport:{width,height:800}, isMobile:width < 620, hasTouch:width < 620, reducedMotion:motion});
    await context.addInitScript(() => {
      Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async ()=>{}}});
      window.welcomeShown = false;
      const observer = new MutationObserver(records => {
        if(records.some(({target}) => target.id === 'miora-welcome' && !target.hidden)) window.welcomeShown = true;
      });
      observer.observe(document, {subtree:true,attributes:true,attributeFilter:['hidden']});
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(origin+'/?view=kiosk&lang='+lang,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.welcomeShown);
    const welcome = page.locator('#miora-welcome');
    assert.equal(await welcome.evaluate(el=>getComputedStyle(el).pointerEvents),'none');
    assert.equal(await welcome.locator('.welcome-heart').evaluate(el=>getComputedStyle(el).animationName),motion==='reduce'?'none':'miora-heart-beat');
    if(width === 320){
      await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('#miora-welcome')).opacity)>.95);
      await page.screenshot({path:'artifacts/miora-welcome-ru-320.png'});
    }
    await welcome.waitFor({state:'hidden'});
    await page.locator('#kiosk-menu [data-family-entry]').click();
    const combos = page.locator('#family .family-grid article');
    assert.equal(await combos.count(),3);
    assert.deepEqual(await combos.locator('[data-family-add]').allTextContents().then(items=>items.map(s=>s.match(/\d+ ₺/)[0])),['140 ₺','390 ₺','530 ₺']);
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
    await page.waitForFunction(() => window.welcomeShown);
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
    await context.close();
  }
  console.log('Family combos, changing room, welcome on every load, local engagement and shared links passed in RU/TR/EN.');
}

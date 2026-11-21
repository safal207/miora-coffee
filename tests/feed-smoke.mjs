import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
import { verifyKioskMode } from './kiosk-mode-smoke.mjs';
import { verifyFamilyVisit } from './family-visit-smoke.mjs';

// Local PR preview: all tests run against the checked-out dist, never production.
const origin = process.env.SMOKE_ORIGIN || 'http://127.0.0.1:8123';
await mkdir('artifacts', { recursive:true });
const browser = await chromium.launch({ headless:true });
let tests = 0;
try {
  for (const [lang, width] of [['ru', 320], ['tr', 390], ['en', 1280]]) {
    const context = await browser.newContext({
      viewport:{ width,height:850 }, deviceScaleFactor:1,
      isMobile: width < 620, hasTouch: width < 620, reducedMotion:'reduce'
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e.message)));
    const res = await page.goto(origin + '/?view=feed&lang=' + lang, { waitUntil:'domcontentloaded' });
    assert.equal(res.status(), 200);
    await page.locator('.feed-post').first().waitFor();
    assert.equal(await page.locator('html').getAttribute('lang'), lang);
    assert.equal(await page.locator('#builder-menu').evaluate(x => x.open), false, 'builder must be optional');
    const first = page.locator('.feed-post').first();
    const second = page.locator('.feed-post').nth(1);
    const a = await first.boundingBox(), b = await second.boundingBox();
    assert(a && b && b.y > a.y + 60, 'one-column feed expected: photos vertically stacked');
    const rail = first.locator('.photo-actions');
    assert.equal(await rail.locator('button').count(), 2);
    const mediaBox = await first.locator('.feed-media').boundingBox();
    const railBox = await rail.boundingBox();
    assert(mediaBox && railBox && railBox.x > mediaBox.x + mediaBox.width * .55 &&
      railBox.x + railBox.width <= mediaBox.x + mediaBox.width + 1, 'social controls should stay inside right side of media');
    await first.scrollIntoViewIfNeeded();
    await page.screenshot({ path:'artifacts/feed-' + lang + '-' + width + '.png' });
    const save = first.locator('.photo-actions [data-favorite]');
    await save.click();
    assert.equal(await save.getAttribute('aria-pressed'), 'true');
    await first.locator('.photo-actions [data-share]').click();
    await page.locator('#share-dialog[open]').waitFor();
    await page.locator('#share-dialog [data-close]').click();
    await first.locator('.feed-photo-button').first().click();
    await page.locator('#detail-dialog[open]').waitFor();
    await page.locator('#detail-dialog [data-close]').first().click();
    await page.locator('#builder-menu > summary').click();
    assert.equal(await page.locator('#builder-menu').evaluate(x => x.open), true);
    assert(await page.locator('#builder-menu .builder-shortcuts [data-k-start="sandwich"]').isVisible());
    await page.locator('#builder-menu > summary').click();
    assert.equal(await page.locator('#builder-menu').evaluate(x => x.open), false);
    await page.locator('#feed-stories .story-button[data-category="46818"]').click();
    await page.locator('.feed-post').first().waitFor();
    assert(await page.locator('.feed-post').count() >= 10, 'dessert category should retain products');
    const gallery = page.locator('.product-gallery').first();
    assert(await gallery.count() > 0, 'alternate source photo gallery must remain accessible');
    await gallery.locator('.gallery-next').click();
    assert.equal(await page.locator('#products [data-source-view="inside"]').count(),0,'synthetic cuts must not appear in dessert feed');
    assert.equal(await page.locator('#products [data-spin]').count(),0,'360 must be absent from all dessert cards');

    // Grid and compact list must both provide accessible right-side favorite and paper-plane share.
    await page.locator('#view-grid').click();
    assert(await page.locator('#products.product-grid:not(.feed-view)').count() === 1);
    const gridCard = page.locator('#products .product-card').first();
    const social = gridCard.locator('.photo-actions');
    assert.equal(await social.locator('button').count(), 2);
    const gridImage = await gridCard.locator('.product-media').boundingBox();
    const gridSocial = await social.boundingBox();
    assert(gridImage && gridSocial && gridSocial.x >= gridImage.x && gridSocial.x + gridSocial.width <= gridImage.x + gridImage.width + 1, 'actions inside grid image');
    assert(await gridCard.locator('[data-share]').isVisible(), 'share must be visible in grid');
    await gridCard.locator('[data-share]').click();
    await page.locator('#share-dialog[open]').waitFor();
    await page.locator('#share-dialog [data-close]').click();
    await page.locator('#view-list').click();
    const listCard = page.locator('#products .product-card').first();
    assert(await listCard.locator('[data-share]').isVisible(), 'share must be visible in compact list');
    assert(await listCard.locator('[data-favorite]').isVisible(), 'favorite must be visible in compact list');
    await listCard.locator('[data-share]').click();
    await page.locator('#share-dialog[open]').waitFor();
    await page.locator('#share-dialog [data-close]').click();
    await page.locator('#view-feed').click();
    assert(await page.locator('.photo-actions').count() > 0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(overflow <= 2, 'horizontal overflow: ' + overflow);
    assert.deepEqual(errors, [], 'uncaught browser errors');
    // Reproduce the exact public entry path: grid + Russian locale + UTM + all catalog.
    const gridPage=await context.newPage();
    gridPage.on('pageerror',error=>errors.push(String(error.message)));
    await gridPage.addInitScript(()=>{
      Object.defineProperty(navigator,'share',{configurable:true,value:undefined});
      Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedShareLink=text;}}});
    });
    const gridRes=await gridPage.goto(origin+'/?view=grid&lang='+lang+'&utm_source=chatgpt.com&category=all',{waitUntil:'domcontentloaded'});
    assert.equal(gridRes.status(),200);
    await gridPage.locator('#products .product-card').first().waitFor();
    assert.equal(await gridPage.locator('body').getAttribute('data-view'),'grid');
    const ordinaryCake=gridPage.locator('#products .product-card[data-product="429828"]');
    await ordinaryCake.locator('.product-open').click();
    await gridPage.locator('#detail-dialog[open]').waitFor();
    assert.equal(await gridPage.locator('#detail-dialog .detail-cutaway').count(),0,'non-curated cheesecake must not show imagined cuts');
    assert.equal(await gridPage.locator('#detail-dialog .spin-viewer').count(),0);
    await gridPage.locator('#detail-dialog [data-close]').first().click();

    assert.equal(await gridPage.locator('.product-card').count(),93,'direct all-products grid should contain all 93 items');
    const product=gridPage.locator('#products .product-card').first();
    assert.equal(await product.locator('.photo-actions > span, .photo-actions > button').count(),3,'three social counters must be visible');
    assert(await gridPage.locator('#catalog-social-scope').isVisible(),'counts must be labeled as device-local');
    assert(await product.locator('[data-view-count]').isVisible());
    const heart=product.locator('.photo-actions [data-favorite]');
    const initialLike=Number(await product.locator('.photo-actions [data-like-count]').textContent());
    await heart.click();
    assert.equal(Number(await product.locator('.photo-actions [data-like-count]').textContent()),initialLike?0:1,'favorite must update count');
    const initialShares=Number(await product.locator('.photo-actions [data-share-count]').textContent());
    await product.locator('.photo-actions [data-share]').click();
    await gridPage.locator('#share-dialog[open]').waitFor();
    assert.equal(Number(await product.locator('.photo-actions [data-share-count]').textContent()),initialShares,'opening share dialog must not inflate shares');
    await gridPage.locator('#copy-link').click();
    await gridPage.waitForFunction(()=>!!window.__copiedShareLink);
    assert.equal(Number(await product.locator('.photo-actions [data-share-count]').textContent()),initialShares+1,'successful copy should increment local shares');
    await gridPage.locator('#share-dialog [data-close]').click();
    await product.locator('.product-media').scrollIntoViewIfNeeded();
    await gridPage.waitForFunction(()=>Number(document.querySelector('#products .product-card [data-view-count]')?.textContent)>=1,null,{timeout:5000});
    // SamCart/ClickFunnels-style quick view: no mandatory scrolling to purchase.
    const cakeProduct=gridPage.locator('#products .product-card[data-product="430226"]');
    await cakeProduct.locator('.product-open').click();
    const dialog=gridPage.locator('#detail-dialog[open]');
    await dialog.waitFor();
    const specs=dialog.locator('.detail-more');
    assert.equal(await specs.evaluate(el=>el.open),false,'long ingredients and provenance extras must be optional');
    assert.equal(await dialog.locator('.detail-image .photo-price').innerText(),'250 ₺');
    assert.equal(await dialog.locator('.photo-price').count(),1);
    assert(await dialog.locator('.detail-allergen-quick').isVisible(),'important allergy warning remains prominent');
    const action=dialog.locator('.detail-actions [data-add]');
    assert(await action.isVisible(),'primary action must be visible without navigating to another page');
    const purchaseRect=await action.boundingBox();
    assert(purchaseRect && purchaseRect.y>=-1 && purchaseRect.y+purchaseRect.height<=850,
      'product add action must fit inside the initial mobile viewport');
    await gridPage.screenshot({path:'artifacts/quick-detail-'+lang+'-'+width+'.png'});
    await specs.locator(':scope > summary').click();
    assert.equal(await specs.evaluate(el=>el.open),true,'full specifications must remain accessible');
    assert(await dialog.locator('.detail-more-body .detail-section').first().isVisible());
    assert.equal(await dialog.locator('.detail-cutaway').count(),1,'only curated cheesecake has an optional cutaway');
    assert.equal(await dialog.locator('.cake-viewer').count(),0,'no comparison slider in quick view');
    assert.equal(await dialog.locator('.spin-viewer').count(),0,'no 360 overlay in quick view');
    const cutaway=dialog.locator('.detail-cutaway');
    assert.equal(await cutaway.evaluate(el=>el.open),false);
    await cutaway.locator('summary').click();
    assert(await cutaway.locator('img').isVisible(),'cutaway is available only on deliberate expansion');
    assert.match(await cutaway.locator('p').textContent(),/AI|yapay zekâ|ИИ|иллюстрац/i);
    await cutaway.locator('summary').click();

    await specs.locator(':scope > summary').click();
    assert.equal(await specs.evaluate(el=>el.open),false);
    const countBefore=Number(await gridPage.locator('#cart-open .cart-count').textContent());
    await action.click();
    assert.equal(await gridPage.locator('#detail-dialog').evaluate(el=>el.open),false,
      'successful addition should return immediately to browsing');
    assert.equal(Number(await gridPage.locator('#cart-open .cart-count').textContent()),countBefore+1,
      'cart must persist after quick add');
    assert.equal(await gridPage.locator('body').getAttribute('data-view'),'grid');
    await gridPage.screenshot({path:'artifacts/social-grid-'+lang+'-'+width+'.png'});
    assert.deepEqual(errors,[], 'uncaught browser errors');
    await gridPage.close();
    await page.close(); await context.close();
    tests++;
    console.log('PASS: ' + lang + ' ' + width + 'px feed/grid views, favorite and shared-copy counts');
  }
  console.log('PASS: ' + tests + ' browser viewport + locale configurations');
  await verifyFamilyVisit(browser, origin);
  await verifyKioskMode(browser, origin);
} finally {
  await browser.close();
}

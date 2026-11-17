import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

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
    const rail = first.locator('.feed-action-rail');
    assert.equal(await rail.locator('button').count(), 3);
    const mediaBox = await first.locator('.feed-media').boundingBox();
    const railBox = await rail.boundingBox();
    assert(mediaBox && railBox && railBox.x > mediaBox.x + mediaBox.width * .55 &&
      railBox.x + railBox.width <= mediaBox.x + mediaBox.width + 1, 'social controls should stay inside right side of media');
    await first.scrollIntoViewIfNeeded();
    await page.screenshot({ path:'artifacts/feed-' + lang + '-' + width + '.png' });
    const save = first.locator('.feed-action-rail [data-favorite]');
    await save.click();
    assert.equal(await save.getAttribute('aria-pressed'), 'true');
    await first.locator('.feed-action-rail [data-share]').click();
    await page.locator('#share-dialog[open]').waitFor();
    await page.locator('#share-dialog [data-close]').click();
    await first.locator('.feed-action-rail [data-detail]').click();
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
    assert(await gallery.count() > 0, 'interior gallery must remain accessible');
    await gallery.locator('.gallery-next').click();
    // Grid mode must retain ordinary card layout, and feed mode must restore the rail.
    await page.locator('#view-grid').click();
    assert(await page.locator('#products.product-grid:not(.feed-view)').count() === 1);
    await page.locator('#view-feed').click();
    assert(await page.locator('.feed-action-rail').count() > 0);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    assert(overflow <= 2, 'horizontal overflow: ' + overflow);
    assert.deepEqual(errors, [], 'uncaught browser errors');
    await page.close(); await context.close();
    tests++;
    console.log('PASS: ' + lang + ' ' + width + 'px feed/social/gallery/grid regression');
  }
  console.log('PASS: ' + tests + ' browser viewport + locale configurations');
} finally {
  await browser.close();
}

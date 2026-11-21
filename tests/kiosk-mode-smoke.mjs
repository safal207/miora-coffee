import assert from 'node:assert/strict';

async function verifyDishPreview(page, menu, lang, width) {
  const sandwich = menu.locator('[data-quick-item="430356"] .quick-photo');
  const cardBox = await sandwich.boundingBox();
  assert(Math.abs(cardBox.width - cardBox.height * (width > 800 ? 1.25 : 1)) <= 1, 'the quick pick reserves space for the photo');
  assert.equal(await sandwich.locator('img').evaluate(img => getComputedStyle(img).objectPosition), '50% 49%');
  await sandwich.click();
  const dialog = page.locator('#detail-dialog[open]');
  const image = dialog.locator('.detail-photo-frame img');
  const fullPhoto = dialog.locator('.detail-photo-switch');
  await image.evaluate(img => img.decode());
  const [source, fit] = await image.evaluate(img => [img.currentSrc, getComputedStyle(img).objectFit]);
  assert(source.includes('/originals/430356-'), 'the croissant preview uses the café photo');
  assert.equal(fit, 'cover');
  const frameBefore = await image.boundingBox();
  await page.screenshot({path:`artifacts/kiosk-dish-${lang}-${width}.png`});
  await fullPhoto.press('Space');
  assert.equal(await fullPhoto.getAttribute('aria-pressed'), 'true');
  assert.equal(await image.evaluate(img => getComputedStyle(img).objectFit), 'contain');
  assert.equal(await image.evaluate(img => img.currentSrc), source, 'both views use the same photo');
  assert.deepEqual(await image.boundingBox(), frameBefore, 'the photo toggle does not shift the layout');
  await fullPhoto.press('Enter');
  assert.equal(await fullPhoto.getAttribute('aria-pressed'), 'false');
  await page.keyboard.press('Escape');
  assert.equal(await dialog.count(), 0);
  assert(await sandwich.evaluate(button => document.activeElement === button), 'closing returns focus to the dish');
}

export async function verifyKioskMode(browser, origin) {
  const layouts = [['ru',320,680], ['tr',320,800], ['en',360,640], ['tr',390,800], ['ru',620,740], ['en',621,740], ['ru',768,620], ['en',1280,800]];
  for (const [lang, width, height] of layouts) {
    const context = await browser.newContext({viewport:{width,height}, isMobile:width <= 620, hasTouch:width <= 620, reducedMotion:'reduce'});
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const menu = page.locator('#kiosk-menu');
    const cart = page.locator('#cart-dialog');
    const total = cart.locator('.total-line strong');
    const addLatte = menu.locator('[data-add="428748"]');
    await page.goto(origin + '/?view=feed&lang=' + lang);
    const toggle = page.locator('#kiosk-toggle');
    const box = await toggle.boundingBox();
    assert(box && box.x >= 0 && box.x + box.width <= width && box.height >= 44, 'visible header entrance');
    await toggle.click();
    await menu.waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'header and menu fit on entry');
    assert.equal(new URL(page.url()).searchParams.get('view'), 'kiosk');
    assert.equal(await menu.locator('#quick-groups button').count(), 3);
    await menu.locator('#quick-results img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    await page.screenshot({path:`artifacts/kiosk-${lang}-${width}.png`});
    await addLatte.click();
    await page.locator('#mobile-cart-open').click();
    assert.equal(await total.innerText(), '200 ₺');
    await cart.locator('.order-bump [data-add="431293"]').click();
    assert.equal(await total.innerText(), '270 ₺');
    assert.equal(await cart.locator('.order-bump').count(), 0);
    await cart.locator('[data-close]').click();
    await page.goBack();
    await page.locator('#products .feed-post').first().waitFor();
    assert.equal(await menu.isVisible(), false);
    assert.equal(await page.locator('#cart-open .cart-count').innerText(), '2');
    await page.goForward();
    await menu.waitFor();
    await page.reload();
    await menu.waitFor();
    assert.equal(await page.locator('#cart-open .cart-count').innerText(), '2');
    await menu.locator('[data-quick-group="all"]').click();
    assert.equal(await menu.locator('[data-quick-item]').count(), 93);
    await menu.locator('#quick-category').selectOption('46818');
    assert.equal(await menu.locator('[data-quick-item]').count(), 24);
    await menu.locator('#quick-search').fill('does-not-exist');
    await menu.locator('[data-quick-reset]').click();
    assert.equal(await menu.locator('[data-quick-item]').count(), 93);
    await menu.locator('#quick-search').fill('americano');
    assert(await menu.locator('[data-quick-item="428743"]').isVisible());
    await menu.locator('[data-quick-group="food"]').click();
    assert(await menu.locator('[data-add="430356"]').isVisible(), 'ready-to-add croissant sandwich');
    if(width === 1280) {
      const actions = await menu.locator('.quick-card-foot .quick-add').evaluateAll(buttons =>
        buttons.map(button => button.getBoundingClientRect().bottom));
      const cartBar = await page.locator('#mobile-cart-open').boundingBox();
      assert(cartBar && Math.max(...actions) <= cartBar.y, `food actions end at ${Math.max(...actions)}, desktop cart bar starts at ${cartBar?.y}`);
    }
    if((lang === 'ru' && width === 320) || width === 390 || width === 1280) {
      await menu.locator('#quick-results img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
      await page.screenshot({path:`artifacts/kiosk-food-${lang}-${width}.png`});
      await verifyDishPreview(page, menu, lang, width);
    }
    await menu.locator('[data-k-start="sandwich"]').click();
    assert(await page.locator('#kiosk-dialog').isVisible());
    await page.locator('#kiosk-dialog [data-k-close]').click();
    await menu.locator('[data-quick-group="pairs"]').click();
    const pairPhotos = menu.locator('.quick-pair').first().locator('.quick-photo');
    const [first, second] = await Promise.all([pairPhotos.nth(0).boundingBox(), pairPhotos.nth(1).boundingBox()]);
    assert(first && second && Math.abs(first.y - second.y) < 1 && first.x + first.width <= second.x, 'pair photos remain side by side');
    if(width === 390 || width === 1280) {
      await pairPhotos.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
      await page.screenshot({path:`artifacts/kiosk-pairs-${lang}-${width}.png`});
    }
    await menu.locator('[data-quick-pair="latte"]').click();
    await page.locator('#cart-open').click();
    assert.equal(await total.innerText(), '540 ₺');
    await cart.locator('[data-service="takeaway"]').click();
    await cart.locator('[data-action="show-staff"]').click();
    assert.equal(await cart.locator('.order-intro[lang="tr"]').innerText(), 'Paket');
    await cart.locator('.order-qr summary').click();
    assert(await cart.locator('canvas').evaluate(canvas => canvas.width > 0 && canvas.getContext('2d').getImageData(0,0,1,1).data[3] === 255));
    await cart.locator('[data-action="next-guest"]').click();
    assert.equal(await page.locator('#cart-open .cart-count').innerText(), '0');
    assert.equal(await menu.locator('[data-quick-group="coffee"]').getAttribute('aria-pressed'), 'true');
    const espresso=menu.locator('.quick-espresso');
    assert.equal(await espresso.locator('.photo-price').innerText(),'75 ₺');
    await espresso.locator('[data-quick-shot="428976"]').click();
    assert.equal(await espresso.locator('.photo-price').innerText(),'130 ₺');
    assert.equal(await espresso.locator('.photo-price').count(),1);
    await espresso.locator('[data-add="428976"]').click();
    await page.locator('#cart-open').click();
    assert.equal(await total.innerText(), '130 ₺');
    assert.equal(await cart.locator('[data-service="dineIn"]').getAttribute('aria-pressed'), 'true');
    await cart.locator('[data-close]').click();
    const layoutWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    assert(layoutWidth <= width, `${lang} kiosk width ${layoutWidth} exceeds ${width}`);
    assert.deepEqual(errors, []);
    await context.close();
  }
  console.log('Kiosk photo framing, selection, full catalog, shared cart, browser history, QR and next guest passed in RU/TR/EN.');
}

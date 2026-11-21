import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const origin=process.env.SMOKE_ORIGIN||'http://127.0.0.1:8123';
await mkdir('artifacts',{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const [lang,width] of [['tr',390],['ru',320],['en',1280]]){
  const ctx=await browser.newContext({viewport:{width,height:850},reducedMotion:'reduce'});
  const page=await ctx.newPage(),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto(origin+'/?lang='+lang+'&view=grid',{waitUntil:'domcontentloaded'});
  const root=page.locator('#family-events-preview');
  assert.equal(await root.isVisible(),false,'unapproved family events stay invisible to ordinary visitors');
  assert.equal(await page.locator('a[href*="preview=family-events"]').count(),0,'no public navigation to demo');

  await page.goto(origin+'/?preview=family-events&lang='+lang+'&view=grid',{waitUntil:'domcontentloaded'});
  await root.locator('[data-events-choice="creative"]').waitFor();
  assert.equal(await root.isVisible(),true);
  assert.equal(await root.locator('.events-preview-state').count(),1);
  assert.equal(await root.locator('[data-events-choice]').count(),3);
  assert.equal(await root.locator('.events-preview-detail').count(),0);
  assert.equal(await root.locator('form').count(),0,'no unapproved RSVP form');
  assert.equal(await root.locator('input').count(),0,'no collection of family/child details');

  const before=await page.evaluate(()=>Object.keys(localStorage).filter(key=>/family-events|event-interest|second-floor/.test(key)));
  await root.locator('[data-events-choice="creative"]').click();
  assert.equal(await root.locator('.events-preview-detail').count(),1);
  assert.equal(await root.locator('[data-events-choice="creative"]').getAttribute('aria-pressed'),'true');
  assert.equal(await root.locator('#events-preview-detail-title').evaluate(el=>document.activeElement===el),true);
  await root.locator('[data-events-choice="meetup"]').click();
  assert.equal(await root.locator('[data-events-choice="meetup"]').getAttribute('aria-pressed'),'true');
  await root.locator('[data-events-choice="celebration"]').click();
  assert.equal(await root.locator('[data-events-choice="celebration"]').getAttribute('aria-pressed'),'true');
  assert.equal(await root.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true,'no horizontal overflow');

  await root.screenshot({path:'artifacts/family-events-prototype-'+lang+'-'+width+'.png'});
  await page.locator('#language').selectOption(lang==='en'?'ru':'en');
  assert.equal(await root.locator('[data-events-choice="celebration"]').getAttribute('aria-pressed'),'true','language change preserves temporary selection');
  await root.locator('[data-events-reset]').click();
  assert.equal(await root.locator('.events-preview-detail').count(),0);

  const after=await page.evaluate(()=>Object.keys(localStorage).filter(key=>/family-events|event-interest|second-floor/.test(key)));
  assert.deepEqual(after,before,'no interest data stored');
  await root.locator('a[href="#menu"]').click();
  assert.equal(new URL(page.url()).hash,'#menu');
  assert.equal(await page.locator('#cart-open').count(),1,'existing ordering remains intact');
  assert.deepEqual(errors,[]);
  console.log('PASS Upstairs Events Lab '+lang+' '+width+'px: hidden by default, honest concepts, dialogue, language, privacy and menu');
  await ctx.close();
 }
}finally{await browser.close();}

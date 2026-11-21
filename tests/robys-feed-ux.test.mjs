import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/robys-feed-ux.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const feed = app.slice(app.indexOf('function feedPost(p) {'), app.indexOf('\nfunction recordView(id)'));

test('Miora feed includes a single photo overlay and opens details from the photo', () => {
  assert.match(feed, /class="feed-media/);
  assert.match(feed, /photoOverlay\(p\.id,menuPrice\(p\)\)/);
  assert.match(feed, /class="feed-photo-button" type="button" data-detail=/);
  assert.ok(!feed.slice(feed.indexOf('class="post-order"')).includes('<strong>'));
});

test('one-column feed and mobile social controls do not replace the grid, gallery, or menu', () => {
  assert.match(css, /body\[data-view="feed"\] \.journey-cards\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /robys-feed-ux\.css\?v=20261122-photo1/);
  assert.match(html, /app\.js\?v=20261122-vertical1/);
  assert.ok(app.includes('disposeGalleries=mountGalleries'));
  assert.ok(app.includes('if(d.share){await shareItem(d.share);return;}'));
  assert.match(app, /if\(d\.favorite\)\{[\s\S]*?toggleFavorite\(d\.favorite\)/);
});

test('optional discovery modules are accessible and do not conceal the ordering paths', () => {
  assert.match(html, /<details class="builder-entry" id="builder-menu">/);
  assert.match(html, /<summary data-journey-copy="made">/);
  assert.match(html, /<details class="spotlight-disclosure" id="spotlight-disclosure" hidden>/);
  assert.match(app, /builderMenu\.open=view!=='feed'/);
  assert.match(app, /\$\('spotlight-disclosure'\)\.hidden=\$\('menu-spotlight'\)\.hidden/);
  assert.match(app, /<details class="journey-index"><summary>/);
  assert.match(css, /\.gallery-footer/);
  assert.ok(html.includes('data-k-start="sandwich"'));
  assert.ok(html.includes('data-k-start="breakfast"'));
});

test('Photo controls show the eye, heart and paper plane', () => {
  assert.match(app, /share:'<path d="m22 2-7 20-4-9-9-4L22 2Z"/);
  const controls = app.slice(app.indexOf('function cardEngagement('), app.indexOf('function photoOverlay('));
  assert.match(controls, /role="group"/);
  assert.match(controls, /data-share-count=/);
  assert.match(controls, /data-view-count=/);
  assert.match(controls, /data-like-count=/);
  assert.match(controls, /aria-pressed=/);
});

test('per-device counters are explicit, and each card mode includes likes, shares and impressions', () => {
  assert.match(app, /scope:'На этом устройстве'/);
  assert.match(app, /function photoOverlay\(id,price\)/);
  for (const field of ['data-like-count', 'data-share-count', 'data-view-count']) {
    assert.ok(app.includes(field), field);
  }
  assert.match(app, /<div class="product-media photo-surface" data-view-id="\$\{p\.id\}"/);
  assert.match(feed, /data-view-id="\$\{p\.id\}"/);
  assert.match(app, /document\.querySelectorAll\('\[data-view-id\]'\)/);
  assert.match(app, /save\('shares',shareCounts\)/);
  assert.match(app, /if\(ok&&pendingShareId\)recordShare\(pendingShareId\)/);
  assert.match(app, /navigator\.share\(\{title:[\s\S]*?\}\);recordShare\(id\)/);
  assert.match(app, /syncSocialStats\(\)/);
  assert.match(html, /id="catalog-social-scope"/);
});


test('conversion-first product detail uses optional specifications, sticky CTA and progressive media', () => {
  const detail = app.slice(app.indexOf('function renderDetail() {'), app.indexOf('\nfunction recommend()'));
  const polish = readFileSync(new URL('../dist/interaction-polish.css', import.meta.url), 'utf8');
  assert.match(html, /interaction-polish\.css\?v=20261122-framing1/);
  assert.match(detail, /<details class="detail-more">/);
  assert.match(detail, /<summary>\$\{esc\(detailCopy\[lang\]\.more\)\}<\/summary>/);
  assert.match(detail, /<p class="detail-allergen-quick"/);
  assert.match(detail, /<p class="photo-provenance"/);
  assert.match(detail, /hasCuratedCutaway\(p\)/);
  assert.doesNotMatch(detail, /turntableMarkup|cakeViewerMarkup|spin-detail-launch/);
  assert.match(detail, /enhanceKioskDetail\(detailId\)/);
  assert.match(detail, /keepDetailsOpen/);
  assert.match(polish, /#detail-dialog \.detail-actions\s*\{[\s\S]*?position: sticky/);
  assert.match(polish, /#detail-dialog \.detail-photo\s*\{[\s\S]*?height: min\(41dvh, 355px\)/);
  assert.match(polish, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(polish, /dialog\[open\]\s*\{[\s\S]*?animation:miora-dialog-in/);
  assert.match(app, /if\(added&&button\.closest\('#detail-dialog'\)/);
});


test('the customer-facing menu has no AI 360 controls and only curated static cutaways',()=>{
  const appDetail=app.slice(app.indexOf('function renderDetail() {'), app.indexOf('\nfunction recommend()'));
  const motion=readFileSync(new URL('../dist/menu-motion.js',import.meta.url),'utf8');
  const photos=readFileSync(new URL('../dist/photos.js',import.meta.url),'utf8');
  const policy=readFileSync(new URL('../dist/media-merchandising.js',import.meta.url),'utf8');
  assert.ok(app.includes('hasCuratedCutaway'));
  assert.ok(appDetail.includes('detail-cutaway'));
  assert.ok(appDetail.includes("photo(p,640,'inside')"));
  assert.ok(appDetail.includes('loading="lazy"'));
  assert.ok(appDetail.includes('cutawayCopy[lang].note'));
  assert.doesNotMatch(app,/from '\.\/turntable\.js|from '\.\/cake-interiors\.js|data-spin=|turntableMarkup|cakeViewerMarkup/);
  assert.doesNotMatch(motion,/from '\.\/turntable\.js|from '\.\/cake-interiors\.js|spin-card-launch|data-spin=|cake-feed-hint/);
  assert.doesNotMatch(html,/href="turntable\.css|href="cake-interiors\.css/);
  assert.match(policy,/new Set\(\['430226','429808'\]\)/);
  assert.match(policy,/customer360Enabled = false/);
  assert.match(photos,/export const photoVariants=item=>focusedPhotos/);
  assert.doesNotMatch(photos.split('export const photoVariants=')[1].split(';')[0],/inside/);
});


test('responsive layout preserves the established list column and search toolbar',()=>{
  const fixed=readFileSync(new URL('../dist/responsive-layout-fix.css',import.meta.url),'utf8');
  assert.match(html,/responsive-layout-fix\.css\?v=20261122-photo1/);
  assert.match(fixed,/body\[data-view="list"\] #products\.list-view \.product-card/);
  assert.match(fixed,/grid-template-columns:clamp\(96px,29%,138px\) minmax\(0,1fr\)/);
  assert.match(fixed,/body:not\(\[data-view="feed"\]\) \.toolbar \.search-row/);
  assert.match(fixed,/grid-row:2/);
});

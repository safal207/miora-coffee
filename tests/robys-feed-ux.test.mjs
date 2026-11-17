import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../dist/robys-feed-ux.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const feed = app.slice(app.indexOf('function feedPost(p) {'), app.indexOf('\nfunction recordView(id)'));

test('Miora feed has exactly one accessible vertical social group with saved, share and detail controls', () => {
  assert.match(feed, /class="feed-action-rail" role="group"/);
  assert.equal((feed.match(/class="icon-btn feed-rail-button"/g) || []).length, 2);
  assert.match(feed, /class="icon-btn feed-save feed-rail-button"/);
  for (const action of ['data-favorite=', 'data-share=', 'data-detail=']) {
    assert.ok(feed.includes(action), action);
  }
  assert.match(feed, /aria-pressed="\$\{favorites\.has\(p\.id\)\}"/);
  assert.match(feed, /aria-label=/);
  assert.match(feed, /\$\{p\.price===null\?t\('ask'\):money\(p\.price\)\}/);
});

test('one-column feed and mobile social controls do not replace the grid, gallery, or menu', () => {
  assert.match(css, /body\[data-view="feed"\] \.journey-cards\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.feed-action-rail\s*\{[\s\S]*?flex-direction: column/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(html, /robys-feed-ux\.css\?v=20261117-counts1/);
  assert.match(html, /app\.js\?v=20261117-counts1/);
  assert.ok(app.includes('disposeGalleries=mountGalleries'));
  assert.ok(app.includes('if(d.share){await shareItem(d.share);return;}'));
  assert.ok(app.includes('if(d.favorite){toggleFavorite(d.favorite);return;}'));
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

test('Instagram-style paper airplane and right-side actions are used on every card layout', () => {
  assert.match(app, /share:'<path d="m22 2-7 20-4-9-9-4L22 2Z"/);
  assert.match(app, /<div class="product-social" role="group"/);
  assert.match(app, /data-share="\$\{p\.id\}" aria-label="\$\{esc\(t\('share'\)/);
  assert.match(css, /body:not\(\[data-view="feed"\]\) \.product-media \.product-social \{/);
  assert.match(css, /body\[data-view="list"\] \.product-media \.product-social button:first-child \{\s*display: flex;/);
  assert.equal((app.match(/\$\{icon\('share'\)\}/g) || []).length, 4, 'share also appears in the statistics row');
});

test('per-device counters are explicit, and each card mode includes likes, shares and impressions', () => {
  assert.match(app, /scope:'На этом устройстве'/);
  assert.match(app, /function socialStats\(id\)/);
  for (const field of ['data-like-count', 'data-share-count', 'data-view-count']) {
    assert.ok(app.includes(field), field);
  }
  assert.match(app, /<div class="product-media" data-view-id="\$\{p\.id\}"/);
  assert.match(app, /<div class="feed-media" data-view-id="\$\{p\.id\}"/);
  assert.match(app, /document\.querySelectorAll\('\[data-view-id\]'\)/);
  assert.match(app, /save\('shares',shareCounts\)/);
  assert.match(app, /if\(ok&&pendingShareId\)recordShare\(pendingShareId\)/);
  assert.match(app, /navigator\.share\(\{title:[\s\S]*?\}\);recordShare\(id\)/);
  assert.match(app, /syncSocialStats\(\)/);
  assert.match(css, /\.social-stats-scope/);
});

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
  assert.match(html, /robys-feed-ux\.css\?v=20261117-robys1/);
  assert.match(html, /app\.js\?v=20261117-robys1/);
  assert.ok(app.includes('disposeGalleries=mountGalleries'));
  assert.ok(app.includes('if(d.share){await shareItem(d.share);return;}'));
  assert.ok(app.includes('if(d.favorite){toggleFavorite(d.favorite);return;}'));
});

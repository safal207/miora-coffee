import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EVENT_PREVIEW_PARAM,EVENT_IDEAS,FAMILY_EVENTS_COPY,isFamilyEventsPreview,eventIdea} from '../dist/family-events.js';

test('events concept has explicit review-only URL gate and is never default-enabled',()=>{
 assert.equal(EVENT_PREVIEW_PARAM,'family-events');
 assert.equal(isFamilyEventsPreview(''),false);
 assert.equal(isFamilyEventsPreview('?lang=ru'),false);
 assert.equal(isFamilyEventsPreview('?preview=family-events'),true);
 assert.equal(isFamilyEventsPreview('?lang=ru&preview=family-events'),true);
 assert.equal(isFamilyEventsPreview('?preview=other'),false);
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(html,/id="family-events-preview"[^>]*hidden/);
 assert.match(html,/family-events-preview\.js\?v=20261121-v1/);
 assert.doesNotMatch(html,/<a[^>]+href="[^"]*preview=family-events/);
});
test('three hypothetical examples are distinguished from real events',()=>{
 assert.deepEqual(EVENT_IDEAS,['creative','meetup','celebration']);
 for(const lang of ['tr','ru','en']){
  const c=FAMILY_EVENTS_COPY[lang];
  assert(c.status.length>10);
  assert(c.lead.length>70);
  assert(c.detail.length>55);
  assert(c.floor.length>70);
  assert(c.privacy.length>30);
  for(const id of EVENT_IDEAS){
    const idea=eventIdea(id,lang);
    assert(idea.title.length>6);
    assert(idea.tag.length>5);
    assert(idea.body.length>55);
    assert(!/₺|\$\d|202[0-9]-[0-9]|\b(?:tickets available|book now|reserve now)\b/i.test(idea.body));
  }
 }
 assert.equal(eventIdea('missing','ru'),null);
 assert.equal(eventIdea('__proto__','ru'),null);
});
test('concept cannot submit, reserve, advertise or track personal data',()=>{
 const js=readFileSync(new URL('../dist/family-events-preview.js',import.meta.url),'utf8');
 const copy=readFileSync(new URL('../dist/family-events.js',import.meta.url),'utf8');
 assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage|FormData|\bPOST\b|mailto:/);
 assert.doesNotMatch(copy,/\bfetch\s*\(|localStorage|sessionStorage|sendBeacon/);
 assert.match(js,/id="events-preview-title"/);
 assert.match(js,/data-events-choice/);
 assert.match(js,/data-events-reset/);
 assert.match(js,/href="#menu"/);
});

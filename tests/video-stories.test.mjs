import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {stories,videoStory,dessertStoryVisible} from '../dist/video-stories.js';
import {products} from '../dist/menu-data.js';

test('original video links have local covers, honest language labels and no third-party loads',()=>{
  for(const [key,story] of Object.entries(stories)){
    assert.ok(existsSync(`dist/${story.cover}`));
    if(story.product)assert.ok(products.some(p=>p.id===story.product));
    for(const lang of ['ru','tr','en']){
      const html=videoStory(key,lang);
      assert.ok(html.includes(`https://www.instagram.com/p/${story.code}/`));
      assert.ok(html.includes(story.title[lang]));
      assert.match(html,/rel="noopener noreferrer" referrerpolicy="no-referrer"/);
      assert.doesNotMatch(html,/<iframe|<video|<script|autoplay|src="https?:/i);
      assert.match(html,/width="160" height="160" loading="lazy"/);
      assert.doesNotMatch(videoStory(key,lang,{compact:true}),/<img/);
    }
  }
  assert.equal(videoStory('unknown'),'');
  assert.ok(videoStory('breakfast','invalid').includes(stories.breakfast.title.tr));
});
test('dessert inspiration is absent from unrelated, favorites and search results',()=>{
  for(const category of ['all','featured','46818'])assert.equal(dessertStoryVisible(category),true);
  for(const category of ['favorites','46885','46776','unknown'])assert.equal(dessertStoryVisible(category),false);
  assert.equal(dessertStoryVisible('all','latte'),false);
  assert.equal(dessertStoryVisible('46818','çilek'),false);
  assert.equal(dessertStoryVisible('all','  '),true);
  assert.doesNotMatch(videoStory('dessert','en'),/data-add|data-detail/);
  assert.match(videoStory('croissant','en'),/data-detail="430356"/);
});

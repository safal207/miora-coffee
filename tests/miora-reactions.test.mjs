import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {products,categories} from '../dist/menu-data.js';
import {STICKER_STORAGE_KEY,STICKER_LIMIT,CATEGORY_STICKERS,STICKER_COPY,stickerOptions,readStickers,chooseSticker,personalStickerAlbum} from '../dist/miora-reactions.js';

const catalog=new Map(products.map(item=>[item.id,item]));
const store=()=>{
 const data=new Map();
 return {getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value)),removeItem:key=>data.delete(key)};
};

test('all eight actual Miora categories have exactly three distinct localized emotions',()=>{
 assert.equal(products.length,93);
 assert.deepEqual(new Set(Object.keys(CATEGORY_STICKERS)),new Set(categories.map(c=>c.id)));
 for(const category of categories){
  for(const locale of ['tr','ru','en']){
   const choices=stickerOptions(category.id,locale);
   assert.equal(choices.length,3,category.id+' '+locale);
   assert.equal(new Set(choices.map(x=>x.id)).size,3);
   assert(choices.every(x=>x.emoji.length>0&&x.label.trim().length>0));
  }
 }
 for(const p of products)assert.equal(stickerOptions(p.cat,'ru').length,3,p.id);
 assert.deepEqual(stickerOptions('unknown','ru'),[]);
 assert.deepEqual(stickerOptions(categories[0].id,'unknown'),stickerOptions(categories[0].id,'tr'));
});
test('personal stickers do not exist until a person actually taps one',()=>{
 const s=store();assert.deepEqual(readStickers(s,catalog),{});
 assert.equal(s.getItem(STICKER_STORAGE_KEY),null);
 assert.equal(personalStickerAlbum(readStickers(s,catalog),catalog).length,0);
});
test('selecting replaces an existing sticker; tapping again removes it',()=>{
 const s=store(),id='428748';
 const choices=stickerOptions(catalog.get(id).cat,'ru');
 const a=chooseSticker(s,catalog,id,choices[0].id);
 assert.equal(a.ok,true);assert.equal(a.selected,choices[0].id);
 assert.deepEqual(readStickers(s,catalog),{[id]:choices[0].id});
 const b=chooseSticker(s,catalog,id,choices[1].id);
 assert.equal(b.ok,true);assert.equal(b.selected,choices[1].id);
 assert.deepEqual(readStickers(s,catalog),{[id]:choices[1].id});
 const c=chooseSticker(s,catalog,id,choices[1].id);
 assert.equal(c.ok,true);assert.equal(c.selected,null);
 assert.deepEqual(readStickers(s,catalog),{});
 assert.equal(s.getItem(STICKER_STORAGE_KEY),null);
});
test('one sticker per product, many independent dishes, no global reputation counts',()=>{
 const s=store();
 for(const item of products){
  const choice=stickerOptions(item.cat,'tr')[0];
  assert.equal(chooseSticker(s,catalog,item.id,choice.id).ok,true);
 }
 const album=personalStickerAlbum(readStickers(s,catalog),catalog,'ru');
 assert.equal(album.length,STICKER_LIMIT);
 assert.equal(new Set(album.map(x=>x.id)).size,93);
 const state=JSON.parse(s.getItem(STICKER_STORAGE_KEY));
 assert.deepEqual(Object.keys(state).sort(),['items','version']);
 assert.equal(state.version,1);
 assert.equal(Object.keys(state.items).length,93);
 assert.equal(JSON.stringify(state).includes('viewCount'),false);
 assert.equal(JSON.stringify(state).includes('guestVotes'),false);
 assert.equal(JSON.stringify(state).includes('price'),false);
});
test('sticker and heart favorites are independent storage and actions',()=>{
 const s=store();
 s.setItem('miora:favorites',JSON.stringify(['428748']));
 const opt=stickerOptions(catalog.get('428748').cat,'ru')[2];
 chooseSticker(s,catalog,'428748',opt.id);
 assert.equal(s.getItem('miora:favorites'),'["428748"]');
 assert.equal(readStickers(s,catalog)['428748'],opt.id);
 chooseSticker(s,catalog,'428748',opt.id);
 assert.equal(s.getItem('miora:favorites'),'["428748"]');
});
test('invalid product/category/sticker does not overwrite stored preferences',()=>{
 const s=store(),id='428748',code=stickerOptions(catalog.get(id).cat,'en')[0].id;
 chooseSticker(s,catalog,id,code);
 const before=s.getItem(STICKER_STORAGE_KEY);
 for(const [item,choice] of [['999999',code],['__proto__',code],[id,'invalid'],[id,'yum'],[id,3]]){
  assert.equal(chooseSticker(s,catalog,item,choice).ok,false);
  assert.equal(s.getItem(STICKER_STORAGE_KEY),before);
 }
});
test('untrusted, malformed, obsolete and blocked local storage is handled safely',()=>{
 const s=store();
 s.setItem(STICKER_STORAGE_KEY,'{oops');
 assert.deepEqual(readStickers(s,catalog),{});
 s.setItem(STICKER_STORAGE_KEY,JSON.stringify({version:2,items:{'428748':'cozy'}}));
 assert.deepEqual(readStickers(s,catalog),{});
 s.setItem(STICKER_STORAGE_KEY,JSON.stringify({version:1,items:{'428748':'cozy','430226':'cozy','999999':'cozy','428772':'yum'}}));
 assert.deepEqual(readStickers(s,catalog),{'428748':'cozy'});
 const blocked={getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');},removeItem:()=>{throw Error('denied');}};
 assert.deepEqual(readStickers(blocked,catalog),{});
 assert.equal(chooseSticker(blocked,catalog,'428748','cozy').ok,false);
 assert.equal(chooseSticker(null,catalog,'428748','cozy').ok,false);
});
test('album shows original item, localized reaction, never fabricated community totals',()=>{
 const s=store(),id='430226';
 chooseSticker(s,catalog,id,'yum');
 const [entry]=personalStickerAlbum(readStickers(s,catalog),catalog,'ru');
 assert.equal(entry.id,id);
 assert.equal(entry.product,catalog.get(id));
 assert.equal(entry.sticker.label,'Ням');
 assert.equal(entry.sticker.emoji,'😋');
 assert.deepEqual(personalStickerAlbum({'430226':'yum','999999':'yum'},catalog,'ru').map(x=>x.id),[id]);
});
test('reactions copy discloses device-only scope in all three languages',()=>{
 for(const lang of ['ru','tr','en']){
  const c=STICKER_COPY[lang];
  for(const key of ['title','scope','saved','removed','failed','album','albumNote','choose','remove'])
    assert.equal(typeof c[key],'string',lang+' '+key);
 }
 assert.match(STICKER_COPY.ru.scope,/устройстве/);
 assert.match(STICKER_COPY.en.scope,/not a guest vote/);
});
test('markup preserves original separate favorites, share, views and source prices',()=>{
 const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
 assert.match(app,/function stickerBar\(p\)/);
 assert.match(app,/\$\{stickerBar\(p\)\}/);
 assert.match(app,/function toggleFavorite\(id\)/);
 assert.match(app,/function socialStats\(id\)/);
 assert.match(app,/function renderStickerAlbum\(\)/);
 assert.match(app,/chooseSticker\(localStorage,byId,d\.stickerId,d\.stickerCode\)/);
 assert.match(html,/id="sticker-collection"[^>]*hidden/);
 assert.match(html,/miora-reactions\.css\?v=20261121-v1/);
 assert.match(html,/app\.js\?v=20261121-stickers1/);
 const module=readFileSync(new URL('../dist/miora-reactions.js',import.meta.url),'utf8');
 assert.doesNotMatch(module,/\bfetch\s*\(|sendBeacon|XMLHttpRequest|guestCount|shareCount/);
});

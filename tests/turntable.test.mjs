import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {products} from '../dist/menu-data.js';
import {turntables} from '../dist/turntable-data.js';
import {hasTurntable,wrapFrame,frameRect,turntableMarkup,spinCopy,viewLabel} from '../dist/turntable.js';
const ids=['430198','429872','430207','431299','430214','431304','431302'].sort();
test('360-degree frame navigation wraps in both directions and crops stay inside every atlas',()=>{
 assert.equal(wrapFrame(-1,12),11);assert.equal(wrapFrame(12,12),0);assert.equal(wrapFrame(25,12),1);assert.equal(wrapFrame(NaN,12),0);assert.equal(wrapFrame(2,0),0);
 for(const record of Object.values(turntables)){
  const cells=[];for(let index=0;index<record.frames;index++){const r=frameRect(index,record);assert.ok(r.x>=0&&r.y>=0&&r.width>200&&r.height>200);assert.ok(r.x+r.width<=record.width&&r.y+r.height<=record.height);cells.push(JSON.stringify(r));}
  assert.equal(new Set(cells).size,12);assert.deepEqual(frameRect(-1,record),frameRect(11,record));assert.deepEqual(frameRect(12,record),frameRect(0,record));
 }
});
test('seven reviewed AI turntables have bounded local assets and reference/output hashes',()=>{
 const m=JSON.parse(readFileSync(new URL('../docs/turntable-provenance-2026-11-16.json',import.meta.url))),hash=b=>createHash('sha256').update(b).digest('hex');
 assert.deepEqual(Object.keys(turntables).sort(),ids);assert.equal(m.frames,12);assert.equal(m.columns,4);assert.equal(m.rows,3);
 for(const [id,p] of Object.entries(m.photos)){
  const data=turntables[id],bytes=readFileSync(new URL('../dist/'+data.src,import.meta.url));assert.ok(hasTurntable(products.find(p=>p.id===id)));assert.equal(hash(bytes),p.asset.sha256);assert.equal(bytes.length,data.bytes);assert.ok(bytes.length<600000);assert.equal(p.visualReview,'accepted');assert.equal(p.tool,'built-in image_gen');assert.ok(p.prompt.length>200);assert.equal(hash(readFileSync(new URL('../dist/'+p.reference,import.meta.url))),p.referenceSha256);
 }
 assert.equal(hasTurntable(null),false);assert.equal(hasTurntable(products.find(p=>p.id==='428748')),false);
});
test('viewer is localized and does not include an eager atlas, autoplay or fabricated product details',()=>{
 for(const lang of ['ru','tr','en'])for(const id of ids){
  const p=products.find(p=>p.id===id),html=turntableMarkup(p,lang,p.name[lang]);assert.ok(html.includes('type="range"'));assert.ok(html.includes(spinCopy[lang].note));assert.ok(html.includes(spinCopy[lang].photo));assert.ok(html.includes('data-spin-retry'));assert.ok(!html.includes(turntables[id].src));assert.ok(!/<video|<iframe|autoplay|src="https?:/.test(html));assert.ok(viewLabel(lang,11,12).includes('12'));assert.equal((html.match(/data-add=/g)||[]).length,p.price===null?0:1);
 }
 assert.equal(turntableMarkup(products.find(p=>p.id==='428748'),'en','Latte'),'');
});

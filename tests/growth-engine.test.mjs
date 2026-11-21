import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../dist/menu-data.js';
import {selectCartOffer,readGrowthEvents,recordGrowthEvent,growthSummary,GROWTH_STORAGE_KEY,GROWTH_EVENT_TYPES} from '../dist/growth-engine.js';

const catalog = new Map(products.map(product => [product.id, product]));
const store = () => {
  const values = new Map();
  return {
    getItem:key => values.has(key) ? values.get(key) : null,
    setItem:(key,value) => values.set(key,String(value))
  };
};

test('no unsolicited offer on an empty or fully paired order',()=>{
  assert.equal(selectCartOffer({cart:{},catalog}),null);
  assert.equal(selectCartOffer({cart:{'428748':1,'430226':1},catalog}),null);
});
test('drink-only order proposes actual menu dessert at unchanged price',()=>{
  const offer=selectCartOffer({cart:{'428748':1},catalog});
  assert.equal(offer.id,'430226');
  assert.equal(offer.price,catalog.get('430226').price);
  assert.equal(offer.price,25000);
});
test('food-only and personalized kiosk orders propose an available drink',()=>{
  assert.equal(selectCartOffer({cart:{'430350':1},catalog}).id,'428772');
  assert.equal(selectCartOffer({configuredOrders:[{kind:'sandwich'}],catalog}).id,'428772');
});
test('already-selected first choice yields a different legitimate product, never a duplicate',()=>{
  assert.equal(selectCartOffer({cart:{'428748':1,'430226':1},catalog}),null);
  assert.equal(selectCartOffer({cart:{'428748':1,'430350':1},catalog}),null);
  const first=selectCartOffer({cart:{'428748':1,'430226':0},catalog});
  assert.equal(first.id,'430350');
});
test('unpriced products, invalid quantity, failed storage and explicitly suppressed offers are safe',()=>{
  assert.equal(selectCartOffer({cart:{'431302':1},catalog}),null);
  assert.equal(selectCartOffer({cart:{'428748':-1},catalog}),null);
  assert.equal(selectCartOffer({cart:{'428748':1},catalog,suppressed:true}),null);
  assert.equal(selectCartOffer({cart:{'428748':1},catalog:null}),null);
  assert.equal(selectCartOffer({cart:{'428748':1},catalog:new Map()}),null);
});
test('analytics rejects unknown event names, personal data and unsafe product identifiers',()=>{
  const storage=store();
  assert.equal(recordGrowthEvent(storage,'purchase'),false);
  assert.equal(recordGrowthEvent(storage,'product_open','person@example.com'),false);
  assert.equal(recordGrowthEvent(storage,'offer_visible','430226',-1),false);
  assert.equal(readGrowthEvents(storage).length,0);
  assert.equal(recordGrowthEvent(storage,'product_open','428748',123),true);
  assert.deepEqual(readGrowthEvents(storage),[{type:'product_open',productId:'428748',at:123}]);
});
test('analytics remains bounded, local, and never claims purchases or revenue',()=>{
  const storage=store();
  for(let i=0;i<240;i++)assert.equal(recordGrowthEvent(storage,'menu_visit',null,100+i),true);
  const raw=storage.getItem(GROWTH_STORAGE_KEY);
  assert.equal(JSON.parse(raw).length,200);
  assert.equal(readGrowthEvents(storage)[0].at,140);
  assert(!GROWTH_EVENT_TYPES.includes('purchase'));
  assert(!GROWTH_EVENT_TYPES.includes('payment'));
});
test('offer take rate handles no exposure and exactly observed acceptance',()=>{
  const storage=store();
  assert.equal(growthSummary(readGrowthEvents(storage)).offerTakeRate,null);
  recordGrowthEvent(storage,'offer_visible','430226',123);
  recordGrowthEvent(storage,'offer_accepted','430226',124);
  const result=growthSummary(readGrowthEvents(storage));
  assert.equal(result.counts.offer_visible,1);
  assert.equal(result.counts.offer_accepted,1);
  assert.equal(result.offerTakeRate,1);
});
test('broken or blocked browser storage never interrupts browsing',()=>{
  const broken={getItem:()=>'{malformed',setItem:()=>{throw new Error('blocked');}};
  assert.deepEqual(readGrowthEvents(broken),[]);
  assert.equal(recordGrowthEvent(broken,'cart_open'),false);
  assert.equal(recordGrowthEvent(null,'cart_open'),false);
});
test('recommendation logic is pure and does not touch the cart',()=>{
  const cart={'428748':2};
  const previous=structuredClone(cart);
  selectCartOffer({cart,catalog});
  assert.deepEqual(cart,previous);
});

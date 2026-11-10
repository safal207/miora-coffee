import test from 'node:test';
import assert from 'node:assert/strict';
import {products} from '../dist/menu-data.js';
import {recipes,ui,localized} from '../dist/kiosk-data.js';
import {initialSelection,choose,validSelection,orderPrice,makeOrder,normalizeOrders,appendOrder,changeOrderQty,configuredTotals,describeOrder} from '../dist/kiosk-core.js';

test('original 93-item catalog stays unchanged and photographed builders are additive',()=>{
  assert.equal(products.length,93);
  assert.deepEqual(Object.keys(recipes).sort(),['breakfast','croissant','pancake','sandwich']);
  assert.equal(recipes.sandwich.price,35000);
  assert.equal(recipes.sandwich.estimated,true);
  assert.equal(orderPrice('pancake',{}),25000);
  assert.equal(orderPrice('croissant',{}),35000);
});
test('sandwich respects six breads and photographic option limits',()=>{
  const r=recipes.sandwich;
  assert.deepEqual(r.steps.map(s=>s.max),[1,2,2,1,2]);
  assert.deepEqual(r.steps.map(s=>s.items.length),[6,6,6,7,5]);
  let s=initialSelection('sandwich');
  assert.equal(validSelection('sandwich',s),true);
  assert.equal(orderPrice('sandwich',s),35000);
  s=choose(s,r.steps[1],'labne');
  s=choose(s,r.steps[1],'ezine');
  assert.deepEqual(s.cheese,['labne','ezine']);
  assert.strictEqual(choose(s,r.steps[1],'cheddar'),s);
  s=choose(s,r.steps[1],'labne');
  assert.deepEqual(s.cheese,['ezine']);
  assert.equal(validSelection('sandwich',{...s,bread:[]}),false);
  assert.equal(validSelection('sandwich',{...s,bread:['olive','plain']}),false);
  assert.equal(validSelection('sandwich',{...s,bread:['fake']}),false);
  assert.equal(validSelection('sandwich',{...s,extra:['salmon','tuna']}),false);
  assert.equal(validSelection('sandwich',{...s,invalid:['salmon']}),false);
});
test('breakfast variant and photographic surcharges in integer kuruş',()=>{
  const r=recipes.breakfast;let s=initialSelection('breakfast');
  assert.equal(orderPrice('breakfast',s),45000);
  s=choose(s,r.steps[0],'mini');
  assert.equal(orderPrice('breakfast',s),40000);
  s=choose(s,r.steps[0],'bread');
  assert.equal(orderPrice('breakfast',s),35000);
  s=choose(s,r.steps[3],'bread');
  assert.equal(orderPrice('breakfast',s),37000);
  s=choose(s,r.steps[3],'mini');
  assert.equal(orderPrice('breakfast',s),41000);
  s=choose(s,r.steps[2],'nutella');
  assert.equal(orderPrice('breakfast',s),41000);
  assert.equal(validSelection('breakfast',{...s,egg:[]}),false);
});
test('normalized custom orders recalculate prices and preserve fillings separately',()=>{
  const s=initialSelection('sandwich');
  const a=makeOrder('sandwich',s,1);
  const b=makeOrder('sandwich',choose(s,recipes.sandwich.steps[3],'salmon'),1);
  const orders=normalizeOrders([a,b,a,{kind:'pancake',selection:{},qty:1},{kind:'sandwich',selection:{bread:['fake']},qty:10}]);
  assert.equal(orders.length,3);
  assert.deepEqual(orders.map(x=>x.qty),[2,1,1]);
  assert.deepEqual(configuredTotals(orders),{count:4,price:130000});
  assert.match(describeOrder(b,'ru'),/Лосось/);
  assert.match(describeOrder(b,'tr'),/Somon balığı/);
  assert.match(describeOrder(b,'en'),/Salmon/);
  assert.deepEqual(appendOrder(orders,a).map(x=>x.qty),[3,1,1]);
  assert.equal(changeOrderQty(orders,1,-1).length,2);
  assert.equal(makeOrder('sandwich',s,0),null);
  assert.equal(makeOrder('sandwich',s,100),null);
  assert.equal(orderPrice('breakfast',{base:['large'],egg:['wrong'],sweet:[],addons:[]}),null);
  assert.equal(appendOrder([{...a,qty:99}],a),null);
  assert.deepEqual(normalizeOrders({kind:'sandwich'}),[]);
  assert.equal(makeOrder('__proto__',{},1),null);
  assert.deepEqual(normalizeOrders([{kind:'constructor',selection:{},qty:1}]),[]);
});
test('every kiosk option and call-to-action is localized into TR/RU/EN',()=>{
  for(const language of ['tr','ru','en']){
    for(const key of ['title','build','next','previous','add','close','step','confirm','allergens'])
      assert.ok(ui[language][key]?.length,language+': '+key);
    for(const r of Object.values(recipes)){
      assert.ok(localized(r.name,language));assert.ok(localized(r.note,language));
      for(const step of r.steps){
        assert.ok(localized(step.title,language));
        for(const item of step.items)assert.ok(localized(item.label,language));
      }
    }
  }
});

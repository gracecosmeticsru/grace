import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {checkoutTotal, emptyCheckoutFields, normalizePhone, prepareGuestOrder, submitGuestOrder, validateCheckout} from '../lib/guest-checkout.ts';
const products = JSON.parse(readFileSync(new URL('../data/products.json', import.meta.url), 'utf8'));
const product = products.find(p => p.variants.length > 1 && p.variants.every(v => v.price > 0));
const bag = [{product, variant: product.variants[1], quantity: 2}];
const cdek = {...emptyCheckoutFields, fullName: 'Тестовый Покупатель', phone: '+7 (000) 000-00-00', city: 'Тестовый город', pickupPoint: {code:'TEST1',city:'Тестовый город',address:'Тестовая улица, 1',countryCode:'RU'}};
const post = {...cdek, delivery: 'post', region: 'Тестовая область', postcode: '000000', address: 'Тестовая улица, 1'};

test('valid delivery payload contains only the active branch and exact variant IDs', () => {
  const c = prepareGuestOrder({...cdek, region: 'ignore', postcode: 'bad'}, bag);
  assert.equal(c.ok, true);
  assert.deepEqual(c.request.delivery, {method: 'cdek', mode:'pickup',countryCode:'RU',pickupPoint:cdek.pickupPoint});
  assert.deepEqual(c.request.items, [{productId: product.id, variantId: product.variants[1].id, quantity: 2}]);
  assert.equal(c.request.customer.phone, '+70000000000');
  assert.equal('price' in c.request.items[0], false);
  const p = prepareGuestOrder({...post, pickupPoint: null, apartment: '  12 '}, bag);
  assert.equal(p.ok, true);
  assert.equal(p.request.delivery.apartment, '12');
  assert.equal('pickupPoint' in p.request.delivery, false);
  assert.equal(prepareGuestOrder(post, bag).ok, true); // Apartment and patronymic are optional.
});

test('empty and invalid contact fields have errors; formatting and international phones normalize', () => {
  assert.deepEqual(Object.keys(validateCheckout(emptyCheckoutFields, bag)), ['fullName', 'phone', 'city', 'pickupPoint']);
  for (const phone of ['+7', 'call 70000000000', '+70000000000 ext 1', '++70000000000', '+1234567890123456', '00000000000']) assert.equal(normalizePhone(phone), null, phone);
  assert.equal(normalizePhone('8 (000) 000-00-00'), '+70000000000');
  assert.equal(normalizePhone('+44 7700 900000'), '+447700900000');
  assert.equal(prepareGuestOrder({...cdek, fullName: 'Тест'}, bag).ok, false);
  assert.equal(prepareGuestOrder({...cdek, fullName: '-- --'}, bag).ok, false);
  assert.equal(prepareGuestOrder({...cdek, fullName: 'Тестовый Покупатель Отчество'}, bag).ok, true);
});

test('each delivery validates only the necessary fields, including maximum lengths', () => {
  for (const key of ['region', 'postcode', 'address']) assert.ok(validateCheckout({...post, [key]: ''}, bag)[key]);
  assert.ok(validateCheckout({...post, postcode: '12A456'}, bag).postcode);
  assert.ok(validateCheckout({...cdek, city: 'x'.repeat(121)}, bag).city);
  assert.ok(validateCheckout({...cdek, pickupPoint: {...cdek.pickupPoint,address:'x'.repeat(251)}}, bag).pickupPoint);
  assert.ok(validateCheckout({...cdek, pickupPoint: {...cdek.pickupPoint,countryCode:'KZ'}}, bag).pickupPoint);
  assert.ok(validateCheckout({...cdek,city:'Другой город'}, bag).pickupPoint);
  assert.ok(validateCheckout({...post, apartment: 'x'.repeat(31)}, bag).apartment);
  assert.ok(validateCheckout({...cdek, delivery: 'invalid'}, bag).delivery);
});

test('courier needs an address, but no postcode/PVZ; comment is optional and bounded',()=>{
  const courier={...post,delivery:'cdek-courier',postcode:'',pickupPoint:null,comment:'  Просьба по доставке  '};
  const result=prepareGuestOrder(courier,bag);
  assert.equal(result.ok,true);
  assert.equal(result.request.delivery.method,'cdek');
  assert.equal(result.request.delivery.mode,'courier');
  assert.equal(result.request.delivery.countryCode,'RU');
  assert.equal('postcode' in result.request.delivery,false);
  assert.equal('pickupPoint' in result.request.delivery,false);
  assert.equal(result.request.comment,'Просьба по доставке');
  assert.ok(validateCheckout({...courier,address:''},bag).address);
  assert.ok(validateCheckout({...courier,comment:'x'.repeat(501)},bag).comment);
  assert.equal('comment' in prepareGuestOrder(post,bag).request,false);
});

test('store pickup needs contacts only and omits hidden shipping fields from the request', () => {
  const pickup = {...emptyCheckoutFields, fullName: cdek.fullName, phone: cdek.phone, delivery: 'store-pickup'};
  for (const fields of [pickup, {...post, delivery: 'store-pickup', postcode: 'invalid', address: 'x'.repeat(300)}]) {
    const prepared = prepareGuestOrder(fields, bag);
    assert.equal(prepared.ok, true);
    assert.deepEqual(prepared.request.delivery, {method: 'store-pickup', countryCode: 'RU'});
  }
  assert.deepEqual(Object.keys(validateCheckout({...pickup, fullName: '', phone: ''}, bag)), ['fullName', 'phone']);
});

test('empty bag, invalid quantities, mismatched and duplicate variants are rejected without mutation', () => {
  const before = structuredClone(bag);
  assert.ok(validateCheckout(cdek, []).items);
  for (const quantity of [0, -1, 1.5, 100, Infinity, NaN]) assert.ok(validateCheckout(cdek, [{...bag[0], quantity}]).items);
  assert.ok(validateCheckout(cdek, [{...bag[0], variant: {...bag[0].variant, id: 'wrong'}}]).items);
  assert.ok(validateCheckout(cdek, [bag[0], bag[0]]).items);
  assert.deepEqual(bag, before);
});

test('totals use quantities and kopecks; absent prices cannot become zero or a partial total', () => {
  const line = price => ({...bag[0], variant: {...bag[0].variant, price}, quantity: 3});
  assert.equal(checkoutTotal([line(0.1)]), 0.3);
  assert.equal(checkoutTotal(bag), Math.round(bag[0].variant.price * 100) * 2 / 100);
  assert.equal(checkoutTotal([]), null);
  for (const price of [null, 0, -1, undefined, NaN, Infinity]) assert.equal(checkoutTotal([bag[0], line(price)]), null);
});

test('unavailable transport never sends, never reports success and preserves input', async () => {
  const fields = structuredClone(post);
  const before = structuredClone(fields);
  const prepared = prepareGuestOrder(fields, bag);
  assert.equal(prepared.ok, true);
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = () => {calls++; throw Error('No network is allowed');};
  try {
    const response = await submitGuestOrder(prepared.request);
    assert.deepEqual({ok: response.ok, code: response.code}, {ok: false, code: 'unavailable'});
    assert.match(response.message, /Заказ не отправлен/);
    assert.equal(calls, 0);
    assert.deepEqual(fields, before);
  } finally {globalThis.fetch = originalFetch;}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createOrderClient, confirmOrderQuote, orderAttemptKey, orderSubmission} from '../lib/order-client.ts';
import {consumeOrderedItems} from '../lib/shop-state.ts';

const variant = {id: 'v1', label: '50 ml', price: 100, sku: 'SKU1', type: 'size', availability: 'unknown'};
const product = {id: 'p1', variants: [variant], name: 'Test product'};
const bag = [{product, variant, quantity: 3}];
const order = {schemaVersion: 1, customer: {fullName: 'Тестовый Покупатель', phone: '+70000000000'},
  delivery: {method: 'post', countryCode: 'RU', region: 'Тестовая область', city: 'Тестовый город', postcode: '000000', address: 'Тестовая улица, 1'},
  items: [{productId: 'p1', variantId: 'v1', quantity: 3}]};
const submission = orderSubmission(order, bag);
const quoteLine = {productId: 'p1', variantId: 'v1', name: 'Test product', label: '50 ml', sku: 'SKU1',
  unitPriceKopecks: 12000, available: 2, quantity: 2, requestedQuantity: 3, revision: 'test-v1', source: 'isolated-test'};
const reply = (value, status = value.ok ? 200 : 409) => Response.json(value, {status});
function fixture(orderReply) {
  const entries = new Map();
  const storage = {getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key)};
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({url, options});
    return url.endsWith('/session') ? reply({ok: true}) : orderReply(url, options);
  };
  return {entries, storage, calls, options: {storage: () => storage, fetcher}};
}

test('session is established before order, IDs/prices are exact and only non-PII retry metadata persists', async () => {
  const f = fixture(async () => {
    const saved = JSON.parse(f.storage.getItem(orderAttemptKey));
    assert.deepEqual(Object.keys(saved), ['key', 'hash', 'cart', 'basisCart']);
    assert.match(saved.key, /^[\da-f-]{36}$/);
    assert.match(saved.hash, /^[\da-f]{64}$/);
    assert.equal(JSON.stringify(saved).includes('Тестовый'), false);
    assert.deepEqual(saved.cart, {items: submission.order.items, expectedPrices: submission.expectedPrices});
    assert.deepEqual(saved.basisCart, saved.cart);
    for (const contact of [order.customer.phone, order.delivery.address, order.delivery.city]) assert.equal(JSON.stringify(saved).includes(contact), false);
    return reply({ok: true, orderId: 'GR-TEST-1'});
  });
  const snapshot = structuredClone(submission);
  assert.deepEqual(await createOrderClient(f.options).submit(submission), {ok: true, orderId: 'GR-TEST-1'});
  assert.deepEqual(f.calls.map(call => call.url), ['/api/orders/session', '/api/orders']);
  const sent = f.calls[1].options;
  assert.equal(sent.credentials, 'same-origin');
  assert.equal(sent.redirect, 'error');
  assert.deepEqual(JSON.parse(sent.body), submission);
  assert.deepEqual(submission, snapshot);
});

test('lost response, fresh client (reload) and repeated request keep one idempotency key', async () => {
  let tries = 0;
  const keys = [];
  const f = fixture(async (_, options) => {
    keys.push(options.headers['Idempotency-Key']);
    if (++tries === 1) throw Error('response lost after commit');
    return reply({ok: true, orderId: 'GR-SAVED-1'});
  });
  assert.equal((await createOrderClient(f.options).submit(submission)).code, 'network');
  assert.ok(f.entries.has(orderAttemptKey));
  assert.equal((await createOrderClient(f.options).submit(structuredClone(submission))).orderId, 'GR-SAVED-1');
  assert.equal(keys[0], keys[1]);
});

test('editing an uncertain attempt cannot silently create a second order', async () => {
  const f = fixture(async () => {throw Error('lost');});
  await createOrderClient(f.options).submit(submission);
  const calls = f.calls.length;
  const changed = structuredClone(submission);
  changed.order.customer.fullName = 'Другой Покупатель';
  assert.equal((await createOrderClient(f.options).submit(changed)).code, 'conflict');
  assert.equal(f.calls.length, calls);
});

test('lost guest session conflict keeps original retry key across subsequent fresh clients', async () => {
  let tries = 0;
  const keys = [];
  const f = fixture(async (_, options) => {
    keys.push(options.headers['Idempotency-Key']);
    if (++tries === 1) throw Error('lost reply after commit');
    return reply({ok: false, code: 'conflict', message: 'Защищённая сессия утрачена'}, 409);
  });
  assert.equal((await createOrderClient(f.options).submit(submission)).code, 'network');
  for (let i = 0; i < 2; i++) {
    assert.equal((await createOrderClient(f.options).submit(submission)).code, 'conflict');
    assert.ok(f.entries.has(orderAttemptKey));
  }
  assert.equal(new Set(keys).size, 1);
});

test('known validation rejection preserves fields and permits corrected attempt with a fresh key', async () => {
  const keys = [];
  const f = fixture(async (_, options) => {
    keys.push(options.headers['Idempotency-Key']);
    return reply({ok: false, code: 'validation', message: 'Проверьте телефон', fields: {phone: 'Неверный телефон'}}, 400);
  });
  const client = createOrderClient(f.options);
  const first = await client.submit(submission);
  assert.deepEqual(first.fields, {phone: 'Неверный телефон'});
  const changed = structuredClone(submission);
  changed.order.customer.phone = '+70000000001';
  await client.submit(changed);
  assert.notEqual(keys[0], keys[1]);
});

test('double submit shares one in-flight attempt; different in-flight payload is rejected', async () => {
  let resolve;
  const response = new Promise(done => {resolve = done;});
  const f = fixture(() => response);
  const client = createOrderClient(f.options);
  const first = client.submit(submission);
  assert.equal(client.submit(structuredClone(submission)), first);
  assert.equal((await client.submit({...submission, expectedPrices: []})).code, 'conflict');
  resolve(reply({ok: true, orderId: 'GR-1'}));
  await first;
  assert.equal(f.calls.filter(call => call.url === '/api/orders').length, 1);
});

test('malformed replies and HTTP failures never show success and retain retry key', async () => {
  for (const result of [
    () => new Response('<html>bad</html>', {status: 502}),
    () => new Response('{broken', {headers: {'Content-Type': 'application/json'}}),
    () => reply({ok: true, orderId: ''}),
    () => reply({ok: true, orderId: 'GR-1'}, 500),
    () => reply({ok: false, code: 'network', message: 'storage unknown'}, 503),
    () => reply({ok: false, code: 'validation', message: 'bad', fields: {password: 'injected'}}, 400),
    () => reply({ok: false, code: 'cart_changed', message: 'changed', quote: []}),
    () => reply({ok: false, code: 'cart_changed', message: 'changed', quote: [{...quoteLine, variantId: 'foreign'}]}),
    () => reply({ok: false, code: 'cart_changed', message: 'changed', quote: [{...quoteLine, quantity: -1}]}),
  ]) {
    const f = fixture(result);
    const before = structuredClone(submission);
    const response = await createOrderClient(f.options).submit(submission);
    assert.equal(response.ok, false);
    assert.equal(response.code, 'network');
    assert.ok(f.entries.has(orderAttemptKey));
    assert.deepEqual(submission, before);
  }
});

test('session failure never sends an order; request timeout aborts and remains retryable', async () => {
  const f = fixture(() => reply({ok: true, orderId: 'GR-1'}));
  let calls = 0;
  const result = await createOrderClient({...f.options, fetcher: async () => {calls++; return reply({ok: false, code: 'unavailable', message: 'unavailable'}, 503);}}).submit(submission);
  assert.equal(calls, 1);
  assert.equal(result.ok, false);
  let signal;
  const hanging = createOrderClient({...f.options, timeoutMs: 5, fetcher: (_, options) => {signal = options.signal; return new Promise(() => {});}});
  assert.equal((await hanging.submit(submission)).code, 'network');
  assert.equal(signal.aborted, true);
  assert.ok(f.entries.has(orderAttemptKey));
});

test('unavailable or corrupt retry storage fails closed before network', async () => {
  for (const storage of [
    () => {throw Error('blocked');},
    () => ({getItem: () => null, setItem: () => {throw Error('full');}}),
    () => ({getItem: () => '{bad', setItem: () => {}}),
    () => ({getItem: () => JSON.stringify({key: 'bad', hash: 'bad'}), setItem: () => {}}),
  ]) {
    let calls = 0;
    const result = await createOrderClient({storage, fetcher: async () => {calls++; throw Error('must not send');}}).submit(submission);
    assert.equal(result.code, 'unavailable');
    assert.equal(calls, 0);
  }
});

test('changed quote requires separate confirmation and sends only explicitly accepted quantities/prices', async () => {
  const f = fixture(() => reply({ok: false, code: 'cart_changed', message: 'Цена изменилась', quote: [quoteLine]}));
  const result = await createOrderClient(f.options).submit(submission);
  assert.equal(result.code, 'cart_changed');
  assert.equal(f.calls.length, 2);
  assert.deepEqual(submission.order.items, [{productId: 'p1', variantId: 'v1', quantity: 3}]);
  const confirmed = confirmOrderQuote(submission, result.quote);
  assert.deepEqual(confirmed.order.items, [{productId: 'p1', variantId: 'v1', quantity: 2}]);
  assert.deepEqual(confirmed.expectedPrices, [{variantId: 'v1', unitPriceKopecks: 12000}]);
  assert.equal(confirmOrderQuote(submission, [{...quoteLine, quantity: 0, available: 0}]), null);
  assert.equal(confirmOrderQuote(submission, [{...quoteLine, requestedQuantity: 2}]), null);
  assert.equal(confirmOrderQuote(submission, [{...quoteLine, unitPriceKopecks: null}]), null);
  assert.equal(confirmOrderQuote(submission, [{...quoteLine, available: null}]), null);
  assert.equal(confirmOrderQuote(submission, [{...quoteLine, unitPriceKopecks: Number.MAX_SAFE_INTEGER}]), null);
});

test('successful consumption removes only submitted quantities and preserves concurrent additions and other variants', () => {
  const extra = {product: {...product, id: 'p2'}, variant: {...variant, id: 'v2'}, quantity: 4};
  const changed = [{...bag[0], quantity: 5}, extra];
  const snapshot = structuredClone(changed);
  assert.deepEqual(consumeOrderedItems(changed, order.items), [{...bag[0], quantity: 2}, extra]);
  assert.deepEqual(changed, snapshot);
  assert.deepEqual(consumeOrderedItems(bag, order.items), []);
  assert.deepEqual(consumeOrderedItems([{...bag[0], quantity: 1}], order.items), []);
  assert.deepEqual(consumeOrderedItems([extra], order.items), [extra]);
  assert.equal(consumeOrderedItems(bag, [...order.items, ...order.items]), bag);
  assert.equal(consumeOrderedItems(bag, [{...order.items[0], quantity: -1}]), bag);
});

test('accepted quote survives lost replies, same-page retry and reload; only accepted quantities are consumed', async () => {
  const accepted = confirmOrderQuote(submission, [quoteLine]);
  assert.ok(accepted);
  let tries = 0;
  const keys = [];
  const f = fixture(async (_, options) => {
    keys.push(options.headers['Idempotency-Key']);
    assert.deepEqual(JSON.parse(options.body), accepted);
    if (++tries < 3) throw Error('accepted reply lost');
    return reply({ok: true, orderId: 'GR-ACCEPTED-1'});
  });
  const live = createOrderClient(f.options);
  assert.equal((await live.submit(accepted, submission)).code, 'network');
  const originalMetadata = f.storage.getItem(orderAttemptKey);
  assert.equal((await live.submit(accepted)).code, 'network');
  assert.equal(f.storage.getItem(orderAttemptKey), originalMetadata, 'same-page retry preserves the original basis');
  const fresh = createOrderClient(f.options);
  const current = structuredClone(submission);
  const recovered = fresh.recoverSubmission(current);
  assert.equal(recovered.ok, true);
  assert.equal(recovered.restored, true);
  assert.deepEqual(recovered.submission, accepted);
  assert.deepEqual(current, submission);
  assert.equal((await fresh.submit(recovered.submission)).orderId, 'GR-ACCEPTED-1');
  assert.equal(new Set(keys).size, 1);
  assert.deepEqual(consumeOrderedItems(bag, recovered.submission.order.items), [{...bag[0], quantity: 1}]);
  assert.equal(f.storage.getItem(orderAttemptKey), null);
});

test('recovery allows only the exact original or accepted cart and never overwrites changed customer data', async () => {
  const accepted = confirmOrderQuote(submission, [quoteLine]);
  const f = fixture(async () => {throw Error('lost');});
  await createOrderClient(f.options).submit(accepted, submission);
  const metadata = f.storage.getItem(orderAttemptKey);
  const calls = f.calls.length;
  const client = createOrderClient(f.options);
  assert.deepEqual(client.recoverSubmission(accepted), {ok: true, submission: accepted, restored: false});
  for (const changed of [
    {...submission, order: {...order, items: [{...order.items[0], quantity: 1}]}},
    {...submission, expectedPrices: [{variantId: 'v1', unitPriceKopecks: 11000}]},
    {...submission, order: {...order, items: [...order.items, {productId: 'p2', variantId: 'v2', quantity: 1}]}, expectedPrices: [...submission.expectedPrices, {variantId: 'v2', unitPriceKopecks: 100}]},
  ]) assert.equal(client.recoverSubmission(changed).code, 'conflict');
  const changedCustomer = structuredClone(submission);
  changedCustomer.order.customer.fullName = 'Другой Покупатель';
  changedCustomer.order.delivery.address = 'Другой адрес, дом 2';
  changedCustomer.order.comment = 'Different comment';
  const recovered = client.recoverSubmission(changedCustomer);
  assert.equal(recovered.ok, true);
  assert.deepEqual(recovered.submission.order.customer, changedCustomer.order.customer);
  assert.deepEqual(recovered.submission.order.delivery, changedCustomer.order.delivery);
  assert.equal(recovered.submission.order.comment, changedCustomer.order.comment);
  assert.equal((await client.submit(recovered.submission)).code, 'conflict');
  assert.equal(f.calls.length, calls);
  assert.equal(f.storage.getItem(orderAttemptKey), metadata);
});

test('legacy key/hash attempts retain exact replay without inventing accepted quote metadata', async () => {
  let tries = 0;
  const f = fixture(async () => ++tries === 1 ? Promise.reject(Error('lost')) : reply({ok: true, orderId: 'GR-LEGACY'}));
  await createOrderClient(f.options).submit(submission);
  const {key, hash} = JSON.parse(f.storage.getItem(orderAttemptKey));
  f.storage.setItem(orderAttemptKey, JSON.stringify({key, hash}));
  const client = createOrderClient(f.options);
  assert.deepEqual(client.recoverSubmission(submission), {ok: true, submission, restored: false});
  const changed = confirmOrderQuote(submission, [quoteLine]);
  assert.equal((await client.submit(changed)).code, 'conflict');
  assert.equal((await client.submit(submission)).orderId, 'GR-LEGACY');
});

test('corrupt, oversized or contact-bearing cart metadata fails closed without changing the pending attempt', async () => {
  const f = fixture(async () => {throw Error('lost');});
  await createOrderClient(f.options).submit(confirmOrderQuote(submission, [quoteLine]), submission);
  const valid = JSON.parse(f.storage.getItem(orderAttemptKey));
  const variants = [];
  for (const alter of [
    value => {delete value.basisCart;},
    value => {value.cart.items[0].quantity = 100;},
    value => {value.cart.items[0].productId = 'unrelated';},
    value => {value.cart.items[0].phone = '+70000000000';},
    value => {value.cart.expectedPrices[0].unitPriceKopecks = 0;},
    value => {value.basisCart.items = [];},
    value => {value.basisCart.items[0].quantity = 1;},
    value => {value.hash = 'invalid';},
    value => {value.unknown = 'not accepted';},
  ]) {const changed = structuredClone(valid); alter(changed); variants.push(JSON.stringify(changed));}
  variants.push(' '.repeat(200_001));
  const calls = f.calls.length;
  for (const raw of variants) {
    f.storage.setItem(orderAttemptKey, raw);
    const client = createOrderClient(f.options);
    assert.equal(client.recoverSubmission(submission).code, 'unavailable');
    assert.equal((await client.submit(submission)).code, 'unavailable');
    assert.equal(f.storage.getItem(orderAttemptKey), raw);
  }
  assert.equal(f.calls.length, calls);
});

import assert from 'node:assert/strict';
import {after, before, beforeEach, test} from 'node:test';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, sep} from 'node:path';
import {Miniflare, Log, LogLevel} from 'miniflare';
import {createOrderClient, confirmOrderQuote, orderAttemptKey, orderSubmission} from '../lib/order-client.ts';
import {createOrderService} from '../lib/order-service.ts';
import {consumeOrderedItems} from '../lib/shop-state.ts';
import {prepareGuestOrder, emptyCheckoutFields} from '../lib/guest-checkout.ts';

const origin = 'http://127.0.0.1:5199';
const variants = [
  {productId: 'flow-product', variantId: 'flow-50ml', name: 'Изолированный тестовый товар', label: '50 мл', sku: 'FLOW-50',
    unitPriceKopecks: 10_000, available: 3, revision: 'flow-v1', source: 'isolated-test'},
  {productId: 'flow-product', variantId: 'flow-100ml', name: 'Изолированный тестовый товар', label: '100 мл', sku: 'FLOW-100',
    unitPriceKopecks: 25_000, available: 1, revision: 'flow-v1', source: 'isolated-test'},
];
const submission = () => ({order: {
  schemaVersion: 1, customer: {fullName: 'Анна Сергеевна Смирнова', phone: '+70000000000'},
  delivery: {method: 'post', countryCode: 'RU', region: 'Тестовая область', city: 'Тестовый город', postcode: '000000', address: 'Тестовая улица, дом 0'},
  items: variants.map(item => ({productId: item.productId, variantId: item.variantId, quantity: item.available})),
  comment: 'ТЕСТ. Вымышленные данные. Не обрабатывать.',
}, expectedPrices: variants.map(item => ({variantId: item.variantId, unitPriceKopecks: item.unitPriceKopecks}))});

let directory, runtime, db, handler, inventory;
async function startDatabase() {
  runtime = new Miniflare({modules: true, script: 'export default {fetch(){return new Response("isolated flow test")}}',
    compatibilityDate: '2026-05-15', d1Databases: {DB: 'isolated-order-flow'}, d1Persist: directory, log: new Log(LogLevel.NONE)});
  db = await runtime.getD1Database('DB');
  handler = createOrderService({db, enabled: true,
    lookupVariant: (productId, variantId) => inventory.find(item => item.productId === productId && item.variantId === variantId) ?? null});
}
async function counts(expected) {
  const row = await db.prepare('SELECT (SELECT COUNT(*) FROM guest_orders) AS orders, (SELECT COUNT(*) FROM order_outbox) AS jobs').first();
  assert.deepEqual(row, {orders: expected, jobs: expected});
}
function browserBridge() {
  const entries = new Map();
  const orders = [];
  let cookie;
  const storage = {getItem: key => entries.get(key) ?? null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key)};
  const bridge = {storage, orders, dropNextOrderResponse: false, options: {storage: () => storage, fetcher: async (path, init) => {
    assert.ok(['/api/orders/session', '/api/orders'].includes(path));
    assert.equal(init.credentials, 'same-origin');
    const headers = new Headers(init.headers);
    headers.set('Origin', origin);
    if (cookie) headers.set('Cookie', cookie);
    if (path === '/api/orders') orders.push({key: headers.get('Idempotency-Key'), body: JSON.parse(init.body)});
    // Only browser transport/cookies are modeled; the response comes from the actual service and D1.
    const response = await handler(new Request(origin + path, {...init, headers}));
    const issuedCookie = response.headers.get('set-cookie');
    if (issuedCookie) cookie = issuedCookie.split(';')[0];
    if (path === '/api/orders' && bridge.dropNextOrderResponse) {
      bridge.dropNextOrderResponse = false;
      assert.equal(response.status, 200);
      await counts(1);
      throw Error('Injected connection loss after the real transaction committed');
    }
    return response;
  }}};
  return bridge;
}
before(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'grace-order-flow-'));
  await startDatabase();
  const first = await readFile(new URL('../db/migrations/0001_guest_orders.sql', import.meta.url), 'utf8');
  await db.exec(first.replace(/--[^\n]*/g, '').replace(/\s+/g, ' '));
  const second = await readFile(new URL('../db/migrations/0002_telegram_delivery.sql', import.meta.url), 'utf8');
  await db.batch(second.split(';').filter(sql => sql.trim()).map(sql => db.prepare(sql)));
});
beforeEach(async () => {
  inventory = structuredClone(variants);
  await db.batch(['DELETE FROM order_outbox', 'DELETE FROM guest_orders', 'DELETE FROM guest_sessions', 'DELETE FROM order_rate_limits']
    .map(sql => db.prepare(sql)));
});
after(async () => {
  await runtime?.dispose();
  if (directory) {
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'grace-order-flow-'));
    await rm(directory, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
  }
});

test('client double click, committed response loss, full D1 restart and concurrent fresh clients retain exactly one order/job', async () => {
  const input = submission(), original = structuredClone(input);
  const bridge = browserBridge();
  bridge.dropNextOrderResponse = true;
  const client = createOrderClient(bridge.options);
  const first = client.submit(input);
  assert.equal(client.submit(structuredClone(input)), first);
  assert.equal((await client.submit({...input, expectedPrices: []})).code, 'conflict');
  assert.equal((await first).code, 'network');
  assert.equal(bridge.orders.length, 1);
  await counts(1);
  const saved = await db.prepare('SELECT id, idempotency_key, snapshot_json FROM guest_orders').first();
  const attempt = JSON.parse(bridge.storage.getItem(orderAttemptKey));
  assert.equal(attempt.key, saved.idempotency_key);
  assert.deepEqual(Object.keys(attempt).sort(), ['basisCart', 'cart', 'hash', 'key']);
  assert.deepEqual(attempt.cart, {items: input.order.items, expectedPrices: input.expectedPrices});
  assert.deepEqual(attempt.basisCart, attempt.cart);
  assert.ok(!JSON.stringify(attempt).includes(input.order.customer.phone));
  assert.ok(!JSON.stringify(attempt).includes(input.order.customer.fullName));
  assert.deepEqual(input, original);

  const previousRuntime = runtime;
  await runtime.dispose();
  await startDatabase();
  assert.notEqual(runtime, previousRuntime);
  const replies = await Promise.all([createOrderClient(bridge.options).submit(input), createOrderClient(bridge.options).submit(structuredClone(input))]);
  assert.deepEqual(replies, [{ok: true, orderId: saved.id}, {ok: true, orderId: saved.id}]);
  assert.equal(bridge.orders.length, 3);
  assert.ok(bridge.orders.every(request => request.key === attempt.key));
  assert.equal(bridge.storage.getItem(orderAttemptKey), null);
  await counts(1);
  assert.equal((await db.prepare('SELECT snapshot_json FROM guest_orders WHERE id=?').bind(saved.id).first()).snapshot_json, saved.snapshot_json);
  assert.deepEqual(await db.prepare('SELECT order_id, state, attempts FROM order_outbox').first(), {order_id: saved.id, state: 'pending', attempts: 0});
  assert.deepEqual(input, original);
});

test('accepted changed quote survives two lost committed responses and reload without replacing a new basket or consuming unsubmitted items', async () => {
  const seed = submission();
  const fields = {...emptyCheckoutFields, ...seed.order.customer, delivery: 'post',
    region: seed.order.delivery.region, city: seed.order.delivery.city, postcode: seed.order.delivery.postcode,
    address: seed.order.delivery.address, comment: seed.order.comment};
  const fieldsBefore = structuredClone(fields);
  const bag = variants.map(item => ({product: {id: item.productId, variants: variants.map(({variantId}) => ({id: variantId}))},
    variant: {id: item.variantId, price: item.unitPriceKopecks / 100}, quantity: item.available}));
  const bagBefore = structuredClone(bag);
  const prepared = prepareGuestOrder(fields, bag);
  assert.equal(prepared.ok, true);
  const input = orderSubmission(prepared.request, bag), original = structuredClone(input);
  inventory = [{...variants[0], unitPriceKopecks: 12_000, available: 2, revision: 'flow-v2'}, {...variants[1], available: 0, revision: 'flow-v2'}];
  const bridge = browserBridge(), client = createOrderClient(bridge.options);
  const changed = await client.submit(input);
  assert.equal(changed.code, 'cart_changed');
  assert.deepEqual(changed.quote, inventory.map((item, index) => ({...item, quantity: item.available, requestedQuantity: input.order.items[index].quantity})));
  assert.equal(bridge.orders.length, 1);
  assert.equal(bridge.storage.getItem(orderAttemptKey), null);
  await counts(0);
  const quoteBefore = structuredClone(changed.quote);
  const confirmed = confirmOrderQuote(input, changed.quote);
  assert.deepEqual(confirmed, {order: {...original.order, items: [{productId: variants[0].productId, variantId: variants[0].variantId, quantity: 2}]},
    expectedPrices: [{variantId: variants[0].variantId, unitPriceKopecks: 12_000}]});
  assert.equal(bridge.orders.length, 1);
  await counts(0);
  bridge.dropNextOrderResponse = true;
  const accepted = client.submit(confirmed, input);
  assert.equal(client.submit(structuredClone(confirmed), input), accepted);
  assert.equal((await accepted).code, 'network');
  assert.equal(bridge.orders.length, 2);
  assert.notEqual(bridge.orders[0].key, bridge.orders[1].key);
  await counts(1);
  const row = await db.prepare('SELECT id, total_kopecks, snapshot_json FROM guest_orders').first();
  assert.equal(row.total_kopecks, 24_000);
  assert.deepEqual(JSON.parse(row.snapshot_json), {...original.order, items: [{...inventory[0], quantity: 2, requestedQuantity: 2}], totalKopecks: 24_000});
  const persistedAttempt = bridge.storage.getItem(orderAttemptKey);
  const attempt = JSON.parse(persistedAttempt);
  assert.deepEqual(attempt.cart, {items: confirmed.order.items, expectedPrices: confirmed.expectedPrices});
  assert.deepEqual(attempt.basisCart, {items: original.order.items, expectedPrices: original.expectedPrices});
  bridge.dropNextOrderResponse = true;
  assert.equal((await client.submit(confirmed)).code, 'network');
  assert.equal(bridge.storage.getItem(orderAttemptKey), persistedAttempt, 'in-page retry must keep the original basis');

  await runtime.dispose();
  await startDatabase();
  const reloaded = createOrderClient(bridge.options);
  const reentered = prepareGuestOrder(structuredClone(fields), bag);
  assert.equal(reentered.ok, true, 'the form must allow the old quantity/price basis to reach recovery');
  const stale = orderSubmission(reentered.request, bag);
  assert.deepEqual(stale, original);
  const recovered = reloaded.recoverSubmission(stale);
  assert.equal(recovered.ok, true);
  assert.equal(recovered.restored, true);
  assert.deepEqual(recovered.submission, confirmed);
  for (const change of ['quantity', 'variant']) {
    const newChoice = structuredClone(stale);
    if (change === 'quantity') newChoice.order.items[0].quantity++;
    else {
      newChoice.order.items[0].variantId = 'new-basket-variant';
      newChoice.expectedPrices[0].variantId = 'new-basket-variant';
    }
    assert.equal(reloaded.recoverSubmission(newChoice).code, 'conflict');
  }
  const changedBuyer = structuredClone(stale);
  changedBuyer.order.customer.fullName = 'Другая Тестовая Покупательница';
  const changedRecovery = reloaded.recoverSubmission(changedBuyer);
  assert.equal(changedRecovery.ok, true);
  assert.equal(changedRecovery.submission.order.customer.fullName, changedBuyer.order.customer.fullName);
  assert.equal((await reloaded.submit(changedRecovery.submission)).code, 'conflict');
  const corrupt = structuredClone(attempt);
  corrupt.cart.items[0].quantity = 100;
  bridge.storage.setItem(orderAttemptKey, JSON.stringify(corrupt));
  assert.equal(reloaded.recoverSubmission(stale).code, 'unavailable');
  assert.equal(bridge.orders.length, 3, 'changed buyer/basket or corrupt retry data cannot reach the service');
  bridge.storage.setItem(orderAttemptKey, persistedAttempt);

  assert.deepEqual(await reloaded.submit(recovered.submission), {ok: true, orderId: row.id});
  assert.equal(bridge.orders.length, 4);
  assert.ok(bridge.orders.slice(1).every(request => request.key === attempt.key));
  await counts(1);
  assert.equal((await db.prepare('SELECT snapshot_json FROM guest_orders').first()).snapshot_json, row.snapshot_json);
  const remaining = consumeOrderedItems(bag, recovered.submission.order.items);
  assert.deepEqual(remaining.map(line => ({variantId: line.variant.id, quantity: line.quantity})), [
    {variantId: variants[0].variantId, quantity: 1}, {variantId: variants[1].variantId, quantity: 1},
  ]);
  assert.deepEqual(bag, bagBefore);
  assert.deepEqual(fields, fieldsBefore);
  assert.deepEqual(input, original);
  assert.deepEqual(changed.quote, quoteBefore);
});

test('zero or unknown stock cannot produce a confirmable order and leaves buyer data and items unchanged', async () => {
  const input = submission(), original = structuredClone(input);
  const bridge = browserBridge(), client = createOrderClient(bridge.options);
  for (const available of [0, null]) {
    inventory = variants.map(item => ({...item, available}));
    const result = await client.submit(input);
    assert.equal(result.ok, false);
    if (available === 0) {
      assert.equal(result.code, 'cart_changed');
      assert.equal(result.quote.length, input.order.items.length);
      assert.ok(result.quote.every(line => line.available === 0 && line.quantity === 0));
      assert.equal(confirmOrderQuote(input, result.quote), null);
    } else assert.equal(result.code, 'unavailable');
    await counts(0);
    assert.deepEqual(input, original);
  }
  assert.equal(bridge.orders.length, 2);
});

import assert from 'node:assert/strict';
import {after, before, beforeEach, test} from 'node:test';
import {mkdtemp, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, sep} from 'node:path';
import {Miniflare, Log, LogLevel} from 'miniflare';
import {createOrderService} from '../lib/order-service.ts';

const migration = await readFile(new URL('../db/migrations/0001_guest_orders.sql', import.meta.url), 'utf8');
const origin = 'http://127.0.0.1:5173';
let directory, miniflare, db;
let timestamp = Date.UTC(2026, 9, 11);
const catalog = {
  productId: 'product-test', variantId: 'variant-test', name: 'Тестовый товар', label: 'Тестовый вариант', sku: 'TEST-001',
  unitPriceKopecks: 12_345, available: 4, revision: 'isolated-fixture-v1', source: 'isolated-test',
};
const body = () => ({
  order: {
    schemaVersion: 1, customer: {fullName: 'Тестовый Покупатель', phone: '+79990000000'},
    delivery: {method: 'post', countryCode: 'RU', region: 'Тестовая область', city: 'Тестовый город', postcode: '123456', address: 'Тестовая улица, 1'},
    items: [{productId: catalog.productId, variantId: catalog.variantId, quantity: 2}],
    comment: 'Изолированная проверка, не настоящий заказ.',
  },
  expectedPrices: [{variantId: catalog.variantId, unitPriceKopecks: catalog.unitPriceKopecks}],
});
const service = (overrides = {}) => createOrderService({db, enabled: true, lookupVariant: () => catalog, now: () => timestamp, ...overrides});
function request(data, {cookie, key = crypto.randomUUID(), path = '/api/orders', base = origin, headers = {}, method = 'POST'} = {}) {
  return new Request(base + path, {
    method,
    headers: {'Content-Type': 'application/json', Origin: base, 'Idempotency-Key': key, ...(cookie ? {Cookie: cookie} : {}), ...headers},
    ...(method === 'POST' ? {body: JSON.stringify(data)} : {}),
  });
}
async function session(handler, options = {}) {
  const response = await handler(request({}, {path: '/api/orders/session', ...options}));
  assert.equal(response.status, 200);
  const cookie = response.headers.get('set-cookie');
  assert.ok(cookie);
  return cookie.split(';')[0];
}
async function result(handler, data = body(), options = {}) {
  const response = await handler(request(data, options));
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return {status: response.status, value: await response.json()};
}
async function counts(orders, outbox = orders) {
  assert.equal((await db.prepare('SELECT count(*) AS count FROM guest_orders').first()).count, orders);
  assert.equal((await db.prepare('SELECT count(*) AS count FROM order_outbox').first()).count, outbox);
}
async function startDatabase() {
  miniflare = new Miniflare({
    modules: true, script: 'export default {fetch() {return new Response("isolated order tests")}}',
    compatibilityDate: '2026-05-15', d1Databases: {DB: 'isolated-orders'}, d1Persist: directory,
    log: new Log(LogLevel.NONE),
  });
  db = await miniflare.getD1Database('DB');
}
before(async () => {
  directory = await mkdtemp(resolve(tmpdir(), 'grace-order-service-'));
  await startDatabase();
  await db.exec(migration.replace(/--[^\n]*/g, '').replace(/\s+/g, ' '));
});
beforeEach(async () => {
  await db.batch(['DELETE FROM order_outbox', 'DELETE FROM guest_orders', 'DELETE FROM guest_sessions', 'DELETE FROM order_rate_limits']
    .map(sql => db.prepare(sql)));
});
after(async () => {
  await miniflare?.dispose();
  if (directory) {
    assert.ok(resolve(directory).startsWith(resolve(tmpdir()) + sep + 'grace-order-service-'));
    await rm(directory, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
  }
});

test('disabled service and missing binding cannot save or issue a guest session', async () => {
  for (const handler of [service({enabled: false}), service({db: undefined})]) {
    assert.equal((await result(handler)).value.code, 'unavailable');
    const response = await handler(request({}, {path: '/api/orders/session'}));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
  }
  await counts(0);
});

test('guest session is random, hashed at rest, established before save, and host-only on HTTPS', async () => {
  const handler = service();
  assert.equal((await result(handler)).value.code, 'session');
  assert.equal((await result(handler, body(), {cookie: 'grace_guest=' + 'f'.repeat(64)})).value.code, 'session');
  const response = await handler(request({}, {path: '/api/orders/session', base: 'https://shop.example'}));
  const cookie = response.headers.get('set-cookie');
  assert.match(cookie, /^__Host-grace_guest=[a-f0-9]{64}; Path=\/; HttpOnly; SameSite=Strict; Max-Age=2592000; Secure$/);
  const token = cookie.match(/=([a-f0-9]{64})/)[1];
  const stored = await db.prepare('SELECT * FROM guest_sessions').first();
  assert.notEqual(stored.token_hash, token);
  assert.equal(stored.expires_at - stored.created_at, 2_592_000_000);
  const repeated = await handler(request({}, {path: '/api/orders/session', base: 'https://shop.example', cookie: cookie.split(';')[0]}));
  assert.equal(repeated.status, 200);
  assert.equal(repeated.headers.get('set-cookie'), null);
  await counts(0);
});

test('saved snapshot uses exact server variant, integer money, normalized contact, and atomic outbox', async () => {
  const handler = service();
  const cookie = await session(handler);
  const input = body();
  input.order.customer.phone = '8 (999) 000-00-00';
  input.order.customer.fullName = '  Тестовый   Покупатель  ';
  const saved = await result(handler, input, {cookie});
  assert.equal(saved.status, 200);
  assert.match(saved.value.orderId, /^[a-f0-9-]{36}$/);
  await counts(1);
  const row = await db.prepare('SELECT * FROM guest_orders').first();
  const snapshot = JSON.parse(row.snapshot_json);
  assert.equal(row.total_kopecks, 24_690);
  assert.equal(snapshot.totalKopecks, row.total_kopecks);
  assert.deepEqual(snapshot.customer, {fullName: 'Тестовый Покупатель', phone: '+79990000000'});
  assert.deepEqual(snapshot.items, [{...catalog, quantity: 2, requestedQuantity: 2}]);
  assert.deepEqual(Object.keys(snapshot).sort(), ['schemaVersion', 'customer', 'delivery', 'items', 'comment', 'totalKopecks'].sort());
  const job = await db.prepare('SELECT * FROM order_outbox').first();
  assert.deepEqual(job, {order_id: row.id, channel: 'telegram', state: 'pending', attempts: 0, next_attempt_at: timestamp});
  assert.deepEqual(Object.keys(saved.value).sort(), ['ok', 'orderId']);
});

test('strict unknown input rejects nested shape, contact, delivery, item, and quote manipulation', async () => {
  const handler = service();
  const cookie = await session(handler);
  const malformed = [null, false, [], {}, {order: null}, {...body(), total: 1}];
  const changes = [
    x => { x.order.customer.fullName = ['Тестовый']; },
    x => { x.order.customer.fullName = 'Тестовый'; },
    x => { x.order.customer.phone = '9990000000'; },
    x => { x.order.customer.phone = '+7\n9990000000'; },
    x => { x.order.delivery.countryCode = 'US'; },
    x => { x.order.delivery.address = 'x'; },
    x => { x.order.delivery.postcode = 123456; },
    x => { x.order.delivery.method = 'unknown'; },
    x => { x.order.comment = '\u0000'; },
    x => { x.order.comment = 'x'.repeat(501); },
    x => { x.order.schemaVersion = 2; },
    x => { x.order.items = []; },
    x => { x.order.items[0].quantity = '2'; },
    x => { x.order.items[0].quantity = 0; },
    x => { x.order.items[0].quantity = 100; },
    x => { x.order.items[0].quantity = 1.5; },
    x => { x.order.items[0].price = 1; },
    x => { x.order.items.push({...x.order.items[0]}); },
    x => { x.expectedPrices = []; },
    x => { x.expectedPrices[0].unitPriceKopecks = -1; },
    x => { x.expectedPrices[0].unitPriceKopecks = 1.5; },
    x => { x.expectedPrices[0].variantId = 'injected'; },
    x => { x.expectedPrices.push({...x.expectedPrices[0]}); },
    x => { x.order.customer.sessionId = 'injected'; },
  ];
  for (const change of changes) { const input = body(); change(input); malformed.push(input); }
  for (const input of malformed) {
    const response = await result(handler, input, {cookie});
    assert.equal(response.value.code, 'validation');
  }
  assert.equal((await result(handler, body(), {cookie, key: 'not-a-uuid'})).value.code, 'validation');
  await counts(0);
});

test('same-origin JSON is required; there is no public read route, and body bytes are bounded', async () => {
  const handler = service();
  const cookie = await session(handler);
  for (const headers of [{Origin: 'https://evil.example'}, {Origin: ''}, {'Content-Type': 'text/plain'}, {'Sec-Fetch-Site': 'same-site'}, {'Sec-Fetch-Site': 'cross-site'}]) {
    assert.equal((await result(handler, body(), {cookie, headers})).status, 403);
  }
  assert.equal((await result(handler, body(), {cookie, method: 'GET'})).status, 405);
  const large = new Request(origin + '/api/orders', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json', Cookie: cookie},
    body: JSON.stringify({pad: 'я'.repeat(20_000)})});
  assert.equal((await handler(large)).status, 400);
  const declaredLarge = request(body(), {cookie, headers: {'Content-Length': '99999999999999'}});
  assert.equal((await handler(declaredLarge)).status, 400);
  const invalidJson = new Request(origin + '/api/orders', {method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json', Cookie: cookie}, body: '{'});
  assert.equal((await handler(invalidJson)).status, 400);
  const repeatedCookie = cookie + '; ' + cookie;
  assert.equal((await result(handler, body(), {cookie: repeatedCookie})).value.code, 'session');
  await counts(0);
});

test('unfinished request bodies time out without issuing a session even if the prefix is valid JSON', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new TextEncoder().encode('{}')); },
    cancel() { cancelled = true; },
  });
  const response = await service()(new Request(origin + '/api/orders/session', {
    method: 'POST', headers: {Origin: origin, 'Content-Type': 'application/json'}, body: stream, duplex: 'half',
  }));
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('set-cookie'), null);
  assert.equal(cancelled, true);
  assert.equal((await db.prepare('SELECT count(*) AS count FROM guest_sessions').first()).count, 0);
});

test('changed server prices and stock require explicit full quote confirmation, including zero stock', async () => {
  for (const changed of [{...catalog, unitPriceKopecks: 13_000}, {...catalog, available: 1}, {...catalog, available: 0}]) {
    const handler = service({lookupVariant: () => changed});
    const cookie = await session(handler);
    const response = await result(handler, body(), {cookie});
    assert.equal(response.value.code, 'cart_changed');
    assert.deepEqual(response.value.quote, [{...changed, quantity: Math.min(2, changed.available), requestedQuantity: 2}]);
  }
  await counts(0);
  const changed = {...catalog, available: 1, unitPriceKopecks: 13_000};
  const handler = service({lookupVariant: () => changed});
  const cookie = await session(handler);
  const confirmed = body();
  confirmed.order.items[0].quantity = 1;
  confirmed.expectedPrices[0].unitPriceKopecks = 13_000;
  assert.equal((await result(handler, confirmed, {cookie})).value.ok, true);
  await counts(1);
});

test('unknown, mismatched, invalid, and overflowing server inventory fails closed', async () => {
  const variants = [null, {...catalog, available: null}, {...catalog, unitPriceKopecks: null}, {...catalog, available: -1},
    {...catalog, productId: 'wrong-product'}, {...catalog, variantId: 'wrong-variant'}, {...catalog, source: 'demo'},
    {...catalog, unitPriceKopecks: 0}, {...catalog, unitPriceKopecks: 0.5}];
  for (const variant of variants) {
    const handler = service({lookupVariant: () => variant});
    const cookie = await session(handler);
    assert.equal((await result(handler, body(), {cookie})).value.code, 'unavailable');
  }
  const handler = service({lookupVariant: () => ({...catalog, unitPriceKopecks: Number.MAX_SAFE_INTEGER})});
  const cookie = await session(handler);
  const input = body(); input.expectedPrices[0].unitPriceKopecks = Number.MAX_SAFE_INTEGER;
  assert.equal((await result(handler, input, {cookie})).value.code, 'unavailable');
  await counts(0);
});

test('same guest retry is stable after catalog change; lost cookie cannot duplicate or expose the saved order', async () => {
  let current = catalog;
  const handler = service({lookupVariant: () => current});
  const cookie = await session(handler);
  const key = crypto.randomUUID();
  const original = await result(handler, body(), {cookie, key});
  current = null;
  assert.deepEqual(await result(handler, body(), {cookie, key}), original);
  const changed = body(); changed.order.comment = 'Другой комментарий';
  assert.equal((await result(handler, changed, {cookie, key})).value.code, 'conflict');
  current = catalog;
  const secondCookie = await session(handler);
  assert.notEqual(secondCookie, cookie);
  current = null;
  const second = await result(handler, body(), {cookie: secondCookie, key});
  assert.equal(second.value.code, 'conflict');
  assert.ok(!('orderId' in second.value));
  timestamp += 31 * 24 * 60 * 60 * 1000;
  assert.equal((await result(handler, body(), {cookie, key})).value.code, 'session');
  const renewedCookie = await session(handler, {cookie});
  assert.equal((await result(handler, body(), {cookie: renewedCookie, key})).value.code, 'conflict');
  assert.equal((await result(handler, body(), {cookie: renewedCookie, key})).value.code, 'conflict');
  await counts(1);
});

test('simultaneous retries create one order and one outbox job; different payload with same key has one winner', async () => {
  const handler = service();
  const cookie = await session(handler);
  const key = crypto.randomUUID();
  const replies = await Promise.all(Array.from({length: 5}, () => result(handler, body(), {cookie, key})));
  assert.ok(replies.every(reply => reply.value.ok));
  assert.equal(new Set(replies.map(reply => reply.value.orderId)).size, 1);
  await counts(1);
  const conflictKey = crypto.randomUUID();
  const changed = body(); changed.order.comment = 'Другой комментарий';
  const conflicts = await Promise.all([result(handler, body(), {cookie, key: conflictKey}), result(handler, changed, {cookie, key: conflictKey})]);
  assert.equal(conflicts.filter(reply => reply.value.ok).length, 1);
  assert.equal(conflicts.filter(reply => reply.value.code === 'conflict').length, 1);
  await counts(2);
});

test('a failing outbox insert rolls back the order; same attempt works after dependency recovery', async () => {
  const handler = service();
  const cookie = await session(handler);
  const key = crypto.randomUUID();
  await db.exec("CREATE TRIGGER force_outbox_failure BEFORE INSERT ON order_outbox BEGIN SELECT RAISE(ABORT, 'isolated fault'); END;");
  try {
    const failed = await result(handler, body(), {cookie, key});
    assert.equal(failed.status, 503);
    assert.equal(failed.value.code, 'network');
    assert.ok(!JSON.stringify(failed.value).includes('isolated fault'));
    await counts(0);
  } finally { await db.exec('DROP TRIGGER force_outbox_failure'); }
  assert.equal((await result(handler, body(), {cookie, key})).value.ok, true);
  await counts(1);
});

test('a lost storage acknowledgement after commit can be retried without duplicating real D1 data', async () => {
  let committed = false;
  const faultBinding = {
    prepare(sql) {
      const prepared = db.prepare(sql);
      return {bind(...values) {
        const bound = prepared.bind(...values);
        return {
          async first() {
            if (committed && sql.startsWith('SELECT id, request_hash')) { committed = false; throw new Error('isolated lost acknowledgement'); }
            return bound.first();
          },
          async run() { const value = await bound.run(); if (sql.startsWith('INSERT INTO guest_orders')) committed = true; return value; },
        };
      }};
    },
  };
  const faulty = service({db: faultBinding});
  const cookie = await session(faulty);
  const key = crypto.randomUUID();
  assert.equal((await result(faulty, body(), {cookie, key})).value.code, 'network');
  await counts(1);
  const recovered = await result(service(), body(), {cookie, key});
  assert.equal(recovered.value.ok, true);
  await counts(1);
});

test('session and new order rates persist in D1 and reset only with the time window', async () => {
  const handler = service();
  const cookie = await session(handler);
  for (let index = 0; index < 10; index++) assert.equal((await result(handler, body(), {cookie})).value.ok, true);
  assert.equal((await result(handler, body(), {cookie})).value.code, 'rate_limited');
  assert.equal((await result(service(), body(), {cookie})).value.code, 'rate_limited');
  await counts(10);
  timestamp += 10 * 60 * 1000;
  assert.equal((await result(handler, body(), {cookie})).value.ok, true);
  await counts(11);
  for (let index = 0; index < 20; index++) await session(handler);
  const limited = await result(handler, {}, {path: '/api/orders/session'});
  assert.equal(limited.value.code, 'rate_limited');
  assert.equal(limited.status, 429);
});

test('pickup is server verified; missing verification, changed destination, and forged data never save', async () => {
  const point = {code: 'TEST-POINT', city: 'Тестовый город', address: 'Тестовый адрес, 1', countryCode: 'RU', cityCode: 123};
  const input = body();
  input.order.delivery = {method: 'cdek', mode: 'pickup', countryCode: 'RU', pickupPoint: point};
  for (const verifyPickup of [undefined, async () => null, async () => ({...point, countryCode: 'US'})]) {
    const handler = service({verifyPickup});
    const cookie = await session(handler);
    assert.equal((await result(handler, input, {cookie})).value.code, 'unavailable');
  }
  const changed = service({verifyPickup: async () => ({...point, address: 'Другой адрес, 2'})});
  const changedCookie = await session(changed);
  assert.equal((await result(changed, input, {cookie: changedCookie})).value.code, 'validation');
  await counts(0);
  const handler = service({verifyPickup: async received => { assert.deepEqual(received, point); return {...point, workTime: 'Тестовый график'}; }});
  const cookie = await session(handler);
  assert.equal((await result(handler, input, {cookie})).value.ok, true);
  const stored = JSON.parse((await db.prepare('SELECT snapshot_json FROM guest_orders').first()).snapshot_json);
  assert.equal(stored.delivery.pickupPoint.workTime, 'Тестовый график');
  await counts(1);
});

test('orders, guest association, replay and outbox survive complete Miniflare restart', async () => {
  const handler = service();
  const cookie = await session(handler);
  const key = crypto.randomUUID();
  const saved = await result(handler, body(), {cookie, key});
  await miniflare.dispose();
  await startDatabase();
  await counts(1);
  assert.deepEqual(await result(service({lookupVariant: () => null}), body(), {cookie, key}), saved);
  timestamp += 31 * 24 * 60 * 60 * 1000;
  assert.equal((await result(service(), body(), {cookie, key})).value.code, 'session');
  await counts(1);
});

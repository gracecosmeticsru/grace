import assert from 'node:assert/strict';
import {before, after, beforeEach, test} from 'node:test';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, sep} from 'node:path';
import {createTelegramOutbox, formatTelegramOrder, preflightTelegram, discoverTelegramGroup} from '../lib/telegram-outbox.ts';
import {openLocalDatabase, seedDemo, fakeTelegram} from '../scripts/telegram-local.mjs';
import {storeDetails} from '../lib/store-details.ts';

const token = '123456789:isolated_fixture_no_external_network';
const chatId = '-1001234567890';
let storage, db, directory;
let clock = Date.now() + 10_000;
const processor = (extra = {}) => createTelegramOutbox({db, enabled: true, token, chatId, expectedTitle: 'Тест группа', fetcher: fakeTelegram(), now: () => clock, ...extra});
const job = id => db.prepare('SELECT * FROM order_outbox WHERE order_id=?').bind(id).first();
const snapshot = async id => JSON.parse((await db.prepare('SELECT snapshot_json FROM guest_orders WHERE id=?').bind(id).first()).snapshot_json);
function transport(send, calls = [], overrides = {}) {
  const fallback = fakeTelegram(calls);
  return async (url, init) => {
    assert.ok(String(url).startsWith('https://api.telegram.org/bot'));
    assert.equal(init.redirect, 'manual');
    const method = new URL(url).pathname.split('/').at(-1);
    if (method === 'sendMessage') { calls.push({method, body: JSON.parse(init.body)}); return send(JSON.parse(init.body)); }
    if (overrides[method]) return Response.json({ok: true, result: overrides[method]});
    return fallback(url, init);
  };
}
const accepted = (id = 501) => Response.json({ok: true, result: {message_id: id, chat: {id: Number(chatId), type: 'supergroup'}}});
before(async () => { directory = await mkdtemp(resolve(tmpdir(), 'grace-telegram-tests-')); storage = await openLocalDatabase({directory}); db = storage.db; });
beforeEach(async () => {
  await db.batch(['DELETE FROM order_outbox', 'DELETE FROM guest_orders', 'DELETE FROM guest_sessions', 'DELETE FROM order_rate_limits', 'UPDATE telegram_dispatch SET next_send_at=0, token=NULL']
    .map(sql => db.prepare(sql)));
  clock = Date.now() + 10_000;
});
after(async () => { await storage?.dispose(); assert.ok(directory.startsWith(resolve(tmpdir()) + sep + 'grace-telegram-tests-')); await rm(directory, {recursive: true, force: true, maxRetries: 5, retryDelay: 100}); });

test('formatter preserves complete long orders in deterministic bounded plain text with explicit test marker', async () => {
  const id = await seedDemo(db);
  const value = await snapshot(id);
  value.items = Array.from({length: 100}, (_, i) => ({...value.items[0], variantId: `variant-${i}`, name: 'Название '.repeat(50), label: 'Вариант '.repeat(50)}));
  value.totalKopecks = value.items.reduce((sum, item) => sum + item.unitPriceKopecks, 0);
  const parts = formatTelegramOrder(id, value);
  assert.ok(parts.length > 1);
  assert.deepEqual(parts, formatTelegramOrder(id, value));
  assert.ok(parts.every(part => part.length <= 4096 && part.startsWith('ТЕСТ') && part.includes(id)));
  for (let i = 0; i < 100; i++) assert.ok(parts.join('\n').includes(`Вариант: variant-${i}\n`));
  assert.ok(parts.at(-1).includes('Комментарий: ТЕСТ.'));
  assert.ok(parts.at(-1).includes('12 345,00'.replaceAll(' ', '\u00a0')));
  assert.throws(() => formatTelegramOrder(id, {...value, totalKopecks: 1}));
});

test('store pickup notification uses the saved shop address and keeps legacy postal formatting', async () => {
  const id = await seedDemo(db);
  const value = await snapshot(id);
  assert.ok(formatTelegramOrder(id, value).join('\n').includes('Доставка: Почта России'));
  value.delivery = {method: 'store-pickup', countryCode: 'RU', address: storeDetails.shopAddress};
  const message = formatTelegramOrder(id, value).join('\n');
  assert.ok(message.includes('Получение: Самовывоз'));
  assert.ok(message.includes('Магазин: ' + storeDetails.shopAddress));
  assert.ok(!message.includes('Почта России') && !message.includes('СДЭК'));
  value.delivery.address = 'Сохранённый прежний адрес магазина';
  assert.ok(formatTelegramOrder(id, value).join('\n').includes(value.delivery.address));
  delete value.delivery.address;
  assert.throws(() => formatTelegramOrder(id, value));
});

test('disabled sender and invalid config perform no network or storage mutation', async () => {
  let calls = 0;
  const fetcher = async () => { calls++; throw Error(); };
  assert.equal((await processor({enabled: false, fetcher}).processOne()).state, 'disabled');
  assert.equal((await processor({token: '', fetcher}).processOne()).code, 'configuration');
  assert.equal(calls, 0);
});

test('read-only discovery binds one exact group id and rejects absent, private or ambiguous same-name groups', async () => {
  const config = {token, expectedTitle: 'Тест группа'};
  const event = id => ({my_chat_member: {chat: {id, title: 'Тест группа', type: 'supergroup'}}});
  let sends = 0;
  for (const [updates, expected] of [[[], 'group_not_found'], [[event(-1), event(-2)], 'group_ambiguous'],
    [[{my_chat_member: {chat: {id: 1, title: 'Тест группа', type: 'private'}}}], 'group_not_found']]) {
    const result = await discoverTelegramGroup({...config, fetcher: transport(() => {sends++; return accepted();}, [], {getUpdates: updates})});
    assert.equal(result.code, expected);
  }
  const fake = fakeTelegram();
  assert.deepEqual(await discoverTelegramGroup({...config, fetcher: (url, init) => {
    if (new URL(url).pathname.endsWith('/getUpdates')) {
      assert.equal(init.method, 'GET'); assert.equal(init.body, undefined);
      assert.equal(new URL(url).searchParams.get('allowed_updates'), '["my_chat_member","message"]');
      assert.equal(new URL(url).searchParams.get('timeout'), '0');
    }
    return fake(url, init);
  }}), {ok: true, chatId});
  assert.equal(sends, 0);
});

test('discovery accepts only the directed owner setup command, never ordinary/private messages', async () => {
  const config = {token, expectedTitle: 'Тест группа'};
  const chat = {id: Number(chatId), type: 'supergroup', title: 'Тест группа'};
  for (const message of [{chat, text: 'ordinary message'}, {chat, text: '/grace_connect@other_bot'},
    {chat: {...chat, type: 'private'}, text: '/grace_connect@grace_orders_test_bot'}]) {
    assert.equal((await discoverTelegramGroup({...config, fetcher: transport(() => {throw Error('NO SEND');}, [], {getUpdates: [{message}]})})).code, 'group_not_found');
  }
  assert.deepEqual(await discoverTelegramGroup({...config, fetcher: transport(() => {throw Error('NO SEND');}, [], {
    getUpdates: [{message: {chat, text: '/grace_connect@grace_orders_test_bot'}}],
  })}), {ok: true, chatId});
});

test('preflight rejects private/channel/wrong group/title/forum and missing writing permission before sending', async () => {
  const id = await seedDemo(db);
  const invalid = [
    {getChat: {id: Number(chatId), type: 'private', title: 'Тест группа'}},
    {getChat: {id: Number(chatId), type: 'channel', title: 'Тест группа'}},
    {getChat: {id: -999, type: 'group', title: 'Тест группа'}},
    {getChat: {id: Number(chatId), type: 'group', title: 'другая группа'}},
    {getChat: {id: Number(chatId), type: 'supergroup', title: 'Тест группа', is_forum: true}},
    {getChatMember: {status: 'left'}}, {getChatMember: {status: 'restricted', is_member: true, can_send_messages: false}},
  ];
  for (const overrides of invalid) {
    let sends = 0;
    const response = await processor({fetcher: transport(() => {sends++; return accepted();}, [], overrides)}).processOne(id);
    assert.equal(response.state, 'blocked'); assert.equal(sends, 0);
  }
  assert.equal((await job(id)).attempts, 0);
  assert.deepEqual(await preflightTelegram({token, chatId, expectedTitle: 'Тест группа', fetcher: fakeTelegram()}), {ok: true});
});

test('successful API acknowledgement is saved once without returning contacts or secrets', async () => {
  const id = await seedDemo(db);
  const calls = [];
  const handler = processor({fetcher: transport(() => accepted(), calls)});
  const result = await handler.processOne(id);
  assert.deepEqual(result, {state: 'sent', orderId: id, part: 1});
  const row = await job(id);
  assert.equal(row.state, 'sent'); assert.equal(row.accepted_at, clock); assert.deepEqual(JSON.parse(row.message_ids_json), [501]);
  assert.equal((await handler.processOne(id)).state, 'idle');
  assert.equal(calls.filter(call => call.method === 'sendMessage').length, 1);
  assert.ok(!JSON.stringify(result).includes('+70000000000')); assert.ok(!JSON.stringify(result).includes(token));
  const sent = calls.find(call => call.method === 'sendMessage').body;
  assert.equal(sent.chat_id, chatId); assert.equal(sent.parse_mode, undefined); assert.equal(sent.allow_paid_broadcast, undefined);
});

test('atomic claim and shared pacing permit one send across concurrent workers and jobs', async () => {
  const id = await seedDemo(db); const second = await seedDemo(db);
  const calls = [];
  const fetcher = transport(() => accepted(), calls);
  const replies = await Promise.all([processor({fetcher}).processOne(id), processor({fetcher}).processOne(id), processor({fetcher}).processOne(second)]);
  assert.equal(replies.filter(value => value.state === 'sent').length, 1);
  assert.equal(calls.filter(value => value.method === 'sendMessage').length, 1);
  clock += 4000;
  await processor({fetcher: transport(() => accepted(502), calls)}).processOne();
  assert.equal(calls.filter(value => value.method === 'sendMessage').length, 2);
});

test('429 respects retry_after across workers without sleeping or retrying early', async () => {
  const id = await seedDemo(db); const second = await seedDemo(db);
  let attempts = 0;
  const fetcher = transport(() => ++attempts === 1 ? Response.json({ok: false, error_code: 429, parameters: {retry_after: 20}}, {status: 429}) : accepted());
  assert.equal((await processor({fetcher}).processOne(id)).code, 'rate_limited');
  assert.equal((await job(id)).next_attempt_at, clock + 20_000);
  clock += 19_000;
  assert.equal((await processor({fetcher}).processOne(second)).state, 'idle'); assert.equal(attempts, 1);
  clock += 1000;
  assert.equal((await processor({fetcher}).processOne(id)).state, 'sent'); assert.equal(attempts, 2);
});

test('confirmed temporary failures have five retries then stop; permanent rejection waits for explicit corrected retry', async () => {
  const id = await seedDemo(db);
  const handler = processor({fetcher: transport(() => Response.json({ok: false, error_code: 503, description: 'private provider text'}, {status: 503}))});
  for (let index = 0; index < 6; index++) { await handler.processOne(id); clock += 120_000; }
  assert.equal((await job(id)).failure_code, 'retry_exhausted');
  assert.equal((await job(id)).attempts, 6);
  assert.equal((await handler.processOne(id)).state, 'idle');
  assert.equal(await handler.reconcile({orderId: id, part: 1, checkedGroup: true, chatId, action: 'retry'}), true);
  const failed = await processor({fetcher: transport(() => Response.json({ok: false, error_code: 403}, {status: 403}))}).processOne(id);
  assert.equal(failed.code, 'provider_rejected');
  assert.equal(await handler.reconcile({orderId: id, part: 1, checkedGroup: true, chatId, action: 'confirmed', messageId: 999}), false);
  assert.equal(await handler.reconcile({orderId: id, part: 1, checkedGroup: true, chatId, action: 'retry'}), true);
});

test('lost, malformed and untrusted send results become unknown without blind retries', async () => {
  const cases = [() => {throw Error('secret token or body must not leak');}, () => new Response('broken gateway', {status: 502}),
    () => Response.json({ok: true, result: {message_id: 501, chat: {id: -1, type: 'group'}}}), () => Response.json({ok: true})];
  for (const send of cases) {
    const id = await seedDemo(db); let calls = 0;
    const handler = processor({fetcher: transport(() => {calls++; return send();})});
    assert.equal((await handler.processOne(id)).state, 'unknown');
    clock += 120_000;
    assert.equal((await handler.processOne(id)).state, 'idle'); assert.equal(calls, 1);
    assert.equal((await job(id)).failure_code, 'delivery_unknown');
  }
});

test('unknown reconciliation demands exact group/part/check and either verified message id or explicit retry', async () => {
  const id = await seedDemo(db);
  const handler = processor({fetcher: transport(() => {throw Error();})});
  await handler.processOne(id);
  const input = {orderId: id, part: 1, checkedGroup: true, chatId, action: 'confirmed', messageId: 777};
  assert.equal(await handler.reconcile({...input, checkedGroup: false}), false);
  assert.equal(await handler.reconcile({...input, chatId: '-999'}), false);
  assert.equal(await handler.reconcile({...input, part: 2}), false);
  assert.equal(await handler.reconcile({...input, messageId: undefined}), false);
  assert.equal(await handler.reconcile(input), true);
  assert.equal(await handler.reconcile(input), false);
  assert.deepEqual(JSON.parse((await job(id)).message_ids_json), [777]);
  assert.equal((await job(id)).state, 'sent');
});

test('expired sending lease becomes unknown, never automatically reclaims and resends', async () => {
  const id = await seedDemo(db);
  await db.prepare("UPDATE order_outbox SET state='sending', claim_token='dead-worker', lease_until=?, target_chat_id=? WHERE order_id=?").bind(clock - 1, chatId, id).run();
  let sends = 0;
  const handler = processor({fetcher: transport(() => {sends++; return accepted();})});
  assert.equal((await handler.processOne(id)).state, 'idle');
  assert.equal((await job(id)).failure_code, 'delivery_unknown'); assert.equal(sends, 0);
  assert.equal(await handler.reconcile({orderId: id, part: 1, checkedGroup: true, chatId, action: 'retry'}), true);
  clock += 4000;
  assert.equal((await handler.processOne(id)).state, 'sent'); assert.equal(sends, 1);
});

test('lost D1 acknowledgement and failed save after Telegram acceptance never resend blindly', async () => {
  for (const committed of [false, true]) {
    const id = await seedDemo(db);
    let fail = true; let sends = 0;
    const faultDb = {
      batch: statements => db.batch(statements),
      prepare(sql) {
        const prepared = db.prepare(sql);
        if (!sql.startsWith('UPDATE order_outbox SET state=?')) return prepared;
        return {bind(...values) {
          const bound = prepared.bind(...values);
          return {async run() {
            if (fail) { fail = false; if (committed) await bound.run(); throw Error('storage response lost'); }
            return bound.run();
          }};
        }};
      },
    };
    const handler = processor({db: faultDb, fetcher: transport(() => {sends++; return accepted();})});
    assert.equal((await handler.processOne(id)).state, 'unknown');
    assert.equal((await job(id)).state, committed ? 'sent' : 'failed');
    clock += 120_000;
    assert.equal((await processor({fetcher: transport(() => {sends++; return accepted();})}).processOne(id)).state, 'idle');
    assert.equal(sends, 1);
  }
});

test('multipart checkpoint survives full Miniflare restart, and group change preserves acknowledged part ids', async () => {
  const id = await seedDemo(db);
  const value = await snapshot(id);
  value.items = Array.from({length: 8}, (_, i) => ({...value.items[0], variantId: `variant-${i}`, name: 'Название '.repeat(50), label: 'Вариант '.repeat(50)}));
  value.totalKopecks *= 8;
  await db.prepare('UPDATE guest_orders SET snapshot_json=?, total_kopecks=? WHERE id=?').bind(JSON.stringify(value), value.totalKopecks, id).run();
  const parts = formatTelegramOrder(id, value); assert.ok(parts.length > 1);
  const calls = [];
  assert.equal((await processor({fetcher: transport(() => accepted(501), calls)}).processOne(id)).state, 'pending');
  await storage.dispose(); storage = await openLocalDatabase({directory}); db = storage.db; clock += 4000;
  const changed = processor({chatId: '-999', expectedTitle: undefined, fetcher: transport(() => accepted(), [], {getChat: {id: -999, type: 'group'}, getChatMember: {status: 'member', user: {id: 123456789}}})});
  assert.equal((await changed.processOne(id)).code, 'destination_changed');
  assert.deepEqual(JSON.parse((await job(id)).message_ids_json), [501]);
  await db.prepare("UPDATE order_outbox SET state='pending', failure_code=NULL WHERE order_id=?").bind(id).run();
  for (let i = 1; i < parts.length; i++) { clock += 4000; await processor({fetcher: transport(() => accepted(501 + i), calls)}).processOne(id); }
  assert.equal((await job(id)).state, 'sent');
  assert.deepEqual(calls.filter(call => call.method === 'sendMessage').map(call => call.body.text), parts);
});

import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve, dirname} from 'node:path';
import {Miniflare, Log, LogLevel} from 'miniflare';
import {createTelegramOutbox, preflightTelegram, discoverTelegramGroup} from '../lib/telegram-outbox.ts';
import {createOrderService} from '../lib/order-service.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fixtureToken = '123456789:isolated_fixture_no_external_network';
const fixtureGroup = '-1001234567890';
const groupTitle = 'Тест группа';

export function parseArgs(args) {
  const [command, ...rest] = args;
  if (!['demo', 'status', 'process', 'reconcile', 'preflight', 'connect'].includes(command)) throw Error('Choose demo, status, process, reconcile, preflight or connect.');
  const options = {command, live: false};
  for (let index = 0; index < rest.length; index++) {
    const flag = rest[index];
    if (flag === '--live' && !options.live) { options.live = true; continue; }
    if (!['--order', '--approved-group', '--part', '--checked-group', '--action', '--message-id'].includes(flag) || options[flag.slice(2)] !== undefined || !rest[index + 1] || rest[index + 1].startsWith('--')) throw Error('Invalid command options.');
    options[flag.slice(2)] = rest[++index];
  }
  if (options.live && (command === 'demo' || (command === 'process' && (!options.order || !options['approved-group'])))) throw Error('Live processing requires one exact order and approved group; live seeding is forbidden.');
  if (options.order && !/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(options.order)) throw Error('Invalid order identifier.');
  if (command === 'reconcile' && (!options.order || !/^[1-9]\d*$/.test(options.part ?? '') || !options['checked-group'] || !['confirmed', 'retry'].includes(options.action) ||
    (options.action === 'confirmed' && !/^[1-9]\d*$/.test(options['message-id'] ?? '')))) throw Error('Reconciliation requires exact order, part, checked group and action; confirmation also needs message id.');
  return options;
}

export function fakeTelegram(calls = []) {
  let messageId = Date.now();
  return async (url, init) => {
    if (!String(url).startsWith(`https://api.telegram.org/bot${fixtureToken}/`)) throw Error('Only the isolated fixture is supported.');
    const method = new URL(url).pathname.split('/').at(-1);
    const body = init.body ? JSON.parse(init.body) : Object.fromEntries(new URL(url).searchParams);
    calls.push({method, body});
    const result = method === 'getMe' ? {id: 123456789, is_bot: true, username: 'grace_orders_test_bot'} : method === 'getChat' ? {id: Number(fixtureGroup), type: 'supergroup', title: groupTitle} :
      method === 'getChatMember' ? {status: 'member', user: {id: 123456789}} : method === 'getUpdates' ? [{my_chat_member: {chat: {id: Number(fixtureGroup), type: 'supergroup', title: groupTitle}}}] :
        method === 'sendMessage' ? {message_id: ++messageId, chat: {id: Number(fixtureGroup), type: 'supergroup'}} : null;
    if (!result) throw Error('Unsupported fixture method.');
    return Response.json({ok: true, result});
  };
}

async function settings(live) {
  if (!live) return {token: fixtureToken, chatId: fixtureGroup, fetcher: fakeTelegram(), expectedTitle: groupTitle};
  // This dedicated ignored file is the only source; never load existing .dev.vars or ambient secrets.
  const raw = await readFile(resolve(root, '.dev.vars.telegram'), 'utf8');
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const match = /^(GRACE_TELEGRAM_BOT_TOKEN|GRACE_TELEGRAM_CHAT_ID)=([^\r\n]*)$/.exec(line);
    if (!match || values[match[1]] !== undefined) throw Error('Invalid dedicated Telegram settings.');
    values[match[1]] = match[2].trim();
  }
  return {token: values.GRACE_TELEGRAM_BOT_TOKEN, chatId: values.GRACE_TELEGRAM_CHAT_ID, expectedTitle: groupTitle};
}

export async function openLocalDatabase({live = false, directory} = {}) {
  const persist = directory ?? resolve(root, live ? '.wrangler/order-test/v3/d1' : '.wrangler/telegram-simulation');
  await mkdir(persist, {recursive: true});
  const mf = new Miniflare({modules: true, script: 'export default {fetch(){return new Response("local-only")}}', compatibilityDate: '2026-05-15',
    d1Databases: {DB: live ? '00000000-0000-4000-8000-000000000002' : 'telegram-simulation'}, d1Persist: persist, log: new Log(LogLevel.NONE)});
  try {
    const db = await mf.getD1Database('DB');
    const first = await readFile(resolve(root, 'db/migrations/0001_guest_orders.sql'), 'utf8');
    await db.exec(first.replace(/--[^\n]*/g, '').replace(/\s+/g, ' '));
    const columns = await db.prepare('PRAGMA table_info(order_outbox)').all();
    if (!columns.results.some(column => column.name === 'message_ids_json')) {
      const second = await readFile(resolve(root, 'db/migrations/0002_telegram_delivery.sql'), 'utf8');
      await db.batch(second.split(';').filter(sql => sql.trim()).map(sql => db.prepare(sql)));
    }
    return {db, dispose: () => mf.dispose()};
  } catch (error) { await mf.dispose(); throw error; }
}

export async function seedDemo(db) {
  const service = createOrderService({db, enabled: true, lookupVariant: () => ({productId: 'isolated-demo', variantId: 'isolated-demo-variant',
    name: 'Изолированный тестовый товар', label: 'Тестовый вариант', sku: null, unitPriceKopecks: 12345, available: 1, revision: 'telegram-simulation', source: 'isolated-test'})});
  const headers = {Origin: 'http://127.0.0.1', 'Content-Type': 'application/json'};
  const session = await service(new Request('http://127.0.0.1/api/orders/session', {method: 'POST', headers, body: '{}'}));
  const cookie = session.headers.get('set-cookie')?.split(';')[0];
  if (!cookie) throw Error('Cannot create isolated session.');
  const response = await service(new Request('http://127.0.0.1/api/orders', {method: 'POST', headers: {...headers, Cookie: cookie, 'Idempotency-Key': crypto.randomUUID()}, body: JSON.stringify({
    order: {schemaVersion: 1, customer: {fullName: 'Анна Сергеевна Смирнова', phone: '+70000000000'},
      delivery: {method: 'post', countryCode: 'RU', region: 'Тестовая область', city: 'Тестовый город', postcode: '000000', address: 'Тестовая улица, дом 0'},
      items: [{productId: 'isolated-demo', variantId: 'isolated-demo-variant', quantity: 1}], comment: 'ТЕСТ. Вымышленные данные. Не обрабатывать.'},
    expectedPrices: [{variantId: 'isolated-demo-variant', unitPriceKopecks: 12345}],
  })}));
  const value = await response.json();
  if (!response.ok || value.ok !== true) throw Error('Cannot save isolated demo order.');
  return value.orderId;
}

export async function run(options) {
  const config = await settings(options.live);
  if (options.live && options.command === 'process' && options['approved-group'] !== config.chatId) throw Error('Approved group must match verified server configuration.');
  if (options.command === 'preflight') return {mode: options.live ? 'live-read-only' : 'simulation', ...await preflightTelegram(config)};
  if (options.command === 'connect') {
    if (config.chatId) return {mode: options.live ? 'live-read-only' : 'simulation', ...await preflightTelegram(config)};
    const found = await discoverTelegramGroup(config);
    if (!found.ok) return found;
    if (options.live) await writeFile(resolve(root, '.dev.vars.telegram'), `GRACE_TELEGRAM_BOT_TOKEN=${config.token}\nGRACE_TELEGRAM_CHAT_ID=${found.chatId}\n`, 'utf8');
    return {mode: options.live ? 'live-read-only' : 'simulation', ok: true, group: groupTitle};
  }
  const storage = await openLocalDatabase({live: options.live});
  try {
    if (options.live && options.command === 'process') {
      const row = await storage.db.prepare('SELECT snapshot_json FROM guest_orders WHERE id=?').bind(options.order).first();
      if (!row || !isAuthorizedTestSnapshot(JSON.parse(row.snapshot_json))) throw Error('Only the planned fictional postal order can be sent.');
    }
    const processor = createTelegramOutbox({db: storage.db, enabled: true, ...config});
    if (options.command === 'demo') return {mode: 'simulation', orderId: await seedDemo(storage.db)};
    if (options.command === 'process') return {mode: options.live ? 'live-single-order' : 'simulation', ...await processor.processOne(options.order)};
    if (options.command === 'reconcile') return {mode: options.live ? 'live-manual-reconciliation' : 'simulation', changed: await processor.reconcile({
      orderId: options.order, part: Number(options.part), chatId: options['checked-group'], checkedGroup: true,
      action: options.action, messageId: options['message-id'] ? Number(options['message-id']) : undefined,
    })};
    const rows = await storage.db.prepare(`SELECT order_id, state, failure_code, attempts, retry_count, json_array_length(message_ids_json) AS accepted_parts,
      next_attempt_at, accepted_at FROM order_outbox WHERE (? IS NULL OR order_id=?) ORDER BY order_id`).bind(options.order ?? null, options.order ?? null).all();
    return {mode: options.live ? 'live-local-status' : 'simulation', jobs: rows.results};
  } finally { await storage.dispose(); }
}

export function isAuthorizedTestSnapshot(value) {
  return value?.customer?.fullName === 'Анна Сергеевна Смирнова' && value?.customer?.phone === '+70000000000' &&
    value?.delivery?.method === 'post' && value.delivery.countryCode === 'RU' && value.delivery.region === 'Тестовая область' &&
    value.delivery.city === 'Тестовый город' && value.delivery.postcode === '000000' && value.delivery.address === 'Тестовая улица, дом 0' &&
    !value.delivery.apartment && value.comment === 'ТЕСТ. Вымышленные данные. Не обрабатывать.' &&
    Array.isArray(value.items) && value.items.length > 0 && value.items.every(item => item.source === 'isolated-test');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(await run(parseArgs(process.argv.slice(2))))); }
  catch { console.error('Telegram local tool stopped safely. Check arguments and dedicated configuration; secrets and order data were not printed.'); process.exitCode = 1; }
}

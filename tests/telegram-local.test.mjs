import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mkdtemp, rm, readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve, sep} from 'node:path';
import {execFileSync} from 'node:child_process';
import {parseArgs, openLocalDatabase, seedDemo, fakeTelegram, run, isAuthorizedTestSnapshot} from '../scripts/telegram-local.mjs';
import {createTelegramOutbox} from '../lib/telegram-outbox.ts';

test('live sending is explicit, one-order-only and cannot seed a live order', () => {
  assert.deepEqual(parseArgs(['status']), {command: 'status', live: false});
  assert.throws(() => parseArgs(['demo', '--live']));
  assert.throws(() => parseArgs(['process', '--live']));
  assert.throws(() => parseArgs(['process', '--live', '--order', crypto.randomUUID()]));
  assert.throws(() => parseArgs(['process', '--token', 'secret']));
  assert.throws(() => parseArgs(['process', '--live', '--live']));
  assert.throws(() => parseArgs(['process', '--order', 'anything']));
  const order = crypto.randomUUID();
  assert.deepEqual(parseArgs(['process', '--live', '--order', order, '--approved-group', '-1001234567890']),
    {command: 'process', live: true, order, 'approved-group': '-1001234567890'});
});

test('reconciliation CLI requires explicit exact part/group/action and positive confirmation id', () => {
  assert.throws(() => parseArgs(['reconcile', '--order', crypto.randomUUID()]));
  assert.throws(() => parseArgs(['reconcile', '--order', crypto.randomUUID(), '--part', '1', '--checked-group', '-1001', '--action', 'confirmed']));
  const value = parseArgs(['reconcile', '--order', crypto.randomUUID(), '--part', '2', '--checked-group', '-1001', '--action', 'confirmed', '--message-id', '123']);
  assert.equal(value.part, '2'); assert.equal(value['message-id'], '123');
});

test('default preflight uses fake transport with real network blocked and no dedicated settings read', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw Error('NETWORK MUST NOT RUN'); };
  try { assert.deepEqual(await run(parseArgs(['preflight'])), {mode: 'simulation', ok: true}); }
  finally { globalThis.fetch = realFetch; }
});

test('isolated tool uses actual persistent D1 and processes only its chosen synthetic order', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'grace-telegram-cli-'));
  let storage;
  try {
    storage = await openLocalDatabase({directory});
    const order = await seedDemo(storage.db); const other = await seedDemo(storage.db);
    const snapshot = JSON.parse((await storage.db.prepare('SELECT snapshot_json FROM guest_orders WHERE id=?').bind(order).first()).snapshot_json);
    assert.equal(isAuthorizedTestSnapshot(snapshot), true);
    for (const changed of [{...snapshot, customer: {...snapshot.customer, fullName: 'Настоящий Покупатель'}},
      {...snapshot, comment: 'обычный заказ'}, {...snapshot, delivery: {...snapshot.delivery, method: 'cdek'}},
      {...snapshot, items: snapshot.items.map(item => ({...item, source: 'inventory'}))}]) assert.equal(isAuthorizedTestSnapshot(changed), false);
    const calls = [];
    const handler = createTelegramOutbox({db: storage.db, enabled: true, token: '123456789:isolated_fixture_no_external_network', chatId: '-1001234567890',
      expectedTitle: 'Тест группа', fetcher: fakeTelegram(calls)});
    assert.equal((await handler.processOne(order)).state, 'sent');
    assert.equal((await storage.db.prepare('SELECT state FROM order_outbox WHERE order_id=?').bind(other).first()).state, 'pending');
    assert.equal(calls.filter(call => call.method === 'sendMessage').length, 1);
    await storage.dispose(); storage = await openLocalDatabase({directory});
    assert.equal((await storage.db.prepare('SELECT state FROM order_outbox WHERE order_id=?').bind(order).first()).state, 'sent');
  } finally {
    await storage?.dispose();
    assert.ok(directory.startsWith(resolve(tmpdir()) + sep + 'grace-telegram-cli-'));
    await rm(directory, {recursive: true, force: true, maxRetries: 5, retryDelay: 100});
  }
});

test('setup helper masks input, refuses overwrite and only writes the dedicated ignored file', async () => {
  const helper = await readFile(new URL('../scripts/configure-telegram.ps1', import.meta.url), 'utf8');
  assert.match(helper, /Read-Host[^\n]+-AsSecureString/);
  assert.match(helper, /param\(\[switch\]\$UseDialog\)/);
  assert.match(helper, /Get-Credential -UserName 'Telegram bot' -Message/);
  assert.match(helper, /\$null -eq \$telegramCredential/);
  assert.match(helper, /Test-Path -LiteralPath \$telegramPath/);
  assert.match(helper, /'\.dev\.vars\.telegram'/);
  assert.ok(!/Get-Content|ReadAllText|Write-Output[^\n]+\$telegramToken/.test(helper));
  const ignore = await readFile(new URL('../.gitignore', import.meta.url), 'utf8');
  assert.match(ignore, /^\.dev\.vars\*$/m);
});

test('Windows dialog dependency loads from the built-in module despite an inherited module path', {skip: process.platform !== 'win32'}, () => {
  const output = execFileSync(resolve(process.env.SystemRoot, 'System32/WindowsPowerShell/v1.0/powershell.exe'), ['-NoProfile', '-Command',
    'Import-Module (Join-Path $PSHOME "Modules/Microsoft.PowerShell.Security/Microsoft.PowerShell.Security.psd1") -ErrorAction Stop; $command = Get-Command Get-Credential -ErrorAction Stop; if ($command.ModuleName -ne "Microsoft.PowerShell.Security") { exit 1 }; Write-Output "CREDENTIAL_MODULE_OK"'],
  {encoding: 'utf8', timeout: 10_000, windowsHide: true, env: {...process.env, PSModulePath: ''}});
  assert.match(output, /CREDENTIAL_MODULE_OK/);
});

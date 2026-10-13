import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync, readFileSync, readdirSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {join} from 'node:path';

const directory = 'artifacts/step-10v';
mkdirSync(directory, {recursive: true});
const mode = process.argv[2];
function run(name, args) {
  const result = spawnSync(process.execPath, args, {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, timeout: 180_000, windowsHide: true});
  writeFileSync(`${directory}/${name}.log`, (result.stdout ?? '') + (result.stderr ?? ''));
  assert.equal(result.error, undefined, name);
  assert.equal(result.status, 0, `${name} failed; inspect its local log`);
}
if (mode === 'processor') {
  run('processor-tests', ['--experimental-strip-types', '--test', 'tests/telegram-outbox.test.mjs', 'tests/telegram-local.test.mjs']);
  console.log('STEP10V_PROCESSOR_OK');
} else if (mode === 'validate') {
  run('checkout-regressions', ['--experimental-strip-types', '--test', 'tests/order-service.test.mjs', 'tests/order-client.test.mjs', 'tests/shop-state.test.mjs', 'tests/saved-variants.test.mjs', 'tests/guest-checkout.test.mjs', 'tests/cdek-service.test.mjs']);
  run('types', ['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false']);
  console.log('STEP10V_VALIDATION_OK');
} else if (mode === 'build') {
  run('build', ['scripts/run-framework.mjs', 'build']);
  const serverMarker = /api\.telegram\.org|GRACE_TELEGRAM_BOT_TOKEN|isolated_fixture_no_external_network/;
  assert.ok(serverMarker.test(readFileSync('lib/telegram-outbox.ts', 'utf8')), 'positive control');
  let clientFiles = 0;
  function scan(path) {
    for (const entry of readdirSync(path, {withFileTypes: true})) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) scan(file);
      else if (/\.(js|html|json|map)$/.test(file)) {
        clientFiles++;
        assert.ok(!serverMarker.test(readFileSync(file, 'utf8')), `server-only Telegram code in ${file}`);
      }
    }
  }
  scan('dist/client');
  assert.ok(clientFiles > 0);
  writeFileSync(`${directory}/build-summary.json`, JSON.stringify({builtAt: new Date().toISOString(), clientFiles, telegramServerMarkersAbsent: true}, null, 2));
  console.log('STEP10V_BUILD_OK');
} else if (mode === 'preservation') {
  const before = JSON.parse(readFileSync('artifacts/step-10b/baseline.json', 'utf8'));
  const after = {};
  function inventory(path) {
    for (const entry of readdirSync(path, {withFileTypes: true})) {
      const file = join(path, entry.name).replaceAll('\\', '/');
      if (entry.isDirectory()) inventory(file);
      else after[file] = createHash('sha256').update(readFileSync(file)).digest('hex');
    }
  }
  for (const path of ['data', 'public', 'materials']) inventory(path);
  for (const path of ['package-lock.json', '.openai/hosting.json', 'lib/demo-inventory.ts']) after[path] = createHash('sha256').update(readFileSync(path)).digest('hex');
  assert.throws(() => assert.deepEqual({...before, [Object.keys(before)[0]]: 'changed'}, before), 'negative control');
  assert.deepEqual(after, before);
  const origin = 'http://127.0.0.1:5173';
  const page = await fetch(origin, {signal: AbortSignal.timeout(15_000)});
  assert.equal(page.status, 200);
  const endpoints = [];
  for (const path of ['/api/orders/session', '/api/orders']) {
    const response = await fetch(origin + path, {method: 'POST', headers: {'Content-Type': 'application/json', Origin: origin}, body: '{}', signal: AbortSignal.timeout(15_000)});
    assert.equal(response.status, 503, path);
    assert.equal(response.headers.get('set-cookie'), null, path);
    assert.equal((await response.json()).ok, false);
    endpoints.push({path, status: 503, setCookie: false});
  }
  writeFileSync(`${directory}/preservation.json`, JSON.stringify({protectedFiles: Object.keys(before).length, unchanged: true, mainPageStatus: 200, endpoints}, null, 2));
  console.log('STEP10V_PRESERVATION_AND_RELEASE_OK');
} else throw Error('Expected processor, validate, build or preservation');

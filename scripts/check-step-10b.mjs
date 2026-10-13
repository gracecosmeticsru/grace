import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, readdirSync, mkdirSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';

const dir = 'artifacts/step-10b';
mkdirSync(dir, {recursive: true});
function inventory() {
  const files = {};
  function walk(path) {
    for (const entry of readdirSync(path, {withFileTypes: true})) {
      const file = join(path, entry.name).replaceAll('\\', '/');
      if (entry.isDirectory()) walk(file);
      else files[file] = createHash('sha256').update(readFileSync(file)).digest('hex');
    }
  }
  for (const path of ['data', 'public', 'materials']) walk(path);
  for (const path of ['package-lock.json', '.openai/hosting.json', 'lib/demo-inventory.ts']) files[path] = createHash('sha256').update(readFileSync(path)).digest('hex');
  return files;
}
const mode = process.argv[2];
if (mode === 'baseline') {
  writeFileSync(`${dir}/baseline.json`, JSON.stringify(inventory(), null, 2), {flag: 'wx'});
  console.log('STEP10B_BASELINE_SAVED');
} else if (mode === 'preservation') {
  const before = JSON.parse(readFileSync(`${dir}/baseline.json`, 'utf8'));
  assert.deepEqual(inventory(), before);
  const result = {protectedFiles: Object.keys(before).length, unchanged: true};
  writeFileSync(`${dir}/preservation.json`, JSON.stringify(result, null, 2));
  console.log('STEP10B_PRESERVATION_OK', result.protectedFiles);
} else if (mode === 'release') {
  const origin = 'http://127.0.0.1:5173';
  for (const path of ['/api/orders/session', '/api/orders']) {
    const response = await fetch(origin + path, {method: 'POST', headers: {'Content-Type': 'application/json', Origin: origin}, body: '{}'});
    assert.equal(response.status, 503, path);
    assert.equal(response.headers.get('set-cookie'), null, path);
    assert.equal((await response.json()).ok, false);
  }
  console.log('STEP10B_RELEASE_CLOSED_OK');
} else if (mode === 'build') {
  for (const args of [['node_modules/typescript/bin/tsc', '--noEmit', '--incremental', 'false'], ['scripts/run-framework.mjs', 'build']]) {
    const result = spawnSync(process.execPath, args, {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
    writeFileSync(`${dir}/${args[0].includes('typescript') ? 'types' : 'build'}.log`, result.stdout + result.stderr);
    if (result.status !== 0) {console.error(result.stdout, result.stderr);process.exit(1);}
  }
  console.log('STEP10B_BUILD_OK');
} else throw Error('Unknown check');

import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, readFile, readdir, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {request as httpRequest} from 'node:http';
import {connect} from 'node:net';
import {createHash} from 'node:crypto';
import {startDiagnosticServer} from '../scripts/one-c-diagnostic.mjs';

const username = 'isolated-diagnostic-test';
const password = 'fixture-only-not-a-real-password';
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

async function fixture(t, options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'grace-1c-diagnostic-'));
  const capture = await startDiagnosticServer({directory, port: 0, username, password, ...options});
  t.after(async () => { await capture.close(); await rm(directory, {recursive: true, force: true}); });
  return {...capture, directory};
}

async function call(capture, mode, {cookie, filename, type = 'catalog', headers = {}, body, method} = {}) {
  const query = new URLSearchParams({type, mode});
  if (filename !== undefined) query.set('filename', filename);
  const response = await fetch(`${capture.url}?${query}`, {
    method: method ?? (mode === 'file' ? 'POST' : 'GET'), headers: {...(cookie ? {Cookie: cookie} : {}), ...headers}, body,
  });
  return {status: response.status, body: await response.text(), headers: response.headers};
}

async function authorize(capture) {
  const response = await call(capture, 'checkauth', {headers: {Authorization: authorization}});
  assert.equal(response.status, 200);
  assert.match(response.body, /^success\nGRACE_DIAGNOSTIC_SESSION\n[a-f0-9]{64}\n$/);
  return response.headers.get('set-cookie').split(';')[0];
}

async function initialize(capture) {
  const cookie = await authorize(capture);
  const response = await call(capture, 'init', {cookie});
  assert.match(response.body, /^zip=no\nfile_limit=\d+\n$/);
  return cookie;
}

async function sessionDirectories(capture) {
  return (await readdir(capture.runDirectory, {withFileTypes: true})).filter(entry => entry.isDirectory()).map(entry => join(capture.runDirectory, entry.name));
}

async function rawRequest(capture, path, {headers = {}, body, method = 'GET'} = {}) {
  return new Promise((resolveRequest, reject) => {
    const request = httpRequest(`${capture.url}${path}`, {method, headers}, response => {
      let text = '';
      response.on('data', chunk => { text += chunk; });
      response.once('end', () => resolveRequest({status: response.statusCode, body: text}));
    });
    request.on('error', reject);
    request.end(body);
  });
}

test('authentication, init and ordered raw chunks persist without an import acknowledgment', async t => {
  const capture = await fixture(t);
  assert.equal((await call(capture, 'checkauth')).status, 401);
  assert.equal((await call(capture, 'checkauth', {headers: {Authorization: 'Basic invalid'}})).status, 401);
  for (const mode of ['init', 'file', 'import']) assert.equal((await call(capture, mode)).status, 401);
  const cookie = await authorize(capture);
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: '<xml>'})).status, 409);
  assert.equal((await call(capture, 'init', {cookie})).status, 200);
  const chunks = [Buffer.from('<?xml version="1.0"?><root>'), Buffer.from('товар</root>')];
  for (const body of chunks) assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body})).body, 'success\n');
  for (let index = 0; index < 2; index++) {
    const result = await call(capture, 'import', {cookie, filename: 'import.xml'});
    assert.equal(result.body, 'failure\nDiagnostic capture only; import disabled\n');
    assert.doesNotMatch(result.body, /success|progress/);
  }
  const [sessionDirectory] = await sessionDirectories(capture);
  const events = await Promise.all((await readdir(sessionDirectory)).filter(name => name.startsWith('event-')).map(async name => JSON.parse(await readFile(join(sessionDirectory, name), 'utf8'))));
  assert.deepEqual(events.map(event => event.mode), ['init', 'import', 'import']);
  assert.ok(events.slice(1).every(event => event.response === 'import_disabled' && event.filename === 'import.xml' && event.importAccepted === false));
  assert.doesNotMatch(JSON.stringify(events), /password|cookie|authorization/i);
  for (const [index, chunk] of chunks.entries()) {
    const basename = String(index + 1).padStart(6, '0');
    assert.deepEqual(await readFile(join(sessionDirectory, `${basename}.bin`)), chunk);
    const metadata = JSON.parse(await readFile(join(sessionDirectory, `${basename}.json`), 'utf8'));
    assert.equal(metadata.sequence, index + 1);
    assert.equal(metadata.filename, 'import.xml');
    assert.equal(metadata.bytes, chunk.length);
    assert.equal(metadata.sha256, createHash('sha256').update(chunk).digest('hex'));
    assert.equal(metadata.transportComplete, true);
    assert.equal(metadata.importAccepted, false);
    assert.doesNotMatch(JSON.stringify(metadata), /password|cookie|authorization/i);
  }
});

test('unused client query parameters do not block capture or bypass validation', async t => {
  const capture = await fixture(t);
  const extra = '&sessid=fixture-service-marker';
  assert.equal((await rawRequest(capture, `?type=catalog&mode=init${extra}`)).status, 401);
  const cookie = await authorize(capture);
  const headers = {Cookie: cookie};
  const init = await rawRequest(capture, `?type=catalog&mode=init${extra}`, {headers});
  assert.equal(init.status, 200);
  assert.match(init.body, /^zip=no\nfile_limit=\d+\n$/);
  const body = Buffer.from('<root>товар</root>');
  const uploaded = await rawRequest(capture, `?type=catalog&mode=file&filename=import.xml${extra}`, {headers, method: 'POST', body});
  assert.equal(uploaded.status, 200);
  assert.equal(uploaded.body, 'success\n');
  const [directory] = await sessionDirectories(capture);
  assert.deepEqual(await readFile(join(directory, '000001.bin')), body);
  const imported = await rawRequest(capture, `?type=catalog&mode=import&filename=import.xml${extra}`, {headers});
  assert.equal(imported.body, 'failure\nDiagnostic capture only; import disabled\n');
  assert.equal((await rawRequest(capture, `?type=sale&mode=init${extra}`, {headers})).status, 403);
  assert.equal((await rawRequest(capture, `?type=catalog&mode=file&filename=../import.xml${extra}`, {headers, method: 'POST', body})).status, 400);
  for (const duplicate of ['type=catalog', 'mode=init', 'sessid=duplicate']) {
    assert.equal((await rawRequest(capture, `?type=catalog&mode=init${extra}&${duplicate}`, {headers})).status, 400);
  }
  for (const name of (await readdir(directory)).filter(name => name.endsWith('.json'))) {
    assert.doesNotMatch(await readFile(join(directory, name), 'utf8'), /fixture-service-marker/);
  }
});

test('browser origins, rebinding hosts, sale, malformed modes and unsafe filenames are rejected', async t => {
  const capture = await fixture(t);
  const cookie = await initialize(capture);
  assert.equal((await call(capture, 'init', {cookie, headers: {Origin: 'https://example.com'}})).status, 403);
  assert.equal((await rawRequest(capture, '?type=catalog&mode=init', {headers: {Cookie: cookie, Host: 'localhost'}})).status, 403);
  assert.equal((await call(capture, 'file', {cookie, filename: 'orders.xml', body: '<order/>', type: 'sale'})).status, 403);
  for (const filename of ['../import.xml', '..\\import.xml', '/import.xml', 'C:import.xml', 'import.zip', 'import.xml/next.xml', 'import%2fnext.xml', 'import..xml', 'a\0.xml']) {
    assert.equal((await call(capture, 'file', {cookie, filename, body: '<xml/>'})).status, 400, filename);
  }
  assert.equal((await call(capture, 'unknown', {cookie})).status, 400);
  assert.equal((await call(capture, 'init', {cookie, method: 'POST', body: 'not allowed'})).status, 405);
  assert.equal((await fetch(`${capture.url}?type=catalog&mode=init&mode=file`, {headers: {Cookie: cookie}})).status, 400);
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: 'compressed', headers: {'Content-Encoding': 'gzip'}})).status, 415);
  const [sessionDirectory] = await sessionDirectories(capture);
  assert.equal((await readdir(sessionDirectory)).filter(name => name.endsWith('.bin')).length, 0);
});

test('request and session byte limits plus chunk limits bound storage', async t => {
  const capture = await fixture(t, {limits: {maxBodyBytes: 8, maxSessionBytes: 12, maxChunksPerSession: 2}});
  const cookie = await initialize(capture);
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: '123456789'})).status, 413);
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: '12345678'})).body, 'success\n');
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: '12345'})).status, 413);
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: '1234'})).body, 'success\n');
  assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body: '1'})).status, 413);
  const [sessionDirectory] = await sessionDirectories(capture);
  assert.equal((await readdir(sessionDirectory)).filter(name => name.endsWith('.bin')).length, 2);
});

test('chunked body cannot bypass byte limits and invalidates interrupted session', async t => {
  const capture = await fixture(t, {limits: {maxBodyBytes: 8}});
  const cookie = await initialize(capture);
  const response = await new Promise((resolveRequest, reject) => {
    const request = httpRequest(`${capture.url}?type=catalog&mode=file&filename=import.xml`, {
      method: 'POST', headers: {Cookie: cookie, 'Transfer-Encoding': 'chunked'},
    }, result => {
      result.resume();
      result.once('end', () => resolveRequest(result.statusCode));
    });
    request.on('error', reject);
    request.write('12345');
    request.end('6789');
  });
  assert.equal(response, 413);
  assert.equal((await call(capture, 'init', {cookie})).status, 401);
  const [sessionDirectory] = await sessionDirectories(capture);
  assert.equal((await readdir(sessionDirectory)).filter(name => name.endsWith('.bin')).length, 0);
});

test('disconnect discards partial transport and cannot be mistaken for a complete upload', async t => {
  const capture = await fixture(t);
  const cookie = await initialize(capture);
  const target = new URL(capture.url);
  await new Promise((resolveAbort, reject) => {
    const socket = connect(Number(target.port), '127.0.0.1', () => {
      socket.write(`POST /exchange?type=catalog&mode=file&filename=import.xml HTTP/1.1\r\nHost: ${target.host}\r\nCookie: ${cookie}\r\nContent-Length: 100\r\n\r\npartial`);
      setTimeout(() => socket.destroy(), 30);
    });
    socket.once('error', reject);
    socket.once('close', resolveAbort);
  });
  let status;
  for (let attempt = 0; attempt < 20; attempt++) {
    status = (await call(capture, 'init', {cookie})).status;
    if (status === 401) break;
    await new Promise(resolveWait => setTimeout(resolveWait, 10));
  }
  assert.equal(status, 401);
  const [sessionDirectory] = await sessionDirectories(capture);
  assert.equal((await readdir(sessionDirectory)).filter(name => name.endsWith('.bin')).length, 0);
  assert.equal((await call(capture, 'checkauth', {headers: {Authorization: authorization}})).status, 200);
});

test('sessions isolate filenames, enforce expiration and cap authentication allocations', async t => {
  let clock = 1000;
  const capture = await fixture(t, {now: () => clock, limits: {maxSessions: 2, sessionTtlMs: 100}});
  const firstCookie = await initialize(capture);
  const secondCookie = await initialize(capture);
  assert.notEqual(firstCookie, secondCookie);
  for (const [cookie, body] of [[firstCookie, 'first'], [secondCookie, 'second']]) {
    assert.equal((await call(capture, 'file', {cookie, filename: 'import.xml', body})).body, 'success\n');
  }
  const contents = await Promise.all((await sessionDirectories(capture)).map(path => readFile(join(path, '000001.bin'), 'utf8')));
  assert.deepEqual(contents.sort(), ['first', 'second']);
  assert.equal((await call(capture, 'checkauth', {headers: {Authorization: authorization}})).status, 429);
  clock += 100;
  assert.equal((await call(capture, 'init', {cookie: firstCookie})).status, 401);
});

test('restart preserves old captures while old cookies cannot authenticate the new run', async t => {
  const first = await fixture(t);
  const cookie = await initialize(first);
  assert.equal((await call(first, 'file', {cookie, filename: 'offers.xml', body: '<offers/>'})).body, 'success\n');
  await first.close();
  const second = await startDiagnosticServer({directory: first.directory, port: 0, username, password});
  t.after(() => second.close());
  assert.notEqual(first.runDirectory, second.runDirectory);
  assert.equal((await call(second, 'init', {cookie})).status, 401);
  const [oldSessionDirectory] = await sessionDirectories(first);
  assert.equal(await readFile(join(oldSessionDirectory, '000001.bin'), 'utf8'), '<offers/>');
  assert.equal((await sessionDirectories(second)).length, 0);
});

test('per-session request limit prevents repeated control requests', async t => {
  const capture = await fixture(t, {limits: {maxRequestsPerSession: 2}});
  const cookie = await initialize(capture);
  assert.equal((await call(capture, 'import', {cookie})).body, 'failure\nDiagnostic capture only; import disabled\n');
  assert.equal((await call(capture, 'init', {cookie})).status, 429);
});

test('storage failure never produces a file acknowledgment or reusable partial sequence', async t => {
  const capture = await fixture(t);
  const cookie = await initialize(capture);
  const [sessionDirectory] = await sessionDirectories(capture);
  await mkdir(join(sessionDirectory, '000001.bin'));
  const response = await call(capture, 'file', {cookie, filename: 'import.xml', body: '<xml/>'});
  assert.equal(response.status, 500);
  assert.match(response.body, /^failure\n/);
  assert.doesNotMatch(response.body, /success|progress/);
  assert.equal((await call(capture, 'init', {cookie})).status, 401);
  assert.equal((await readdir(sessionDirectory)).includes('000001.json'), false);
});

test('upload timeout invalidates the partial session and malformed HTTP does not crash the server', async t => {
  const capture = await fixture(t, {limits: {requestTimeoutMs: 100}});
  const cookie = await initialize(capture);
  const target = new URL(capture.url);
  await new Promise((resolveTimeout, reject) => {
    const socket = connect(Number(target.port), '127.0.0.1', () => {
      socket.write(`POST /exchange?type=catalog&mode=file&filename=import.xml HTTP/1.1\r\nHost: ${target.host}\r\nCookie: ${cookie}\r\nContent-Length: 100\r\n\r\npartial`);
    });
    socket.on('data', () => {});
    socket.once('error', reject);
    socket.once('close', resolveTimeout);
  });
  assert.equal((await call(capture, 'init', {cookie})).status, 401);
  const [sessionDirectory] = await sessionDirectories(capture);
  assert.equal((await readdir(sessionDirectory)).filter(name => name.endsWith('.bin')).length, 0);
  const malformedReply = await new Promise((resolveResponse, reject) => {
    let response = '';
    const socket = connect(Number(target.port), '127.0.0.1', () => socket.write('BROKEN\r\n\r\n'));
    socket.on('data', chunk => { response += chunk; });
    socket.once('error', reject);
    socket.once('close', () => resolveResponse(response));
  });
  assert.match(malformedReply, /^HTTP\/1\.1 400 Bad Request/);
  assert.equal((await call(capture, 'checkauth', {headers: {Authorization: authorization}})).status, 200);
});

import {createServer} from 'node:http';
import {createHash, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {mkdir, mkdtemp, open, rename} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const cookieName = 'GRACE_DIAGNOSTIC_SESSION';
const importFailure = 'Diagnostic capture only; import disabled';
const maxFailureEvents = 64;
const defaults = {
  maxBodyBytes: 2 * 1024 * 1024,
  maxSessionBytes: 64 * 1024 * 1024,
  maxChunksPerSession: 128,
  maxRequestsPerSession: 256,
  maxSessions: 4,
  sessionTtlMs: 30 * 60 * 1000,
  requestTimeoutMs: 30 * 1000,
};

function failure(status, message) {
  return Object.assign(new Error(message), {status});
}

async function durableWrite(path, content) {
  const file = await open(path, 'wx', 0o600);
  try {
    await file.writeFile(content);
    await file.sync();
  } finally { await file.close(); }
}

function reply(response, status, text, headers = {}) {
  if (response.destroyed) return;
  response.writeHead(status, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    Connection: 'close',
    ...headers,
  });
  response.end(text);
}

function readBody(request, limit, timeoutMs) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    const finish = (error) => {
      clearTimeout(timer);
      request.off('data', onData);
      request.off('end', onEnd);
      request.off('aborted', onAbort);
      request.off('error', onError);
      if (error) { request.pause(); reject(error); }
      else resolveBody(Buffer.concat(chunks, size));
    };
    const onData = chunk => {
      size += chunk.length;
      if (size > limit) finish(failure(413, 'Capture byte limit exceeded'));
      else chunks.push(chunk);
    };
    const onEnd = () => finish(request.complete ? null : failure(400, 'Incomplete upload'));
    const onAbort = () => finish(failure(400, 'Incomplete upload'));
    const onError = () => finish(failure(400, 'Upload connection failed'));
    const timer = setTimeout(() => finish(failure(408, 'Upload timed out')), timeoutMs);
    request.on('data', onData);
    request.once('end', onEnd);
    request.once('aborted', onAbort);
    request.once('error', onError);
  });
}

/** Standalone capture only: no catalogue, database, XML parser or order integration. */
export async function startDiagnosticServer({directory, port = 5179, username, password, limits = {}, now = Date.now} = {}) {
  if (!directory || typeof username !== 'string' || !username || /[:\r\n]/.test(username) ||
      typeof password !== 'string' || !password || /[\r\n]/.test(password) ||
      !Number.isInteger(port) || port < 0 || port > 65535) throw Error('Invalid diagnostic server configuration');
  if (Object.keys(limits).some(key => !Object.hasOwn(defaults, key))) throw Error('Unknown capture limit');
  const config = {...defaults, ...limits};
  if (Object.values(config).some(value => !Number.isSafeInteger(value) || value < 1)) throw Error('Invalid capture limit');
  const baseDirectory = resolve(directory);
  await mkdir(baseDirectory, {recursive: true});
  const runDirectory = await mkdtemp(join(baseDirectory, 'capture-'));
  await durableWrite(join(runDirectory, 'run.json'), JSON.stringify({
    captureOnly: true, importEnabled: false, createdAt: new Date(now()).toISOString(), limits: config,
    httpFailureEventLimit: maxFailureEvents,
  }, null, 2));
  const expectedAuthorization = Buffer.from(`Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`);
  const sessions = new Map();
  let failureCount = 0;
  let failureWrites = Promise.resolve();
  let host;

  function recordFailure(status, request, parserFailure = false) {
    if (failureCount >= maxFailureEvents) return Promise.resolve();
    const sequence = ++failureCount;
    let mode = 'UNKNOWN';
    try {
      const url = new URL(request?.url, 'http://127.0.0.1');
      const modes = url.searchParams.getAll('mode');
      if (url.pathname === '/exchange' && modes.length === 1 && ['checkauth', 'init', 'file', 'import'].includes(modes[0])) mode = modes[0];
    } catch { /* A malformed URL has no recognized diagnostic command. */ }
    const entry = {capturedAt: new Date(now()).toISOString(), status,
      method: ['GET', 'POST'].includes(request?.method) ? request.method : 'OTHER', mode, parserFailure};
    // Best-effort bounded evidence: logging failure must not change a protocol response.
    failureWrites = failureWrites.then(() => durableWrite(join(runDirectory, `rejection-${String(sequence).padStart(6, '0')}.json`), JSON.stringify(entry))).catch(() => {});
    return failureWrites;
  }

  const server = createServer({maxHeaderSize: 8192}, (request, response) => {
    // Socket errors may arrive after a bounded body reader has detached its listeners.
    request.on('error', () => {});
    void handle(request, response).catch(async error => {
      await recordFailure(error.status ?? 500, request);
      reply(response, error.status ?? 500, `failure\n${error.status ? error.message : 'Capture storage failed; no import performed'}\n`,
        error.status === 401 ? {'WWW-Authenticate': 'Basic realm="1C diagnostic"'} : {});
    });
  });

  async function handle(request, response) {
    if (request.headers.host !== host || request.headers.origin !== undefined) throw failure(403, 'Only direct loopback requests are allowed');
    if (!request.url?.startsWith('/exchange?')) throw failure(404, 'Unknown endpoint');
    const url = new URL(request.url, `http://${host}`);
    // Native clients attach service parameters; unused values must not block the catalog protocol.
    if (url.pathname !== '/exchange' || url.hash || [...url.searchParams.keys()].some(key =>
      url.searchParams.getAll(key).length !== 1)) throw failure(400, 'Invalid exchange parameters');
    if (url.searchParams.get('type') !== 'catalog') throw failure(403, 'Only catalog capture is allowed; orders are disabled');
    const mode = url.searchParams.get('mode');
    if (!['checkauth', 'init', 'file', 'import'].includes(mode)) throw failure(400, 'Unsupported diagnostic mode');
    if (request.method !== (mode === 'file' ? 'POST' : 'GET')) throw failure(405, 'Invalid request method');
    if (request.headers['content-encoding'] && request.headers['content-encoding'] !== 'identity') throw failure(415, 'Encoded uploads are disabled');
    if (mode !== 'file' && (request.headers['transfer-encoding'] || Number(request.headers['content-length'] ?? 0) !== 0)) throw failure(400, 'Unexpected request body');
    if (mode === 'checkauth') {
      const supplied = Buffer.from(request.headers.authorization ?? '');
      if (supplied.length !== expectedAuthorization.length || !timingSafeEqual(supplied, expectedAuthorization)) throw failure(401, 'Authentication required');
      if (sessions.size >= config.maxSessions) throw failure(429, 'Session limit reached; restart capture for a new run');
      const token = randomBytes(32).toString('hex');
      const id = randomUUID();
      const createdAt = now();
      const sessionDirectory = join(runDirectory, id);
      const session = {directory: sessionDirectory, createdAt, bytes: 0, chunks: 0, requests: 0, busy: false, failed: false, initialized: false};
      // Reserve the slot before asynchronous filesystem work so parallel authentication cannot bypass the limit.
      sessions.set(token, session);
      try {
        await mkdir(sessionDirectory);
        await durableWrite(join(sessionDirectory, 'session.json'), JSON.stringify({
          id, createdAt: new Date(createdAt).toISOString(), expiresAt: new Date(createdAt + config.sessionTtlMs).toISOString(), captureOnly: true,
        }, null, 2));
      } catch (error) { session.failed = true; throw error; }
      reply(response, 200, `success\n${cookieName}\n${token}\n`, {
        'Set-Cookie': `${cookieName}=${token}; Path=/exchange; HttpOnly; SameSite=Strict`,
      });
      return;
    }
    const cookies = (request.headers.cookie ?? '').split(';').map(part => part.trim()).filter(part => part.startsWith(`${cookieName}=`));
    const token = cookies.length === 1 ? cookies[0].slice(cookieName.length + 1) : '';
    const session = /^[a-f0-9]{64}$/.test(token) ? sessions.get(token) : undefined;
    if (!session || session.failed || now() - session.createdAt >= config.sessionTtlMs) throw failure(401, 'Capture session is missing, expired or invalid');
    if (++session.requests > config.maxRequestsPerSession) throw failure(429, 'Session request limit exceeded');
    if (session.busy) throw failure(409, 'Another upload is in progress');
    if (mode === 'import') {
      const filename = url.searchParams.get('filename') ?? '';
      await durableWrite(join(session.directory, `event-${String(session.requests).padStart(6, '0')}.json`), JSON.stringify({
        sequence: session.requests, mode, response: 'import_disabled',
        ...(/^[a-z0-9][a-z0-9._-]{0,100}\.xml$/i.test(filename) && !filename.includes('..') ? {filename} : {}),
        capturedAt: new Date(now()).toISOString(), importAccepted: false,
      }, null, 2));
      reply(response, 200, `failure\n${importFailure}\n`);
      return;
    }
    if (mode === 'init') {
      await durableWrite(join(session.directory, `event-${String(session.requests).padStart(6, '0')}.json`), JSON.stringify({
        sequence: session.requests, mode, response: 'zip=no', fileLimit: config.maxBodyBytes,
        capturedAt: new Date(now()).toISOString(), importAccepted: false,
      }, null, 2));
      session.initialized = true;
      reply(response, 200, `zip=no\nfile_limit=${config.maxBodyBytes}\n`);
      return;
    }
    if (!session.initialized) throw failure(409, 'Initialize capture before uploading');
    const filename = url.searchParams.get('filename') ?? '';
    if (!/^[a-z0-9][a-z0-9._-]{0,100}\.xml$/i.test(filename) || filename.includes('..')) throw failure(400, 'Only a safe XML base filename is allowed');
    if (session.chunks >= config.maxChunksPerSession) throw failure(413, 'Session chunk limit exceeded');
    const byteLimit = Math.min(config.maxBodyBytes, config.maxSessionBytes - session.bytes);
    if (byteLimit < 1 || Number(request.headers['content-length'] ?? 0) > byteLimit) throw failure(413, 'Capture byte limit exceeded');
    session.busy = true;
    try {
      const body = await readBody(request, byteLimit, config.requestTimeoutMs);
      if (body.length === 0) throw failure(400, 'Empty upload');
      if (now() - session.createdAt >= config.sessionTtlMs) throw failure(401, 'Capture session expired during upload');
      const sequence = session.chunks + 1;
      const basename = String(sequence).padStart(6, '0');
      // User filenames are metadata only; generated names prevent traversal and preserve repeated chunks.
      await durableWrite(join(session.directory, `${basename}.bin`), body);
      await durableWrite(join(session.directory, `${basename}.json`), JSON.stringify({
        sequence, filename, bytes: body.length, sha256: createHash('sha256').update(body).digest('hex'),
        capturedAt: new Date(now()).toISOString(), transportComplete: true, importAccepted: false,
      }, null, 2));
      session.bytes += body.length;
      session.chunks = sequence;
      reply(response, 200, 'success\n');
    } catch (error) {
      // An interrupted/failed sequence cannot be resumed safely as an append operation.
      session.failed = true;
      throw error;
    } finally { session.busy = false; }
  }

  server.maxConnections = 16;
  server.maxHeadersCount = 32;
  server.requestTimeout = config.requestTimeoutMs;
  server.headersTimeout = config.requestTimeoutMs;
  server.setTimeout(config.requestTimeoutMs, socket => socket.destroy());
  server.on('clientError', (error, socket) => {
    void recordFailure(400, undefined, error.code?.startsWith('HPE_') === true).then(() => {
      if (socket.writable) socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\nContent-Length: 0\r\n\r\n');
    });
  });
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      host = `127.0.0.1:${server.address().port}`;
      resolveListen();
    });
  });
  let closing;
  return {server, url: `http://${host}/exchange`, runDirectory, close: () => closing ??= new Promise((resolveClose, reject) => {
    server.close(error => { void failureWrites.then(() => error ? reject(error) : resolveClose()); });
    server.closeAllConnections();
  })};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let capture;
  try {
    if (process.argv.length !== 2) throw Error('This local diagnostic command takes no arguments');
    const directory = resolve(dirname(fileURLToPath(import.meta.url)), '../.unlazy/1c-diagnostic');
    const username = `diagnostic_${randomBytes(6).toString('hex')}`;
    const password = randomBytes(32).toString('base64url');
    capture = await startDiagnosticServer({directory, username, password});
    const connectionFile = join(directory, 'connection.json');
    const temporaryFile = join(directory, `connection-${randomUUID()}.tmp`);
    await durableWrite(temporaryFile, JSON.stringify({url: capture.url, username, password, captureOnly: true, importEnabled: false}, null, 2));
    await rename(temporaryFile, connectionFile);
    console.log(`Diagnostic capture: ${capture.url}\nLocal credentials: ${connectionFile}`);
    for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void capture.close(); });
  } catch {
    if (capture) await capture.close();
    console.error('Diagnostic capture could not start. Check the local port and writable capture directory. Credentials were not printed.');
    process.exitCode = 1;
  }
}

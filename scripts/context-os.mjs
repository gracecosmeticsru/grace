import {createHash, randomUUID} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, isAbsolute, join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export const contextDir = 'docs/context';
const states = {
  NEW: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['IN_PROGRESS', 'PAUSED', 'BLOCKED', 'VERIFYING', 'CANCELLED'],
  PAUSED: ['IN_PROGRESS', 'CANCELLED'], BLOCKED: ['IN_PROGRESS', 'CANCELLED'],
  VERIFYING: ['VERIFYING', 'IN_PROGRESS', 'DONE', 'PAUSED', 'BLOCKED', 'CANCELLED'],
  DONE: ['IN_PROGRESS'], CANCELLED: ['IN_PROGRESS'],
};
const digest = value => createHash('sha256').update(value).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const now = () => new Date().toISOString();
const fail = message => { throw new Error(message); };
const taskId = id => /^TASK-\d{8}-\d{3,}$/.test(id) ? id : fail('Invalid task ID');
const document = data => `# ${data.id ?? 'Context record'}\n\nCanonical structured record; edit through scripts/context-os.mjs.\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
export const readVersion = path => {
  const content = existsSync(path) ? readFileSync(path, 'utf8') : null;
  return {content, hash: content === null ? null : digest(content)};
};

function inside(root, path) {
  if (typeof path !== 'string' || isAbsolute(path) || path.includes('\\') || path.split('/').includes('..')) fail('Unsafe relative path');
  const target = resolve(root, path);
  if (relative(resolve(root), target).startsWith('..')) fail('Path outside repository');
  let current = resolve(root);
  for (const part of path.split('/')) {
    current = join(current, part);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) fail('Linked context/observed paths are unsupported');
  }
  return target;
}

// shortcut: compare-before-rename detects observed conflicts, use a transactional store if strict multi-process exclusion becomes necessary.
export function writeIfUnchanged(path, content, expectedHash) {
  mkdirSync(dirname(path), {recursive: true});
  if (readVersion(path).hash !== expectedHash) fail(`CONFLICT: ${path} changed since read`);
  const temp = `${path}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temp, content, {flag: 'wx'});
    if (readVersion(path).hash !== expectedHash) fail(`CONFLICT: ${path} changed before replacement`);
    renameSync(temp, path);
  } finally { if (existsSync(temp)) rmSync(temp); }
}

function parseText(text, path) {
  const match = /^```json\r?\n([\s\S]*?)\r?\n```\s*$/m.exec(text);
  if (!match) fail(`Invalid context record: ${path}`);
  return JSON.parse(match[1]);
}
const parse = path => parseText(readFileSync(path, 'utf8'), path);
const taskPath = (root, id) => inside(root, `${contextDir}/tasks/${taskId(id)}.md`);
export const readTask = (root, id) => parse(taskPath(root, id));

function registry(root, expected) {
  const dir = inside(root, `${contextDir}/tasks`);
  const entries = existsSync(dir) ? readdirSync(dir).filter(p => /^TASK-.*\.md$/.test(p)).sort().map(p => {
    const t = parse(join(dir, p));
    return `| [${t.id}](tasks/${t.id}.md) | ${t.lastCheckpoint ? `[checkpoint](${t.lastCheckpoint.replace(`${contextDir}/`, '')})` : 'none'} |`;
  }) : [];
  const text = '# Task registry\n\nPointers only. State, requirements and next action live in each task; evidence lives in checkpoints. Select by user intent, never by newest timestamp.\n\n| Task | Latest checkpoint |\n|---|---|\n' + entries.join('\n') + '\n';
  writeIfUnchanged(inside(root, `${contextDir}/TASK_REGISTRY.md`), text, expected.hash);
}

export const acceptanceCriteria = task => [...task.original.acceptance, ...task.amendments.flatMap(amendment => amendment.acceptance ?? [])];
function validateTask(task) {
  taskId(task.id);
  if (!states[task.state] || !task.original?.request?.trim() || !task.original.scope || !Array.isArray(task.original.prohibited)) fail('Missing task schema fields');
  const criteria = acceptanceCriteria(task);
  if (!Array.isArray(criteria) || !criteria.length || criteria.some(c => !c.id || !c.text) || new Set(criteria.map(c => c.id)).size !== criteria.length) fail('Invalid acceptance criteria');
  if (!Array.isArray(task.amendments) || task.revision !== task.amendments.length + 1 || !task.nextStep?.trim()) fail('Invalid task revision/next step');
  for (const amendment of task.amendments) {
    if (!amendment.at || !amendment.text || !['USER_SPECIFIED', 'PROPOSED', 'VERIFIED'].includes(amendment.basis)) fail('Invalid amendment');
    if (amendment.acceptance && (amendment.basis !== 'USER_SPECIFIED' || !Array.isArray(amendment.acceptance))) fail('Additional acceptance requires user instruction');
  }
  for (const evidence of Object.values(task.checks ?? {})) {
    if (!['PASS', 'FAIL', 'NOT RUN', 'DESIGN REVIEW ONLY'].includes(evidence.status)) fail('Invalid check result');
  }
  if (task.state === 'DONE') {
    for (const criterion of criteria) {
      const check = task.checks?.[criterion.id];
      const waiver = task.waivers?.[criterion.id];
      if (waiver?.by === 'USER' && waiver.quote?.trim() && waiver.at && waiver.revision === task.revision) continue;
      if (check?.status !== 'PASS' || !check.evidence?.trim() || !check.at || !check.method?.trim() || check.revision !== task.revision) fail(`DONE blocked: ${criterion.id} needs verified evidence or explicit user waiver at current revision`);
    }
    if (task.remaining?.length || task.blockers?.length) fail('DONE blocked: remaining work/blockers');
  }
}

export function createTask(root, input) {
  const stamp = now();
  const date = new Intl.DateTimeFormat('sv-SE', {timeZone: 'Europe/Moscow'}).format(new Date()).replaceAll('-', '');
  const registryPath = inside(root, `${contextDir}/TASK_REGISTRY.md`);
  const registryBefore = readVersion(registryPath);
  mkdirSync(inside(root, `${contextDir}/tasks`), {recursive: true});
  mkdirSync(inside(root, `${contextDir}/checkpoints`), {recursive: true});
  for (let sequence = 1; sequence < 100000; sequence++) {
    const id = `TASK-${date}-${String(sequence).padStart(3, '0')}`;
    if (readdirSync(inside(root, `${contextDir}/checkpoints`)).some(p => p.startsWith(`${id}-`))) continue;
    const task = {schema: 1, id, createdAt: stamp, timezone: 'Europe/Moscow', owner: input.owner ?? 'UNKNOWN', state: 'NEW', revision: 1,
      original: input.original, amendments: [], relevant: input.relevant ?? [], dependencies: input.dependencies ?? [], risks: input.risks ?? [],
      completed: [], remaining: input.remaining ?? [], checks: {}, waivers: {}, lastCheckpoint: null, nextStep: input.nextStep, blockers: []};
    validateTask(task);
    try { writeFileSync(taskPath(root, id), document(task), {flag: 'wx'}); }
    catch (error) { if (error.code === 'EEXIST') continue; throw error; }
    registry(root, registryBefore);
    return task;
  }
  fail('Task ID space exhausted');
}

function fingerprint(root, path) {
  if (/(^|\/)(\.env[^/]*|\.dev\.vars[^/]*|\.git|\.wrangler|\.sites-runtime|\.codex|\.unlazy)(\/|$)/.test(path)) fail('Sensitive/local path cannot be observed');
  const absolute = inside(root, path);
  return existsSync(absolute) ? digest(readFileSync(absolute)) : null;
}

function gitSnapshot(root) {
  const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trimEnd();
  try {
    const status = git('status', '--porcelain=v1', '--untracked-files=all');
    return {branch: git('branch', '--show-current'), head: git('rev-parse', 'HEAD'), status: status.split('\n').filter(Boolean)};
  } catch { return {branch: 'UNKNOWN', head: 'UNKNOWN', status: []}; }
}

export function recoverTask(root, id) {
  const version = readVersion(taskPath(root, id));
  const task = parseText(version.content, taskPath(root, id));
  validateTask(task);
  const dir = inside(root, `${contextDir}/checkpoints`);
  const candidates = existsSync(dir) ? readdirSync(dir).filter(p => new RegExp(`^${taskId(id)}-\\d{4,}\\.md$`).test(p)).sort((a, b) => Number(a.match(/-(\d+)\.md$/)[1]) - Number(b.match(/-(\d+)\.md$/)[1])) : [];
  const issues = [], valid = [];
  for (const name of candidates) {
    const path = `${contextDir}/checkpoints/${name}`;
    try {
      const cp = parse(inside(root, path));
      if (cp.taskId !== id || cp.previous !== (valid.at(-1)?.path ?? null) || cp.originalHash !== digest(JSON.stringify(task.original))) fail('checkpoint identity/chain/requirements mismatch');
      validateTask(cp.taskSnapshot);
      const amendments = cp.taskSnapshot.amendments, common = Math.min(amendments.length, task.amendments.length);
      const prior = valid.at(-1)?.taskSnapshot.amendments ?? [];
      if (cp.taskSnapshot.id !== id || cp.revision !== cp.taskSnapshot.revision || cp.state !== cp.taskSnapshot.state || cp.taskSnapshot.lastCheckpoint !== path || !same(cp.taskSnapshot.original, task.original) || !same(amendments.slice(0, common), task.amendments.slice(0, common)) || !same(prior, amendments.slice(0, prior.length))) fail('checkpoint snapshot mismatch');
      valid.push({path, ...cp});
    } catch (error) { issues.push(`INVALID ${path}: ${error.message}`); }
  }
  const checkpoint = valid.at(-1) ?? null;
  if (task.lastCheckpoint !== (checkpoint?.path ?? null)) issues.push('POINTER_MISMATCH: inspect valid checkpoint sequence; never replay commands');
  const reg = readVersion(inside(root, `${contextDir}/TASK_REGISTRY.md`)).content ?? '';
  const row = reg.split('\n').find(line => line.startsWith(`| [${id}]`));
  if (!row || (checkpoint && !row.includes(checkpoint.path.replace(`${contextDir}/`, '')))) issues.push('REGISTRY_MISMATCH');
  const git = gitSnapshot(root), differences = [];
  if (checkpoint) {
    if (!same(task, checkpoint.taskSnapshot)) issues.push('TASK_SNAPSHOT_MISMATCH: uncheckpointed task edits require reconciliation');
    if (git.head !== checkpoint.git.head || git.branch !== checkpoint.git.branch) differences.push({path: 'Git HEAD/branch', classification: 'UNKNOWN', before: checkpoint.git, after: {head: git.head, branch: git.branch}});
    for (const [path, hash] of Object.entries(checkpoint.fingerprints)) {
      const current = fingerprint(root, path);
      differences.push({path, classification: current === hash ? 'EXPECTED' : 'UNKNOWN', before: hash, after: current});
    }
    for (const entry of new Set([...git.status, ...checkpoint.git.status])) {
      const path = entry.slice(3);
      if (!path.startsWith(`${contextDir}/`) && !(path in checkpoint.fingerprints)) differences.push({path, classification: 'OTHER_SESSION_OR_USER'});
    }
  }
  return {task, taskHash: version.hash, checkpoint, valid: valid.map(cp => cp.path), issues, differences,
    nextStep: checkpoint?.taskSnapshot.nextStep ?? task.nextStep,
    safeToResume: issues.length === 0 && differences.every(item => item.classification === 'EXPECTED')};
}

export function checkpointTask(root, id, input, expectedHash) {
  const path = taskPath(root, id), before = readVersion(path);
  if (!expectedHash || before.hash !== expectedHash) fail('CONFLICT: task changed since read; obtain current hash with resume');
  const onDisk = parseText(before.content, path);
  const registryBefore = readVersion(inside(root, `${contextDir}/TASK_REGISTRY.md`));
  const allowed = ['state', 'nextStep', 'completed', 'remaining', 'checks', 'waivers', 'blockers', 'amendment', 'reopen', 'observe', 'reconciliation'];
  if (Object.keys(input).some(key => !allowed.includes(key))) fail('Original requirements/metadata cannot be overwritten');
  const recovery = recoverTask(root, id);
  if (recovery.taskHash !== before.hash) fail('CONFLICT: task changed during recovery');
  if (!recovery.safeToResume && !input.reconciliation?.trim()) fail('Recovery differences require explicit reconciliation');
  if (recovery.issues.some(issue => issue.startsWith('INVALID'))) fail('Invalid checkpoints require manual investigation; preserved untouched');
  const pending = recovery.checkpoint?.taskSnapshot;
  const previous = pending && recovery.issues.some(issue => issue.startsWith('TASK_SNAPSHOT_MISMATCH')) ? pending : onDisk;
  if (previous !== onDisk && before.hash !== recovery.checkpoint.previousTaskHash) fail('Uncheckpointed task edits require manual investigation; no silent overwrite');
  if (!states[previous.state]?.includes(input.state ?? previous.state) && previous.state !== input.state) fail('Invalid state transition');
  if (['DONE', 'CANCELLED'].includes(previous.state) && !input.reopen?.trim()) {
    const repairingPublication = (previous !== onDisk || recovery.issues.includes('REGISTRY_MISMATCH')) &&
      (input.state ?? previous.state) === previous.state && Object.keys(input).every(key => ['state', 'reconciliation', 'observe'].includes(key));
    if (!repairingPublication) fail('Reopening requires explicit record');
  }
  const task = structuredClone(previous);
  for (const key of ['state', 'nextStep', 'completed', 'remaining', 'blockers']) if (key in input) task[key] = input[key];
  if (input.amendment) task.amendments.push(input.amendment);
  if (input.reopen) task.amendments.push({at: now(), basis: 'USER_SPECIFIED', text: `Reopened: ${input.reopen}`});
  task.revision = task.amendments.length + 1;
  for (const key of ['checks', 'waivers']) if (key in input) task[key] = {...task[key], ...Object.fromEntries(Object.entries(input[key]).map(([id, evidence]) => [id, {...evidence, revision: task.revision}]))};
  validateTask(task);
  const observed = [...new Set([...task.relevant, ...(input.observe ?? []), ...Object.keys(recovery.checkpoint?.fingerprints ?? {})])];
  const fingerprints = Object.fromEntries(observed.map(p => [p, fingerprint(root, p)]));
  const git = gitSnapshot(root);
  for (let sequence = 1; sequence < 100000; sequence++) {
    const cpPath = `${contextDir}/checkpoints/${id}-${String(sequence).padStart(4, '0')}.md`;
    task.lastCheckpoint = cpPath;
    const cp = {schema: 1, id: `${id}-${String(sequence).padStart(4, '0')}`, taskId: id, revision: task.revision, at: now(), timezone: 'Europe/Moscow',
      state: task.state, originalHash: digest(JSON.stringify(task.original)), previous: recovery.checkpoint?.path ?? null, previousTaskHash: before.hash,
      git, fingerprints, taskSnapshot: task, lastSafeStep: task.completed.at(-1) ?? 'Task recorded', nextSafeStep: task.nextStep,
      preconditions: input.reconciliation ?? 'Git, task and observed files reconciled; no command replay', conflicts: recovery.issues, differences: recovery.differences};
    try { writeFileSync(inside(root, cpPath), document(cp), {flag: 'wx'}); }
    catch (error) { if (error.code === 'EEXIST') continue; throw error; }
    if (!same(parse(inside(root, cpPath)), cp)) fail('Checkpoint readback failed');
    writeIfUnchanged(path, document(task), before.hash);
    registry(root, registryBefore);
    const result = recoverTask(root, id);
    if (result.issues.length) fail(`Checkpoint pointers need recovery: ${result.issues.join('; ')}`);
    return task;
  }
  fail('Checkpoint ID space exhausted');
}

export function auditContext(root) {
  const problems = [], files = ['AGENTS.md', 'PROJECT_CONTEXT.md'];
  const walk = dir => { for (const entry of readdirSync(dir, {withFileTypes: true})) {
    const path = join(dir, entry.name);
    if (entry.isSymbolicLink()) fail('Linked context document');
    if (entry.isDirectory()) walk(path); else if (entry.name.endsWith('.md')) files.push(relative(root, path).replaceAll('\\', '/'));
  }};
  walk(inside(root, contextDir));
  for (const path of files) {
    // Frozen source specifications and historical instructions are evidence, not active routing documents.
    if (path.startsWith(`${contextDir}/archive/`) || path.startsWith(`${contextDir}/spec/`)) continue;
    const content = readFileSync(inside(root, path), 'utf8');
    for (const match of content.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      const absolute = resolve(dirname(inside(root, path)), decodeURI(target));
      if (!existsSync(absolute)) problems.push(`${path}: broken link ${target}`);
    }
  }
  const tasks = inside(root, `${contextDir}/tasks`);
  if (existsSync(tasks)) for (const name of readdirSync(tasks).filter(p => /^TASK-.*\.md$/.test(p))) {
    const recovery = recoverTask(root, name.slice(0, -3));
    problems.push(...recovery.issues.map(issue => `${name}: ${issue}`));
  }
  return {files: files.length, problems};
}

export function verifyUnchanged(root, baselinePath) {
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  const allowed = path => path === 'AGENTS.md' || path === 'PROJECT_CONTEXT.md' || path.startsWith(`${contextDir}/`) || path.startsWith('graphify-out/') || ['scripts/context-os.mjs', 'tests/context-os.test.mjs'].includes(path);
  const changed = Object.entries(baseline.files).filter(([path, hash]) => !allowed(path) && fingerprint(root, path) !== hash).map(([path]) => path);
  const current = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {cwd: root, encoding: 'utf8'}).split('\0').filter(Boolean);
  changed.push(...new Set(current.filter(path => !(path in baseline.files) && !allowed(path))));
  if (changed.length) fail(`SOURCE CHANGED: ${changed.join(', ')}`);
  return {protectedFiles: Object.keys(baseline.files).filter(path => !allowed(path)).length, baselineHead: baseline.head, changed: 0};
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, id, inputPath, expectedHash] = process.argv.slice(2), root = process.cwd();
    if (command === 'new') console.log(JSON.stringify(createTask(root, JSON.parse(readFileSync(id, 'utf8'))), null, 2));
    else if (command === 'checkpoint') console.log(JSON.stringify(checkpointTask(root, id, JSON.parse(readFileSync(inputPath, 'utf8')), expectedHash), null, 2));
    else if (command === 'resume') console.log(JSON.stringify(recoverTask(root, taskId(id)), null, 2));
    else if (command === 'audit') {
      const result = auditContext(root);
      if (result.problems.length) fail(result.problems.join('\n'));
      console.log(`CONTEXT AUDIT PASS: ${result.files} Markdown files; pointers and links valid`);
    } else if (command === 'unchanged') console.log('SOURCE UNCHANGED PASS', JSON.stringify(verifyUnchanged(root, id)));
    else fail('Usage: node scripts/context-os.mjs new input.json | resume TASK-ID | checkpoint TASK-ID input.json taskHash | audit | unchanged baseline.json');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

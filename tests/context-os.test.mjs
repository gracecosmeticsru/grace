import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join, resolve} from 'node:path';
import {acceptanceCriteria, auditContext, checkpointTask, contextDir, createTask, readTask, readVersion, recoverTask, verifyUnchanged, writeIfUnchanged} from '../scripts/context-os.mjs';

const input = () => ({owner: 'synthetic', original: {request: 'Исходное требование\nСохранить ₽, перенос строки и точную формулировку.', provenance: 'verbatim synthetic', scope: 'temporary fixture', prohibited: ['network', 'application changes'], acceptance: [{id: 'A', text: 'Synthetic assertion passes'}]}, relevant: ['source.txt'], nextStep: 'Inspect synthetic source', remaining: ['A']});
const pass = () => ({status: 'PASS', at: new Date().toISOString(), method: 'node:assert isolated fixture', evidence: 'assertion actually executed in test'});
function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'grace-context-test-'));
  t.after(() => { assert.ok(resolve(root).startsWith(resolve(tmpdir()))); rmSync(root, {recursive: true, force: true}); });
  const git = (...args) => execFileSync('git', args, {cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']});
  git('init', '-q');
  writeFileSync(join(root, 'source.txt'), 'initial source');
  git('add', 'source.txt');
  git('-c', 'user.name=Context Synthetic', '-c', 'user.email=synthetic@example.invalid', 'commit', '-qm', 'synthetic baseline');
  return {root, git};
}
const save = (root, task, changes) => checkpointTask(root, task.id, changes, readVersion(join(root, contextDir, 'tasks', `${task.id}.md`)).hash);
const rawDocument = data => `# synthetic\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;

test('pause/resume preserves verbatim originals, evidence, next action and independent tasks', t => {
  const {root} = fixture(t), original = input();
  const first = createTask(root, original), second = createTask(root, {...input(), nextStep: 'Second task only'});
  assert.notEqual(first.id, second.id);
  let task = save(root, first, {state: 'IN_PROGRESS', completed: ['Original captured'], checks: {A: pass()}});
  const oldCheckpoint = readFileSync(join(root, task.lastCheckpoint), 'utf8');
  task = save(root, task, {state: 'PAUSED', nextStep: 'Resume exact milestone', amendment: {at: new Date().toISOString(), basis: 'USER_SPECIFIED', text: 'Preserve original; additional constraint only'}});
  const recovery = recoverTask(root, task.id);
  assert.equal(recovery.safeToResume, true);
  assert.deepEqual(recovery.task.original, original.original);
  assert.equal(recovery.nextStep, 'Resume exact milestone');
  assert.equal(recovery.task.checks.A.status, 'PASS');
  assert.equal(readTask(root, second.id).state, 'NEW');
  assert.equal(readFileSync(join(root, recovery.checkpoint.previous), 'utf8'), oldCheckpoint);
  task = save(root, task, {state: 'IN_PROGRESS'});
  assert.equal(task.state, 'IN_PROGRESS');
  assert.throws(() => save(root, task, {original: {request: 'erase'}}), /cannot be overwritten/);
});

test('broken task/registry pointer is detected and cannot silently resume', t => {
  const {root} = fixture(t), task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  const path = join(root, contextDir, 'tasks', `${task.id}.md`), broken = structuredClone(task);
  broken.lastCheckpoint = `${contextDir}/checkpoints/${task.id}-9999.md`;
  writeFileSync(path, rawDocument(broken));
  const recovery = recoverTask(root, task.id);
  assert.equal(recovery.safeToResume, false);
  assert.ok(recovery.issues.some(s => s.startsWith('POINTER_MISMATCH')));
  assert.equal(recovery.checkpoint.taskSnapshot.nextStep, task.nextStep);
  assert.throws(() => save(root, broken, {state: 'PAUSED'}), /reconciliation/);
  writeFileSync(path, rawDocument(task));
  writeFileSync(join(root, contextDir, 'TASK_REGISTRY.md'), '# interrupted registry\n');
  assert.ok(recoverTask(root, task.id).issues.includes('REGISTRY_MISMATCH'));
  save(root, task, {state: 'PAUSED', reconciliation: 'Synthetic registry repaired from valid task/checkpoint'});
  assert.equal(recoverTask(root, task.id).issues.length, 0);
});

for (const withAmendment of [false, true]) test(`interrupted checkpoint publication retains progress and amendment=${withAmendment}`, t => {
  const {root} = fixture(t);
  let task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  const path = join(root, contextDir, 'tasks', `${task.id}.md`), before = readFileSync(path, 'utf8');
  const registryBefore = readFileSync(join(root, contextDir, 'TASK_REGISTRY.md'), 'utf8');
  task = save(root, task, {state: 'PAUSED', completed: ['Milestone verified'], nextStep: 'Continue after committed milestone', checks: {A: pass()},
    ...(withAmendment ? {amendment: {at: new Date().toISOString(), basis: 'USER_SPECIFIED', text: 'New constraint retained'}} : {})});
  writeFileSync(path, before);
  writeFileSync(join(root, contextDir, 'TASK_REGISTRY.md'), registryBefore);
  const recovery = recoverTask(root, task.id);
  assert.equal(recovery.valid.length, 2);
  assert.ok(recovery.issues.some(s => s.startsWith('POINTER_MISMATCH')));
  assert.equal(recovery.checkpoint.taskSnapshot.completed.at(-1), 'Milestone verified');
  const repaired = save(root, readTask(root, task.id), {state: 'IN_PROGRESS', reconciliation: 'Inspected pending snapshot; publish from its verified milestone'});
  assert.deepEqual(repaired.completed, ['Milestone verified']);
  assert.equal(repaired.checks.A.status, 'PASS');
  assert.equal(repaired.amendments.length, withAmendment ? 1 : 0);
  assert.equal(recoverTask(root, task.id).issues.length, 0);
});

test('invalid newer checkpoint is preserved and blocks writes rather than discarded', t => {
  const {root} = fixture(t), task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  const badPath = join(root, contextDir, 'checkpoints', `${task.id}-0002.md`);
  writeFileSync(badPath, 'interrupted bytes');
  const recovered = recoverTask(root, task.id);
  assert.equal(recovered.valid.length, 1);
  assert.ok(recovered.issues.some(s => s.startsWith('INVALID')));
  assert.throws(() => save(root, task, {state: 'PAUSED', reconciliation: 'cannot override corrupt evidence'}), /Invalid checkpoints/);
  assert.equal(readFileSync(badPath, 'utf8'), 'interrupted bytes');
});

test('pending checkpoint recovery never overwrites uncheckpointed user task edits', t => {
  const {root} = fixture(t);
  let task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  const path = join(root, contextDir, 'tasks', `${task.id}.md`), predecessor = readFileSync(path, 'utf8');
  task = save(root, task, {state: 'PAUSED', completed: ['Pending milestone']});
  writeFileSync(path, predecessor);
  const userEdit = readTask(root, task.id);
  userEdit.nextStep = 'User instruction added after interruption';
  userEdit.completed.push('Other user progress');
  writeFileSync(path, rawDocument(userEdit));
  assert.throws(() => save(root, userEdit, {state: 'IN_PROGRESS', reconciliation: 'Do not erase manual edits'}), /no silent overwrite/);
  assert.equal(readTask(root, task.id).nextStep, userEdit.nextStep);
});

for (const state of ['DONE', 'CANCELLED']) test(`interrupted ${state} publication repairs pointers without inventing reopening`, t => {
  const {root} = fixture(t);
  let task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  task = save(root, task, {state: 'VERIFYING'});
  const path = join(root, contextDir, 'tasks', `${task.id}.md`), predecessor = readFileSync(path, 'utf8');
  task = save(root, task, {state, remaining: [], checks: {A: pass()}, nextStep: 'No further work'});
  writeFileSync(path, predecessor);
  const repaired = save(root, readTask(root, task.id), {state, reconciliation: 'Publish exact pending terminal snapshot'});
  assert.equal(repaired.state, state);
  assert.equal(repaired.amendments.length, 0);
  assert.equal(recoverTask(root, task.id).issues.length, 0);
});

test('stale shared-file read and stale task token refuse overwrite', t => {
  const {root} = fixture(t), path = join(root, 'shared.md');
  writeFileSync(path, 'first');
  const observed = readVersion(path);
  writeIfUnchanged(path, 'other session', observed.hash);
  assert.throws(() => writeIfUnchanged(path, 'stale overwrite', observed.hash), /CONFLICT/);
  assert.equal(readFileSync(path, 'utf8'), 'other session');
  const task = createTask(root, input()), taskPath = join(root, contextDir, 'tasks', `${task.id}.md`), stale = readVersion(taskPath).hash;
  save(root, task, {state: 'IN_PROGRESS'});
  assert.throws(() => checkpointTask(root, task.id, {state: 'PAUSED'}, stale), /CONFLICT/);
});

test('DONE blocks NOT RUN, FAIL, design-only, empty evidence and unfinished work; accepts explicit waiver', t => {
  const {root} = fixture(t);
  let task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  task = save(root, task, {state: 'VERIFYING'});
  for (const status of ['NOT RUN', 'FAIL', 'DESIGN REVIEW ONLY']) assert.throws(() => save(root, task, {state: 'DONE', remaining: [], checks: {A: {...pass(), status}}}), /DONE blocked/);
  assert.throws(() => save(root, task, {state: 'DONE', remaining: [], checks: {A: {...pass(), evidence: ''}}}), /DONE blocked/);
  assert.throws(() => save(root, task, {state: 'DONE', checks: {A: pass()}}), /remaining work/);
  const done = save(root, task, {state: 'DONE', remaining: [], checks: {A: {status: 'NOT RUN'}}, waivers: {A: {by: 'USER', quote: 'Synthetic user explicitly waives A', at: new Date().toISOString()}}, nextStep: 'No further synthetic work'});
  assert.equal(done.state, 'DONE');
  assert.throws(() => save(root, done, {state: 'IN_PROGRESS'}), /Reopening/);
  assert.equal(save(root, done, {state: 'IN_PROGRESS', reopen: 'Synthetic explicit reopening'}).state, 'IN_PROGRESS');
});

test('additional acceptance criteria and revisions invalidate old completion evidence', t => {
  const {root} = fixture(t);
  let task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  task = save(root, task, {state: 'VERIFYING', checks: {A: pass()}});
  task = save(root, task, {state: 'VERIFYING', amendment: {at: new Date().toISOString(), basis: 'USER_SPECIFIED', text: 'Also require B', acceptance: [{id: 'B', text: 'B is verified'}]}});
  assert.deepEqual(acceptanceCriteria(task).map(c => c.id), ['A', 'B']);
  assert.throws(() => save(root, task, {state: 'DONE', remaining: []}), /current revision/);
  assert.throws(() => save(root, task, {state: 'DONE', remaining: [], checks: {A: pass()}}), /B needs verified/);
  task = save(root, task, {state: 'DONE', remaining: [], checks: {A: pass(), B: pass()}});
  assert.equal(task.state, 'DONE');
});

test('recovery detects repeated dirty-source changes even when explicit observe is empty, and Git HEAD drift', t => {
  const {root, git} = fixture(t), first = createTask(root, input());
  writeFileSync(join(root, 'source.txt'), 'dirty one');
  const task = save(root, first, {state: 'IN_PROGRESS', observe: []});
  writeFileSync(join(root, 'source.txt'), 'dirty two');
  assert.equal(recoverTask(root, task.id).safeToResume, false);
  assert.ok(recoverTask(root, task.id).differences.some(d => d.path === 'source.txt' && d.classification === 'UNKNOWN'));
  assert.throws(() => save(root, task, {state: 'PAUSED'}), /reconciliation/);
  git('add', 'source.txt'); git('-c', 'user.name=Synthetic', '-c', 'user.email=synthetic@example.invalid', 'commit', '-qm', 'source drift');
  assert.ok(recoverTask(root, task.id).differences.some(d => d.path === 'Git HEAD/branch'));
});

test('requirements tampering and unsafe observed paths fail closed', t => {
  const {root} = fixture(t), task = save(root, createTask(root, input()), {state: 'IN_PROGRESS'});
  assert.throws(() => save(root, task, {state: 'PAUSED', observe: ['../outside']}), /Unsafe relative/);
  assert.throws(() => save(root, task, {state: 'PAUSED', observe: ['.env.secret']}), /Sensitive/);
  const changed = structuredClone(task); changed.original.request = 'mutated original';
  writeFileSync(join(root, contextDir, 'tasks', `${task.id}.md`), rawDocument(changed));
  assert.ok(recoverTask(root, task.id).issues.some(s => s.startsWith('INVALID')));
});

test('source preservation guard catches changed, new untracked and newly committed app files', t => {
  const {root, git} = fixture(t), baselinePath = join(root, 'baseline.json');
  writeFileSync(baselinePath, JSON.stringify({head: git('rev-parse', 'HEAD').trim(), files: {'source.txt': createHash('sha256').update('initial source').digest('hex')}}));
  // Baseline is outside the synthetic repository inventory, as in the actual installation.
  const external = join(tmpdir(), `grace-context-baseline-${Date.now()}-${Math.random()}.json`);
  writeFileSync(external, readFileSync(baselinePath)); rmSync(baselinePath);
  t.after(() => rmSync(external, {force: true}));
  assert.equal(verifyUnchanged(root, external).changed, 0);
  writeFileSync(join(root, 'new-app.js'), 'new code');
  assert.throws(() => verifyUnchanged(root, external), /new-app.js/);
  git('add', 'new-app.js'); git('-c', 'user.name=Synthetic', '-c', 'user.email=synthetic@example.invalid', 'commit', '-qm', 'new tracked app');
  assert.throws(() => verifyUnchanged(root, external), /new-app.js/);
  writeFileSync(join(root, 'source.txt'), 'changed');
  assert.throws(() => verifyUnchanged(root, external), /source.txt/);
});

test('real selective routes resolve minimal docs/code/tests for three existing workflows', () => {
  const root = resolve(import.meta.dirname, '..');
  for (const domain of ['catalog', 'orders', 'delivery']) {
    const path = join(root, contextDir, 'domains', `${domain}.md`), text = readFileSync(path, 'utf8');
    const links = [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map(m => m[1]);
    assert.ok(links.some(p => p.includes('/lib/')));
    assert.ok(links.some(p => p.includes('/tests/')));
    assert.ok(text.includes('Не читать') || text.includes('Минимальн') || text.includes('Минимальн'.toLowerCase()));
    for (const link of links) assert.ok(existsSync(resolve(path, '..', link)), `${domain}: ${link}`);
  }
});

test('link audit detects a broken local link (positive control)', t => {
  const {root} = fixture(t);
  mkdirSync(join(root, contextDir), {recursive: true});
  writeFileSync(join(root, 'AGENTS.md'), '[source](source.txt)');
  writeFileSync(join(root, 'PROJECT_CONTEXT.md'), '[missing](missing.md)');
  assert.ok(auditContext(root).problems.some(p => p.includes('missing.md')));
  writeFileSync(join(root, 'PROJECT_CONTEXT.md'), '[source](source.txt)');
  assert.equal(auditContext(root).problems.length, 0);
});

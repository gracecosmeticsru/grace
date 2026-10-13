# GRACE CODEX CONTEXT OS v4.0 — SPECIFICATION

**Repository:** `D:/grace`. **Priority:** P0 no silent loss of task context; P1 avoid unnecessary token use; P2 improve execution quality. This file is a specification to implement, not a claim of installed functionality. Markdown instructions cannot guarantee crash-proof persistence or cross-process locking.

## 1. Safety and reconnaissance

First verify `D:/grace`, repository root, git status, existing `AGENTS.md` / `AGENTS.override.md` (including nested files), README, docs, `.codex`, `.gitignore`, stack, scripts, tests, modules and sensitive paths. Follow existing higher-priority instructions. Preserve all user edits. Do not alter application code, database, deployment, dependencies, git history or external systems. Do not commit/push, install packages or run migrations. Never record secrets or private data. If merging existing instructions is ambiguous, ask before modifying them. Do not assert facts unsupported by code or explicit user requirements.

## 2. Target files and ownership

Create only needed files; integrate existing documentation rather than duplicating it:

```text
D:/grace/
  AGENTS.md                    # <=120 lines; core reading/writing protocol
  PROJECT_CONTEXT.md          # stable verified architecture and source pointers
  .codex/context/
    INDEX.md                   # task intent -> domain docs -> source paths/tests
    PROJECT_STATE.md           # current verified capabilities and limitations
    TASK_REGISTRY.md           # pointers to active/paused tasks and checkpoints
    DECISIONS.md               # architectural decisions and supersessions
    KNOWN_ISSUES.md            # confirmed issues vs hypotheses
    tasks/TASK-YYYYMMDD-NNN.md # original request, constraints, execution state
    checkpoints/TASK-YYYYMMDD-NNN-0001.md # append-only verified snapshot
    domains/*.md               # only existing relevant subsystems
    archive/                   # completed tasks, not routinely loaded
```

No extra global handoff file: latest verified checkpoint plus task file ARE the handoff. Registry is a pointer, never a second source of truth. Requirements and acceptance criteria live in the task file; checkpoints contain evidence; stable project knowledge lives in PROJECT_CONTEXT/domains; decisions in DECISIONS. Keep index concise and navigational. Size limits are soft; never truncate critical requirements to satisfy them.

## 3. Required AGENTS.md operating protocol

**Start:** Interpret the latest user request first. For a new task, load only known instructions and source paths; use INDEX if locations are unclear. For a resumed task, load its task file and latest valid checkpoint, then reconcile with git status and current source before acting. Do not reopen unchanged documents repeatedly within a session.

**Create task:** Generate collision-checked ID; preserve original user wording verbatim if accessible, otherwise mark a faithful reconstruction. Record acceptance criteria, forbidden changes, scope, dependencies, risks, next step, relevant files and verification method. Do not invent requirements. Record subsequent user changes as dated amendments, never erase originals.

**Execute:** Work in small verifiable milestones. Check affected contracts and dependencies; do not refactor unrelated code. Save a checkpoint after important verified progress, before switching tasks, before risky steps and before normal exit. Do not log every tool call.

**Complete:** Only mark DONE after acceptance criteria are verified or explicitly waived by user. Report tests that were not run. Update only impacted domain/project knowledge. Keep unfinished tasks resumable.

**Conflict:** Before overwriting shared files, re-read and compare to observed version; on conflict stop and reconcile, never blindly overwrite. Instructions are not a guaranteed filesystem lock.

**Truthfulness:** Code/configuration overrides stale documentation. Use `VERIFIED`, `USER_SPECIFIED`, `PROPOSED`, `UNKNOWN`, `OBSOLETE`; cite source paths and dates for consequential claims. Never invent token savings.

## 4. Task state machine and schema

Allowed states: `NEW`, `IN_PROGRESS`, `PAUSED`, `BLOCKED`, `VERIFYING`, `DONE`, `CANCELLED`. Normal flow: NEW -> IN_PROGRESS -> VERIFYING -> DONE; IN_PROGRESS may pause/block; VERIFYING may return to work. DONE requires evidence; reopening requires explicit record. Keep multiple tasks in separate files; starting another task never destroys the previous one.

Every `tasks/TASK-ID.md` must include:
- ID, created timestamp/timezone (or UNKNOWN), state, session/owner if available.
- Original user request and dated amendments; immutable original requirements.
- Explicit scope, prohibited actions, measurable acceptance criteria.
- Relevant docs, source files, dependencies, risks.
- Verified completed steps and outstanding steps.
- Decisions and evidence links; test commands/results (or NOT RUN).
- Last verified checkpoint pointer; next single safe action; blockers.

## 5. Checkpoint protocol and recovery

Each uniquely numbered, **append-only** checkpoint contains task ID, requirement revision, timestamp, state, Git branch/HEAD (or unavailable), concise worktree status, changed/observed relevant paths and optional SHA-256 fingerprints, completed VERIFIED steps, exact test evidence, remaining work, last completed safe step, next safe step, preconditions, conflicts and previous checkpoint path. Do not mistake planned work for verified work.

**Write order:** (1) create new checkpoint with unique path; (2) read back/validate; (3) update task state and checkpoint pointer without losing requirements; (4) update registry pointer last; (5) validate links. Prefer safe temp-file-and-rename for index updates if available, but do not claim atomicity across multiple files. On interrupted updates, enumerate valid checkpoints and reconcile pointers.

**Recovery:** Identify intended task from user request, not newest file. Read task, registry and checkpoint; reconcile pointer mismatch by inspecting valid checkpoint sequence. Check Git HEAD/branch/status, relevant files and tests against checkpoint. Classify differences EXPECTED / OTHER_SESSION_OR_USER / UNKNOWN. Do not replay potentially non-idempotent commands or external writes. If ambiguous or destructive, stop and ask. Record discrepancies and resume from last verified milestone. A sudden crash may leave work not captured by a checkpoint: inspect worktree before continuing.

## 6. Concurrency and conflict control

Two Codex sessions may operate in the same directory. Use unique task/checkpoint files, and minimize shared file edits. When reading a shared file, record its hash or exact content state; immediately before writing, re-read and compare. If changed, refuse blind overwrite, merge only clearly disjoint edits or ask. Re-check ID uniqueness before creating new task/checkpoint files. This is optimistic conflict detection, **not** a guaranteed multi-process lock. Preserve all existing uncommitted changes.

## 7. Selective context routing

L0: current request + already loaded instructions; L1: task + checkpoint **only for resumption**; L2: INDEX and one/two relevant domain docs if paths unclear; L3: targeted file/symbol search and minimal code ranges; L4: broader scan only for cross-cutting issues or unresolved dependencies. INDEX entries map intent -> document -> likely source paths -> tests -> when NOT to read. Avoid repeated full scans, generated/vendor directories, binary files and full historical logs. Never reduce correctness to save tokens.

If token telemetry is unavailable, measure only observable proxies (opened files, lines/bytes inspected, broad scans, redundant reads). Do not claim numerical token reductions without real measurements. Do not run an unnecessary full scan just to produce a comparison.

## 8. Knowledge freshness

Project/domain docs record stable architecture, source paths, interfaces, dependencies, relevant checks and verified limitations. For important facts record source and last verification; when code changes, re-check impacted claims and mark unverified ones stale. DECISIONS uses ID, date, rationale, impacted modules, status ACTIVE/SUPERSEDED. KNOWN_ISSUES separates reproduced symptom, confirmed root cause, hypothesis, workaround and verified fix. Do not create duplicate full changelogs of every action.

## 9. Installation phases

A. **Read-only audit:** Verify repository, instructions, documentation, git state, stack and module map. Do not assume any specific Grace implementation.

B. **Merge design:** Determine safe files to create/merge. If existing user content would be overwritten or instruction conflicts cannot be resolved safely, ask first; otherwise proceed.

C. **Implement:** Create/integrate AGENTS, PROJECT_CONTEXT, INDEX, PROJECT_STATE, registry, decisions/issues and only warranted domain docs. Do not fabricate active tasks or pretend unimplemented features exist. Do not silently change `.gitignore`; state whether project docs should be tracked.

D. **Validate:** Read back all files, check relative links, no secret values, no contradictory rules, no accidental changes to functional source, and original git diff preserved.

E. **Execute isolated synthetic tests**, with test data separate from actual tasks and safely removed after:
1. Pause/resume a synthetic task and recover original requirements, next step and evidence.
2. Break a synthetic checkpoint pointer; recovery detects inconsistency.
3. Simulate stale shared-file read; write detects conflict instead of overwriting.
4. Test completion gate: NOT RUN/failed required test cannot become DONE without user waiver.
5. Route three workflows that actually exist in this repo; list minimal docs/code/tests, without full repository reread.
6. Verify no app files were changed.

Mark each result `PASS`, `FAIL`, `NOT RUN` or `DESIGN REVIEW ONLY`. Do not call conceptual tests executed tests.

## 10. Acceptance and final report

Accept only if user requirements survive a simulated pause/resume, conflicts are detected, DONE requires evidence, links resolve, source remains unchanged and selective retrieval is documented. Report created/modified paths, confirmed stack, merge decisions, test evidence, unresolved issues, how to start/resume a task and limitations. Do not claim guaranteed zero context loss or a measured 10/10 without evidence.

## 11. Usage examples

**New:** `Начни новую задачу: [описание]. Сохрани исходные требования и критерии готовности, найди минимальный контекст, затем приступай.`

**Resume:** `Продолжи TASK-...: проверь последнюю подтверждённую контрольную точку по Git и файлам и выполни следующий безопасный шаг.`

**Switch:** `Приостанови текущую задачу с проверенным checkpoint и начни новую: ...`

**Audit:** `Проверь целостность Context OS, ссылки, незавершённые задачи, конфликтующие состояния и устаревшие знания. Ничего не меняй до отчёта.`

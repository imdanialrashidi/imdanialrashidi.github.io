# Plan 020: Restore green baseline — format gate currently red (typecheck already green)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 236600b..HEAD -- scripts/ src/ package.json biome.json tsconfig.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW (deterministic formatter pass + two minimal lint suppressions/renames; no logic changes)
- **Depends on**: none (blocks every future plan's proof — fix first)
- **Category**: dx
- **Planned at**: commit `29d0bde`, 2026-08-28
- **Refreshed at**: commit `236600b`, 2026-10-07 (typecheck half completed independently by the Pi-1.0 harness migration, which deleted the offending file; this refresh drops the stale typecheck steps and re-baselines the format half)

## Why this matters

`quality.yml` runs `npm run format:check` ("Lint and format check" step) on
every PR and `main` push, and it is **red**: `biome check ./src ./scripts`
exits 1 with ~48 errors across ~20 sections. The typecheck half of the
original plan self-resolved — `npm run check` (`astro check` strict) is green
(exit 0, 0 errors) because the Pi-1.0 migration deleted
`scripts/omp-discovery-smoke.ts`, the file that held the two errors. Until the
format half lands, every future change (including plans 021–022) cannot prove
a green baseline, and CI stays red for reasons unrelated to anyone's diff.
The fix is mechanical: one deterministic formatter/import-sort pass plus
minimal handling of three `scripts/pi-provider.mjs` lint diagnostics (one is
intentional validation code and gets a suppression comment, not a rewrite).

## Current state

Facts as of `236600b` (re-verified 2026-10-07; do not use the `29d0bde`
numbers — the OMP-era files are gone):

- Deleted since the original plan (confirm absent, do not recreate):
  `scripts/omp-discovery-smoke.ts`, `scripts/lib/omp-rpc.mjs`,
  `scripts/omp-doctor.sh`, the `.omp/` tree, `migrate-pi-to-omp-v2.3.sh`.
  Any step referencing them is obsolete — skip it, do not STOP for it.
- `npm run check` → exit 0: `Result (60 files): 0 errors, 0 warnings, 6 hints`
  (hints are pre-existing `ts(2568)` property warnings in
  `tests/ai-pr.test.mjs` — acceptable, not in scope).
- `npm run format:check` (`biome check ./src ./scripts`, biome 1.9.4) →
  exit 1: `Checked 41 files … Found 48 errors. Found 1 warning.` Flagged: (Biome caps displayed diagnostics — true totals via `--max-diagnostics=200` were 75 pre-fix, 54 post-safe-fix. Line numbers shift after import sorting: always match diagnostics by file+rule+code content, never by line number.)
  ```
  ./src/layouts/Layout.astro format
  ./src/pages/index.astro format
  ./src/pages/work/index.astro format
  ./src/pages/work/elsa-hamrah.astro organizeImports
  ./src/pages/work/isbatab.astro organizeImports
  ./src/pages/work/mobile-khorsandi.astro organizeImports
  ./src/pages/work/php-ielts-house.astro organizeImports
  ./scripts/lib/eval-isolation.mjs organizeImports + format
  ./scripts/pi-extension-compat.mjs organizeImports + format
  ./scripts/validate-project-context.mjs format
  ./scripts/verify-package-integrity.mjs format
  ./scripts/verify-affected.mjs format
  ./scripts/pi-provider.mjs organizeImports
  ./scripts/pi-provider.mjs:40:83 lint/suspicious/noControlCharactersInRegex
  ./scripts/pi-provider.mjs:40:90 lint/suspicious/noControlCharactersInRegex
  ./scripts/pi-provider.mjs:186:7 lint/style/noShadowRestrictedNames
  ./scripts/pi-provider.mjs:244:34 lint/style/useTemplate (FIXABLE)
  ./scripts/pi-provider.mjs:252:5 lint/style/useTemplate (FIXABLE)
  ```
- The `:40` regex is INTENTIONAL validation code, not a bug
  (`scripts/pi-provider.mjs:40`):
  ```js
  if (typeof modelId !== "string" || !modelId.trim() || modelId.length > 256 || /[${'\u0000'}-${'\u001f'}\u007f]/.test(modelId)) {
  ```
  (actual source: `/[\u0000-\u001f\u007f]/` — rejects control characters in
  model IDs). The correct resolution is a `biome-ignore` suppression comment,
  NEVER rewriting the character class.
- `node --test tests/projects.test.mjs` → 10 pass, 0 fail (unchanged).
- Gate wiring: `quality.yml` runs `npm run format:check` directly;
  `bash scripts/verify.sh` runs `pi-doctor --ci` then `npm run ci`
  (`check && build`). `deploy.yml` runs `check` then `build`.
- Repo conventions: Biome `indentStyle: space`, `indentWidth: 2`,
  `lineWidth: 100`, single quotes, `semicolons: asNeeded` (see `biome.json`;
  exemplar formatted file: `src/data/site.ts`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0, 0 errors (already green — confirm, don't fix) |
| Format check | `npm run format:check` | exit 0 when done |
| Safe autofix | `npx biome check --write ./src ./scripts` | exit may be 1 (remaining unsafe lints) |
| Unsafe autofix | `npx biome check --write --unsafe ./src ./scripts` | reviewed diff, then check exits 0 |
| Single-file diagnostics | `npx biome check scripts/pi-provider.mjs` | names rule + location per diagnostic |
| Product tests | `node --test tests/projects.test.mjs` | 10 pass, 0 fail |
| Full suite | `node --test tests/*.test.mjs` | 0 fail |
| Build | `npm run build` | exit 0 |

All commands run from repo root, Node ≥22.19. If the worktree lacks
`node_modules`, install first: `bash scripts/ci-install.sh` (or `npm ci`).

## Scope

**In scope** (the only files you may modify):
- `src/pages/**/*.astro`, `src/layouts/*.astro`, `src/**/*.ts` flagged by biome — formatter/organizeImports-only diffs.
- `scripts/**/*.mjs` flagged by biome — autofix + the prescribed `pi-provider.mjs` handling below.
- Nothing else. This is a whitespace/quotes/import-order/suppression-comment diff.

**Out of scope** (do NOT touch):
- `tests/**`, `docs/**`, `.pi/**`, `.github/**`, `public/**`, `src/content/**`,
  `src/styles/**`, `src/components/**` (unless biome explicitly flags them —
  current diagnostics don't), `astro.config.mjs`, `package.json`, versions.
- `scripts/pi-extension-compat.mjs` IF absent from your worktree (it is
  untracked at `236600b`; a fresh worktree won't contain it — its formatting
  is the owner's job in the main tree; say so in your report).
- No visual, routing, content, logic, or dependency changes; no new tests.

## Git workflow

This repository enforces owner-controlled Git (`docs/GIT_POLICY.md`,
`AGENTS.md`). Executors never branch/commit/push — leave a verified
working-tree diff for the owner. (If your dispatcher gave you a different
commit instruction, the plan's rule here wins: DO NOT commit.)

## Steps

### Step 1: Reproduce the baseline and confirm the drift check

Run:
```bash
git diff --stat 236600b..HEAD -- scripts/ src/ package.json biome.json tsconfig.json
npm run check 2>&1 | tail -n 6
npm run format:check 2>&1 | tail -n 6
```

Expected now:
- drift diff: empty (or only your own fixes once you start).
- `npm run check`: `0 errors`, exit `0` (typecheck already green — if it is
  RED with new errors, STOP: something regressed since the refresh).
- `npm run format:check`: `Found 48 errors` (give or take a few if sibling
  plans landed), exit `1`.

**Verify**: check exits 0; format:check exits 1 with diagnostics matching the
"Current state" list. If format:check already exits 0, the baseline is fixed —
STOP and report (someone landed it first).

### Step 2: Safe autofix pass

```bash
npx biome check --write ./src ./scripts 2>&1 | tail -n 10
git diff --stat
npm run format:check 2>&1 | tail -n 6
```

- `--write` applies safe fixes only (formatter, organizeImports). Expect a
  diff of ~10–15 files, all whitespace/quotes/import-order.
- Read the hunks: `git diff -- src/ | head -n 150`. Every hunk must be
  formatting-only. If any hunk changes logic, strings, or behavior, revert
  that file (`git checkout -- <file>`) and report it.

**Verify**: error count dropped (expect ~5–8 remaining, all in
`scripts/pi-provider.mjs`); diff is formatting-only.

### Step 3: Remaining lint diagnostics

First the auto-fixable ones:
```bash
npx biome check --write --unsafe ./src ./scripts 2>&1 | tail -n 10
git diff --stat
```
This converts the `useTemplate` concatenations (and any other unsafe-fixable
diagnostics) to template literals. Re-read every `--unsafe` hunk:
concatenation → template literal is semantically equivalent; anything else,
revert and report.

List-first safety rule: before running `--write --unsafe`, dump the FULL remaining list (`npx biome check ./src ./scripts --max-diagnostics=200`) and confirm every item is in the covered set {formatter, organizeImports, `useTemplate` concatenation→template, the two prescribed suppressions (pi-provider control-char regex, ai-pr default-last below), the shadow-rename}. Any other rule, or any fix that would change logic → STOP and report it verbatim instead of running `--unsafe`.

Then handle `scripts/ai-pr.mjs` `useDefaultParameterLast` (found during execution at `ai-pr.mjs:218`: `function api(endpoint, method = 'GET', payload)` — callers rely on the default via single-arg calls, so removing it would break behavior): add directly above that function line exactly:
```js
// biome-ignore lint/style/useDefaultParameterLast: intentional — api(path) defaults to GET; moving the default would break all existing callers
```
Verify the function signature matches before adding (match by content — line numbers drift).

Then the two manual diagnostics in `scripts/pi-provider.mjs` (view exact
context with `npx biome check scripts/pi-provider.mjs`):
1. `:40 noControlCharactersInRegex` (×2, same regex): add directly above
   line 40 exactly:
   ```js
   // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional — rejects control characters in model IDs
   ```
   Do NOT touch the regex itself.
2. `:186 noShadowRestrictedNames`: rename the shadowing LOCAL variable to a
   clear non-shadowing name (e.g. a local named `escape` → `esc`), updating
   all uses within that function only. Then run the full suite (Step 4) as
   the semantic proof the rename was safe.

**Verify**: `npm run format:check; echo $?` → `0`. If ANY diagnostic remains
that is not covered above (different file, different rule, or a fix that
would change logic), STOP and report it verbatim instead of improvising.

### Step 4: Full gate

```bash
npm run check; echo "check:$?"
npm run build 2>&1 | tail -n 5; echo "build:$?"
node --test tests/*.test.mjs 2>&1 | grep -E "^ℹ (tests|pass|fail)"; echo "tests:$?"
git status --short; echo "scope:$?"
```

Expected: `check:0`, `build:0`, `0 fail`, and `git status` shows modifications
ONLY in `src/` + `scripts/` (plus your reviewer's index file if you were told
to update it — otherwise nothing else).

**Verify**: all four. (`bash scripts/verify.sh` additionally runs
`pi-doctor --ci`; if THAT fails on environment (not code), report it as an
environment note — out of scope, do not fix harness internals.)

## Test plan

No new tests (`No new test` is correct for a formatting baseline):
- `tests/projects.test.mjs` → 10 pass, 0 fail (unchanged oracle).
- Full `node --test tests/*.test.mjs` → 0 fail (semantic proof for the Step-3 rename).
- `npm run check` 0 errors + `npm run build` exit 0 (nothing broke).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check` exits `0` with `0 errors`
- [ ] `npm run format:check` exits `0` (no `Some errors`)
- [ ] `npx biome ci ./src ./scripts` exits `0` (strict double-check)
- [ ] `npm run build` exits `0`
- [ ] `node --test tests/*.test.mjs` → 0 fail
- [ ] The `:40` regex source is byte-identical apart from the added suppression comment (`git diff scripts/pi-provider.mjs` shows no character-class change)
- [ ] `git status --short` shows modifications only under `src/` and `scripts/`
- [ ] `plans/README.md` status row for `020` updated to `DONE` (unless reviewer maintains the index)

## STOP conditions

Stop and report back (do not improvise) if:

- `npm run check` is red (the green half regressed — new finding, not this plan).
- `format:check` already exits 0 before you change anything (already landed).
- `--write` or `--unsafe` touches files outside `src/`/`scripts/`, or any hunk changes logic/strings/behavior.
- A remaining diagnostic is not covered in Step 3 (different rule/file) or its fix would change logic.
- `npm run build` fails after formatting (formatter must never break builds — report the file, revert the pass).
- The `pi-provider.mjs:186` diagnostic, on inspection, implicates control flow rather than a simple shadowed name.

## Maintenance notes

- Diff should be biome-mechanical + one suppression comment + one local
  rename. If review shows any `src/components/`, `src/content/`, or logic
  change, it is out of scope — reject it.
- After this lands, `quality.yml`'s format gate actually bites (it always
  ran; the red baseline made the block invisible). New `src/pages/*.astro`
  files must be formatted before commit.
- Untracked-at-`236600b` `scripts/pi-extension-compat.mjs` is NOT fixable
  from a HEAD-based worktree — the owner must run
  `npx biome check --write scripts/pi-extension-compat.mjs` in the main tree.
- Plan 022 edits `src/pages/index.astro` after this plan: land 020 first,
  then 022 (022 re-checks biome on its own files at the end, so order is safe).
- Follow-up deferred (unchanged): `biome` 1.9.4 → 2.x, `astro`/`typescript`
  bumps — see plan 021 for the security-driven subset.

# Plan 020: Restore green baseline — format and typecheck gates currently red

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 29d0bde..HEAD -- scripts/ src/ package.json biome.json tsconfig.json`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (blocks every future plan — fix first)
- **Category**: dx / tests
- **Planned at**: commit `29d0bde`, 2026-08-28

## Why this matters

The repository's two canonical gates are **currently red** on `main`, so no
future change can be proven green:

- `npm run check` (`astro check` strict) reports `2 errors` and exits `1`
  because `scripts/omp-discovery-smoke.ts` uses `Bun.YAML.parse` and
  `import.meta.dir` which `tsc` does not know.
- `npm run format:check` (`biome check ./src ./scripts`) reports `54 errors +
  1 warning` across `42 files` and exits `1` — `src/pages/*.astro` import order
  plus `scripts/**/*.mjs` formatting/lint drift since plan 018's baseline.

`npm run build` still succeeds, but `npm run ci` (`check && build`) and
`bash scripts/verify.sh` (which runs the same gates) fail, so `quality.yml`
and `deploy.yml`'s `npm run check` gate both block. Every open plan (and any
agent session) will see a red baseline and cannot tell whether its own diff
broke anything. Restoring green is the cheapest unblocker for all other work.
The fix is mechanical: one file's two type errors plus a deterministic
formatter pass — no product logic changes.

## Current state

Files and evidence as of `29d0bde` (`git log --oneline -1` → `29d0bde changes`):

- `package.json` scripts (relevant):
  ```json
  "check": "astro check",
  "ci": "npm run check && npm run build",
  "format:check": "biome check ./src ./scripts"
  ```
  Verification gates: `npm run check` must exit 0 with `0 errors`; `npm run
  format:check` must exit 0; `npm run build` (`node scripts/generate-og.mjs &&
  astro build`) must exit 0; `bash scripts/verify.sh` wraps them.

- `tsconfig.json` (strict, no `exclude`):
  ```json
  { "extends": "astro/tsconfigs/strict",
    "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true } }
  ```
  Therefore `astro check` typechecks `scripts/*.ts` too (57 files) — not only `src/`.

- `scripts/omp-discovery-smoke.ts:8` and `:19` — the two errors `npm run check` reports:
  ```ts
  const cwd = path.resolve(import.meta.dir, "..");
  //                                   ~~~  error ts(2339): Property 'dir' does not exist on type 'ImportMeta'.
  const parsed = Bun.YAML.parse(text);
  //             ~~~  error ts(2867): Cannot find name 'Bun'.
  ```
  Full `npm run check` tail at `29d0bde`:
  ```
  scripts/omp-discovery-smoke.ts:19:18 - error ts(2867): Cannot find name 'Bun'...
  scripts/omp-discovery-smoke.ts:8:38 - error ts(2339): Property 'dir' does not exist...
  Result (57 files):
  - 2 errors
  - 0 warnings
  - 5 hints
  ```
  Exit observed: `1` (correct — gate is working, code is red).

- `biome.json` (1.9.4, formatter + linter + organizeImports enabled):
  ```json
  { "organizeImports": { "enabled": true },
    "formatter": { "enabled": true, "indentStyle": "space", "indentWidth": 2 },
    "linter": { "enabled": true } }
  ```
  `npm run format:check` at `29d0bde` reports (excerpt):
  ```
  ./scripts/lib/eval-isolation.mjs organizeImports — Import statements could be sorted
  ./scripts/lib/eval-isolation.mjs format — Formatter would have printed...
  ./scripts/lib/omp-rpc.mjs:62:18 lint/style/useTemplate — Template literals are preferred...
  ./src/pages/work/php-ielts-house.astro organizeImports — Import statements could be sorted
  ./src/pages/index.astro format — Formatter would have printed...
  Checked 42 files in ~95ms. No fixes applied.
  Found 54 errors.
  Found 1 warning.
  × Some errors were emitted while running checks.
  ```
  Exit observed: `1`. `npx biome ci ./src ./scripts` also exits `1` with same
  diagnostics (27 in strict `ci` mode, 54 in `check` mode — same root causes).

- `src/pages/work/*.astro` (elsa-hamrah, isbatab, mobile-khorsandi, php-ielts-house) each
  have unsorted imports and formatting drift — all under `biome check ./src ./scripts`.
  Example from `src/pages/work/php-ielts-house.astro:1`:
  ```astro
  ---
  import { getCollection } from 'astro:content' // should be sorted with other imports
  import Layout from '../../layouts/Layout.astro'
  // biome wants organizeImports order fixed
  ```

- `scripts/lib/eval-isolation.mjs:1-2` — import order inverted:
  ```js
  import path from "node:path";
  import crypto from "node:crypto";
  // biome wants crypto before path (alphabetical)
  ```

- Unrelated working-tree dirt at plan time (do NOT touch in this plan):
  - `docs/ARCHITECTURE.md`, `docs/PRODUCT.md`, `docs/PLAN.md`, `docs/QUALITY.md`
    modified in working tree (bootstrap doc fill — will be committed separately).
  - `.omp/verification.json` modified, `migrate-pi-to-omp-v2.3.sh` deleted,
    `tests/*.test.mjs` touched — harness churn, out of scope.
  The drift check deliberately scopes to `scripts/ src/ package.json biome.json
  tsconfig.json` so those doc/harness changes do not trigger a STOP.

Repo conventions to follow (pointer to exemplar):

- Formatting: Biome with `indentStyle: space`, `indentWidth: 2`, `lineWidth: 100`,
  `quoteStyle: single`, `semicolons: asNeeded`. See `biome.json` and any
  already-formatted file e.g. `src/data/site.ts` (single quotes, no semicolons
  where ASI allows, 2-space indent).
- TypeScript strict (`astro/tsconfigs/strict`, `noUncheckedIndexedAccess`). Fix
  types, do not add `// @ts-ignore` unless the harness file truly needs a
  runtime-specific global.
- Verification: `npm run check` must end `Result … 0 errors / 0 warnings / 0 hints`
  or at least `0 errors` with `minimumFailingSeverity: error` (default). `npm run
  format:check` must exit 0. `npm run build` must complete `12 page(s) built`
  and `node --test tests/projects.test.mjs` must pass 10 tests.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck (product + scripts) | `npm run check` | exit 0, `Result … 0 errors` (warnings/hints 0 is ideal) |
| Format/lint check | `npm run format:check` | exit 0, `Checked 42 files …` with `0 errors` |
| Strict CI variant (optional double-check) | `npx biome ci ./src ./scripts` | exit 0 |
| Build | `npm run build` | exit 0, `12 page(s) built`, `og-default.png` written |
| Product tests | `node --test tests/projects.test.mjs` | 10 pass, 0 fail |
| Full local gate | `bash scripts/verify.sh` | exit 0 (runs `omp-doctor --ci` + `ci` fallback) |
| Diff scope | `git diff --stat 29d0bde..HEAD -- scripts/ src/` | only in-scope files you touched |

All commands run from repo root. Node ≥22.19 required (`node --version`).

## Scope

**In scope** (only files you should modify):

- `scripts/omp-discovery-smoke.ts` — fix the two type errors (and any `biome`
  formatting it needs thereafter).
- `scripts/**/*.mjs` and `scripts/**/*.ts` that `biome check` flags — autofix
  via `biome check --write` (safe fixes) and `--write --unsafe` for the
  `useTemplate`/`noParameterAssign` lints if needed.
- `src/pages/**/*.astro` and any `src/**/*.ts` flagged by `biome check` —
  same autofix. This will be a formatter/organizeImports-only diff; do not
  change component logic, styles, or content.
- `src/lib/projects.ts` if biome flags it (currently clean, but include if it
  appears in the diagnostic list).

**Out of scope** (do NOT touch, even though they appear in `git status`):

- `docs/**`, `.omp/verification.json`, `tests/**`, `.github/**`, `public/**`,
  `src/content/**`, `src/styles/**`, `src/components/**` (unless biome
  explicitly flags them — but current diagnostics only mention `src/pages` and
  `scripts`), `migrate-pi-to-omp-v2.3.sh` deletion, `astro.config.mjs`,
  `package.json` scripts themselves.
- Adding dependencies (`@types/bun` etc.) is out of scope unless the chosen fix
  for the `Bun` error requires it — prefer the local fix (see Steps) that needs
  no new dep. Do not bump `astro`/`biome`/`typescript` versions.
- No visual, routing, or content changes; no new tests.

## Git workflow

Owner-controlled repo: **no branches/commits/pushes**. Leave verified
working-tree diffs for the owner to commit. Commit message style in this repo
is conventional-ish with plan prefix — e.g. `fix: restore green baseline
(format + typecheck) [plan 020]` — but you do not commit.

## Steps

### Step 1: Reproduce the red baseline (and confirm drift check)

Run:

```bash
git diff --stat 29d0bde..HEAD -- scripts/ src/ package.json biome.json tsconfig.json
npm run check 2>&1 | tail -n 20
npm run format:check 2>&1 | tail -n 20
```

Expected now:

- `git diff --stat` shows at most your own fixes (empty before you start, or
  only the drift you already introduced). Doc/harness dirt outside `scripts/
  src/` is not shown.
- `npm run check` prints the `2 errors` excerpt above and exits `1`.
- `npm run format:check` prints `Found 54 errors` and exits `1`.

If `npm run check` already shows `0 errors` or `npm run format:check` already
exits `0`, the baseline was already fixed — compare `git log --oneline -5`
against `29d0bde` to see if someone already landed this plan, then follow STOP
conditions.

**Verify**: both commands exit `1` with the diagnostics quoted in Current state.

### Step 2: Fix the two type errors in `scripts/omp-discovery-smoke.ts`

Open `scripts/omp-discovery-smoke.ts` (lines 1–25):

Current (failing):

```ts
const cwd = path.resolve(import.meta.dir, "..");
// ...
const parsed = Bun.YAML.parse(text);
```

Fix without adding dependencies:

- Replace `import.meta.dir` (Bun-specific) with the Node-portable
  `path.dirname(new URL(import.meta.url).pathname)` or `import.meta.dirname`
  where available. The minimal correct fix that keeps `tsc` happy on Node 22
  without `@types/bun` is:

  ```ts
  const cwd = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  ```

  If the file already uses `import.meta.dirname` in other branches (check), use
  that — but ensure `tsc` resolves it (it is not standard `ImportMeta` in
  `tsc` 5.9; the `URL` approach is safest).

- Replace `Bun.YAML.parse(text)` with a Node-available parser. This file is the
  harness's OMP discovery smoke; at runtime it runs under `node`, not `bun`.
  Replace the Bun call with a small YAML fallback already vendored or with a
  `js-yaml` import if present, or guard it:

  ```ts
  // before
  const parsed = Bun.YAML.parse(text);
  // after — use the same YAML loader the harness uses elsewhere (check
  // `scripts/lib/*.mjs` for the existing import pattern; `js-yaml` or
  // `yaml` is already a transitive dependency via astro). Prefer:
  //   import yaml from "js-yaml";  const parsed = yaml.load(text);
  // If no yaml dep is available, guard: const parsed = (globalThis as any).Bun?.YAML?.parse?.(text) ?? yamlFallback(text);
  ```

  **Simplest that passes `tsc` without new deps**: look at how sibling
  `scripts/omp-discovery-smoke.ts` is actually used — it is a smoke helper
  invoked via `node`, and the `Bun` line is inside a try/catch for local dev.
  Replace with:

  ```ts
  // parse YAML without Bun — use the same approach as scripts/lib/workflow-evals.mjs
  import { readFileSync } from "node:fs";
  // at top, add: import yaml from "yaml";  (check package.json for yaml dep; if absent, use a tiny inline parser or JSON fallback)
  ```

  If `yaml` is not in `package.json`, do not add a dep — instead change the line to:

  ```ts
  const parsed = (() => { try { return (globalThis as any).Bun?.YAML?.parse(text); } catch {} return null; })();
  // and handle null downstream (the smoke already handles parse failure)
  ```

  Any change that makes `tsc` see no `Bun` name and no `import.meta.dir`
  property is acceptable — keep the runtime behavior equivalent and keep the
  file's existing error handling.

Apply the edit, then:

```bash
npm run check 2>&1 | tail -n 20
```

Expected after this step alone: `Result … 0 errors` (warnings may remain for
`run-workflow-evals.mjs` hints, but `0 errors` is the gate). If warnings remain
and you want `0 warnings` as well, they are in `tests/` and `scripts/` hints
— not in scope for this step, but `minimumFailingSeverity` is `error` so `0
errors` already makes `npm run check` exit `0`. Confirm exit code:

```bash
npm run check; echo $?
# → 0
```

If still `2 errors`, re-read the file — you missed a `Bun` reference or
`import.meta.dir` occurrence (grep: `grep -rn "Bun\|import\.meta\.dir" scripts/`).

### Step 3: Autofix formatting and import order (safe fixes)

This step should produce a diff that is **only** whitespace, quotes, semicolons,
and import order — no logic changes.

Run:

```bash
npx biome check --write ./src ./scripts 2>&1 | tail -n 30
git diff --stat
npm run format:check 2>&1 | tail -n 20
```

- `biome check --write` applies safe fixes (formatter, organizeImports). It
  should touch `src/pages/*.astro` (import sorting) and
  `scripts/lib/eval-isolation.mjs` etc. (quote style, line breaks).
- `git diff --stat` should now show ~8–12 files in `src/pages/` and `scripts/`
  changed.
- `npm run format:check` will likely still report remaining `lint/style/*`
  errors that are marked `FIXABLE` but `unsafe` (e.g.
  `lint/style/useTemplate` in `scripts/lib/omp-rpc.mjs:62,90,140`,
  `lint/style/noParameterAssign` in `scripts/lib/workflow-evals.mjs:183`,
  `lint/style/useNumberNamespace` at `485`). Those require `--unsafe`.

Expected after safe fixes: `Found ?? errors` count drops (from 54 to ~6–10)
but still exits `1`.

### Step 4: Apply unsafe lint fixes (or manually fix the 6–10 remaining)

Option A — automated (preferred for this purely mechanical lint):

```bash
npx biome check --write --unsafe ./src ./scripts 2>&1 | tail -n 30
npm run format:check 2>&1 | tail -n 20
```

This will convert the `+ "\n…"` concatenations to template literals and fix
`noParameterAssign` / `useNumberNamespace` automatically. Review the diff with:

```bash
git diff -- src/ scripts/ | head -n 200
```

Confirm no logic change beyond lint (string concatenation → template literal is
semantically equivalent; parameter reassignment becomes `let`/local copy).

Option B — if you prefer not to use `--unsafe`, manually edit the flagged
lines (each is one-line). The remaining diagnostics are all in `scripts/` and
are safe to fix by hand:

- `scripts/lib/omp-rpc.mjs:62,90,140` — `+ "\n"` → `` `${…}\n` `` or template literal
- `scripts/lib/workflow-evals.mjs:183` — `event = { ... }` → `const nextEvent = { ... }`
- `scripts/lib/workflow-evals.mjs:485` — `Infinity` → `Number.POSITIVE_INFINITY`
- `scripts/omp-discovery-smoke.ts:64` — same useTemplate

Either option is acceptable. After this step:

```bash
npm run format:check; echo $?
# → 0
npx biome ci ./src ./scripts; echo $?
# → 0
```

If either still exits `1`, re-read its output — it names the remaining file
and rule. Fix that file and re-run.

### Step 5: Full gate — build + product tests

```bash
npm run check; echo "check:$?"
npm run build 2>&1 | tail -n 20; echo "build:$?"
node --test tests/projects.test.mjs 2>&1 | tail -n 20; echo "proj-tests:$?"
bash scripts/verify.sh 2>&1 | tail -n 20; echo "verify:$?"
```

Expected:

- `check:0`, `build:0` with `12 page(s) built`, `proj-tests:0` with `10 pass`,
  `verify:0`.
- `dist/index.html` contains the same content (spot-check: `grep -c "Danial Rashidi" dist/index.html` still >0).

If `bash scripts/verify.sh` fails on `omp-doctor` or `verify-package-integrity`,
that is out of scope — report it but do not fix harness internals in this plan.
The in-scope gates are `check`, `format:check`, `build`, and product tests.

## Test plan

No new tests to write — this plan restores the baseline so existing tests can
pass. Use existing suites as the oracle:

- Existing: `tests/projects.test.mjs` (10 tests: statusLabelFor, hrefFor
  javascript: block, isDraft, kickerFor, cardPropsFor variant, frontmatter
  safety, shared lib usage, work-index count, case-study props derivation,
  export surface). Must stay `10 pass`.
- Existing harness: `bash scripts/verify.sh` must exit `0` (or at least the
  product subset `npm run check && npm run build && npm run format:check` must).
- Structural: after Steps 3–4, `grep -rn "Bun\.YAML\|import\.meta\.dir" scripts/`
  returns `0` matches; `npx biome check ./src ./scripts` returns `0`.

Pattern to follow: `tests/projects.test.mjs` uses `node:test` + inlined helpers
— do not add a framework.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run check` exits `0` and `Result (57 files):` shows `0 errors`
  (warm: `grep -q "0 errors" <(npm run check 2>&1)`).
- [ ] `grep -rn "Bun\.YAML\|import\.meta\.dir" scripts/` returns no matches.
- [ ] `npm run format:check` exits `0` (`Checked 42 files …` with no `Some errors`).
- [ ] `npx biome ci ./src ./scripts` exits `0`.
- [ ] `npm run build` exits `0` and `dist/index.html` and `dist/sitemap-index.xml` exist.
- [ ] `node --test tests/projects.test.mjs` shows `10 pass, 0 fail`.
- [ ] `git diff --stat 29d0bde..HEAD -- scripts/ src/` shows only `scripts/` and
  `src/pages/` (and possibly `src/lib/` if it was flagged) — no `docs/` or
  `.omp/` or `tests/` changes.
- [ ] `plans/README.md` status row for `020` updated to `DONE` (or `IN PROGRESS`
  while working).

## STOP conditions

Stop and report back (do not improvise) if:

- The code at `scripts/omp-discovery-smoke.ts:8` and `:19` does not match the
  excerpts (file was already fixed or rewritten) — compare `git show
  29d0bde:scripts/omp-discovery-smoke.ts` and treat mismatch as drift.
- `npx biome check --write` touches files outside `src/` and `scripts/` (e.g.
  modifies `tests/` or `docs/`) — the plan's `biome check ./src ./scripts`
  scope must not expand.
- After Step 2, `npm run check` still shows `2 errors` but at different
  locations (e.g. new errors in `src/` introduced by a prior formatter pass)
  — report the new locations instead of suppressing with `// @ts-ignore`.
- `npm run build` fails after formatting (e.g. an import-order fix broke an
  Astro frontmatter import) — formatter should never break builds; report the
  failing file and revert the last biome pass.
- You discover `package.json` already has a `yaml` dependency and the `Bun`
  fix should use it — prefer using the existing dep over inventing a fallback,
  but do not add a new dep.
- The working tree has uncommitted changes in `docs/` that conflict with your
  formatter pass (e.g. `git stash` needed) — stash or commit docs separately
  but do not mix doc changes into this formatting diff.

## Maintenance notes

For the human/agent who owns this code after the change lands:

- **What changed**: two hunks in one TS file plus deterministic whitespace/
  import-order across ~10 files. No API, route, or visual change.
- **What to watch in review**: diff should be `biome` mechanical + the two
  TypeScript lines. If the diff shows any `src/components/` or `src/content/`
  logic change, it is out of scope — reject it.
- **Future interaction**: any new `src/pages/*.astro` file must be formatted
  before commit (`npx biome check --write ./src ./scripts` or `npm run
  format:check` in pre-commit). The `quality.yml` gate will now actually block
  unformatted PRs (it always did, but the baseline was red so the block was
  invisible).
- **Follow-up explicitly deferred**: bumping `biome` 1.9.4 → 2.x, `astro`
  7.2.4 → 7.2.8, `typescript` 5.9.2 → 5.9.3/7.x, or adding `@types/bun` for
  harness Bun features — not in this plan. Those are separate dependency
  decisions (see `plans/README.md` backlog).
- **If this plan is skipped**: every subsequent plan will appear to fail its
  `npm run check` / `npm run format:check` done criteria even when its own
  logic is correct. Fix the baseline first.


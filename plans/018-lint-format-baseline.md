# Plan 018: Add aLint/format baseline (Biome) — stop re-litigating style in agent sessions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- package.json package-lock.json .editorconfig biome.json .github/workflows/quality.yml`
> If any lint/format tooling already landed, compare the "Current state" excerpts below against the live files before proceeding; on a STOP condition, report.

## Status

- **Priority**: P2
- **Effort**: S–M
- **Risk**: LOW (initial format commit is noisy — isolate it; see Steps)
- **Depends on**: none (good to land before plans that touch many files, e.g. 012, so the format diff doesn't mix with logic)
- **Category**: dx
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

There is no lint, formatter, or pre-commit hook anywhere in this repo: `find . -name ".eslintrc*" -o -name ".prettierrc*" -o -name "biome.json*" -o -name ".editorconfig"` returns nothing except `.git/hooks/pre-commit.sample`, and `package.json` has no `lint`/`format` scripts. This is an agent-heavy repo where every session re-litigates whitespace/quotes/imports and adding tooling later creates a large noisy diff that must be isolated. A single-config tool gives the cheapest gate between "saved file" and the full `bash scripts/verify.sh` run (currently `astro check` + `build` only) and protects review diffs from style noise.

The goal is a minimal, typed, reproducible baseline — not maximal coverage. One tool, one config, format + lint for `.ts` / `.mjs` (and `.astro` where the tool supports it), a CI `format:check` lane, and an optional local hook. The initial format diff lands in its own commit and is verified by `npm run check`/`build`.

## Current state

- `package.json` as of `dbda97e` — scripts are `dev`, `build`, `preview`, `check`/`typecheck`/`ci` only; `devDependencies` are `astro@7.2.4`, `@astrojs/check@0.9.10`, `@astrojs/sitemap@3.7.3`, `sharp@0.35.3`, `typescript@5.9.2`. No eslint/prettier/biome/husky.

```json
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview --port 4321",
    "check": "astro check",
    "typecheck": "astro check",
    "ci": "npm run check && npm run build"
  },
```

- No `.editorconfig`, no `.biome.json`/`biome.json`, no `.eslintrc*`, no `.prettierrc*`, no `lefthook.yml`/`husky`. `.git/hooks/pre-commit.sample` exists but is sample-only.

- Code style observed (from `src/pages/index.astro`, `src/components/Header.astro`, `src/data/site.ts`): 2-space indent, single quotes in TS/JS, no semicolons in astro frontmatter? Actually TS files use semicolons consistently in `site.ts`; astro `<script>` blocks use semicolons. Double quotes in markup attributes (`class="…"`) is HTML convention. Keep whatever the formatter produces after its first run — don't try to reverse-engineer the current style manually.

- `tsconfig.json` extends `astro/tsconfigs/strict` with `strict: true`, `noUncheckedIndexedAccess: true`. `astro.config.mjs` uses `lightningcss`.

- Verification today: `npm run check` (0 errors), `npm run build`, `bash scripts/verify.sh` (doctor + `npm run ci`). `quality.yml` runs `bash scripts/verify.sh` + `verify-package-integrity.mjs --online` (plan 014 adds a typecheck gate to `deploy.yml`). No lint gate exists.

Repo conventions: `npm ci` via `scripts/ci-install.sh`; owner-controlled Git (no push). `CONTRIBUTING.md` requires `bash scripts/verify.sh` before/after workflow changes.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `bash scripts/ci-install.sh` (i.e. `npm ci`) | exit 0 |
| Typecheck | `npm run check` | exit 0, 0 errors |
| Build | `npm run build` | exit 0 |
| Lint | `npm run lint` (to add) | exit 0 |
| Format check | `npm run format:check` (to add) | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |
| Integrity | `node scripts/verify-package-integrity.mjs --online` | 13 PASS after plan 017, 8 PASS before |

## Suggested executor toolkit

- Use `doc_search_get_library_docs` for Biome if you need a version-accurate config shape — installed source (`node_modules/biome` after install) and `biome --help` are primary, not trained memory.

## Scope

**In scope** (only files you should modify/create):
- `package.json` — add `biome` devDependency + scripts
- `biome.json` (or `biome.jsonc`) — **create** (single config)
- `.editorconfig` — **create** (small, matches Biome — 2-space, LF, final newline)
- `.github/workflows/quality.yml` — add a `Lint` step (or `Format check` step) that runs `npm run format:check` / `npm run lint` before `bash scripts/verify.sh`
- `scripts/verify.sh` — optionally add `run_node_script "lint"` / `format:check` via the existing runner (it already tries `format:check`/`lint`/`typecheck`/`build` if `package.json` script exists — so this may already work without editing `verify.sh`; check before touching it)
- Formatted source files — only via `npx @biomejs/biome format --write ./src ./scripts` (or `biome check --write`) in a **separate** commit; no hand-edits to source for style reasons

**Out of scope** (do NOT touch):
- `src/*` logic changes (no refactoring, no import reordering beyond what the formatter does).
- `.pi/*`, `docs/DESIGN.md`, `astro.config.mjs`, workflow SHA pins (keep existing pins; just add a new step for Biome).
- Adding `eslint + prettier + stylelint` trio — this plan picks **one** tool (Biome) to avoid speculative duplicate framework.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes. The formatter's first run will touch many files — produce it as a **single, isolated diff** that the owner can review as `npx @biomejs/biome check --write` only. Do not mix format changes with any other logic.

Suggested commit separation for the owner's review (you leave working-tree diffs; the owner will commit):
1. `chore(tooling): add Biome lint/format baseline`
2. `style: apply Biome formatting` (auto-generated, no hand edits)

## Steps

### Step 1: Install Biome and add config

Add `@biomejs/biome` as a devDependency at the latest 1.x (check `npm view @biomejs/biome version --registry=https://registry.npmjs.org` for the exact latest; pin exact, not `^`). Example:

```bash
npm i -D --save-exact @biomejs/biome@1.9.4
```

Then create `biome.json` at the repo root — minimal, matches this repo's conventions observed above (2-space indent, single quotes where JS allows, `lineWidth: 100`, `indentStyle: space`). Reference shape (adapt to the installed version's schema — run `npx @biomejs/biome explain --help` or read `node_modules/@biomejs/biome` docs after install):

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": { "noUnusedVariables": "warn" },
      "style": { "useImportType": "warn" }
    }
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "asNeeded" }
  },
  "overrides": [
    {
      "include": ["*.astro"],
      "linter": { "enabled": false },
      "formatter": { "enabled": true }
    }
  ]
}
```

Notes:
- The `*.astro` override disables linting for Astro files (Biome's Astro support may lint imperfectly) but keeps formatting — adjust per the installed version's Astro handling.
- Keep `overrides` minimal; the goal is not to suppress lots of files.
- If the linter flags `noUnusedVariables` on Astro frontmatter imports that Astro tree-shakes, either disable that rule for `src/pages/**` or keep it as warn — don't add suppressions per file.

Create a companion `.editorconfig` (tiny, consistent with Biome — 2-space, LF):

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

**Verify**:
```bash
npx @biomejs/biome --version
cat biome.json | head -20
npm run check   # must still exit 0
```

### Step 2: Add scripts to `package.json`

Add:

```json
  "scripts": {
    "lint": "biome lint ./src ./scripts",
    "format": "biome format ./src ./scripts",
    "format:check": "biome check ./src ./scripts"
  }
```

Keep existing `dev`/`build`/`preview`/`check`/`ci` exactly. The existing `scripts/verify.sh` fallback runner already tries `format:check`/`lint`/`typecheck`/`build` if those scripts exist (see `run_node_script` logic), so once these scripts exist, `bash scripts/verify.sh` will automatically include them without modifying `verify.sh` — confirm by reading `scripts/verify.sh` lines 25–45 before editing it. Only patch `verify.sh` if its runner does not pick up `lint`/`format:check`.

**Verify**:
```bash
node -e "const p=require('./package.json'); console.log(Object.keys(p.scripts).join(', '))"
# must include lint, format, format:check
npm run lint 2>&1 | tail -5
# should exit 0 or warn-only; no errors on the untouched codebase (warnings are ok — fix them or downgrade rule)
```

If `biome lint` reports real issues on the current code, either fix the one-liners it points to or lower the rule severity in `biome.json` — never add `// biome-ignore` per file in this baseline pass.

### Step 3: Add a CI gate (quality workflow)

In `.github/workflows/quality.yml`, add a step before `Validate template` (so a style regression fails fast and cheap):

```yaml
      - name: Lint and format check
        run: npm run format:check
```

Keep SHA pins, `node-version: 22.23.2`, and the existing `verify-package-integrity.mjs --online` step. The step name is `Lint and format check`; the command is `npm run format:check` which runs `biome check` (format + lint + organize imports check without writing). Alternatively split into `npm run lint && npm run format:check` — either is fine; pick one and keep it.

**Verify**:
```bash
grep -n "format:check" .github/workflows/quality.yml  # 1 match, before Validate template
```

### Step 4: Produce the initial format diff — isolated, no hand edits

Run the formatter's write mode **once** over the product and harness script sources (not over vendored or generated dirs):

```bash
npx @biomejs/biome check --write ./src ./scripts
# or: npx @biomejs/biome format --write ./src ./scripts
```

Review the diff:

```bash
git diff --stat
git diff --name-only | head -20
```

Expected: many files touched but only whitespace/quotes/import-order changes. **Isolate it**: the working tree after this step should show only formatting diffs. Do not mix this with logic changes from other plans.

**Verify**:
```bash
npm run check && npm run build && npm run format:check
bash scripts/verify.sh
```
All exit 0.

### Step 5: Integrity update (if plan 017 landed)

If `.pi/package-integrity.json` now has 13 entries (plan 017 extend path), the new `biome` devDependency must also be added there:

```bash
npm view @biomejs/biome@<exact> dist.integrity license --json --registry=https://registry.npmjs.org
# then add to .pi/package-integrity.json with repository https://github.com/biomejs/biome and bump reviewedAt
node scripts/verify-package-integrity.mjs --online
# must PASS including the new biome entry
```

If plan 017 docs-only path was taken, or the ledger is still at 8 entries, skip this — but then note in the plan comment that `biome` integrity is currently covered only by `package-lock.json` hashes + Dependabot until the ledger is extended.

## Test plan

- `npm run lint` → no errors (warnings acceptable per config).
- `npm run format:check` → exits 0 (after the write pass).
- `npm run check` + `npm run build` still exit 0.
- `bash scripts/verify.sh` still exits 0 (now includes the lint/format gate).

No product unit tests needed.

## Done criteria

ALL must hold:

- [ ] `@biomejs/biome` is in `package.json` `devDependencies` with an exact pin
- [ ] `biome.json` exists with `$schema`, formatter (2-space, 100 width), linter `recommended`, and an astro-aware override
- [ ] `.editorconfig` exists
- [ ] `package.json` scripts include `lint`, `format`, `format:check`
- [ ] `.github/workflows/quality.yml` has a `Lint and format check` step before `Validate template`
- [ ] `npx @biomejs/biome check --write ./src ./scripts` produces a clean working tree diff that is **isolated** (only style changes) and `npm run format:check` then exits 0
- [ ] `node scripts/verify-package-integrity.mjs --online` still passes (13 PASS if plan 017 + biome, else honest UNPROVEN offline)
- [ ] `npm run check` and `bash scripts/verify.sh` exit 0
- [ ] No files outside the in-scope list modified except the formatter's style diff (`src/` + `scripts/` formatting) and `plans/README.md`
- [ ] `plans/README.md` status row updated (note the two-commit separation for reviewer)

## STOP conditions

Stop and report back (do not improvise) if:

- `biome.json` schema has changed in the installed version and the config shape above fails validation (`npx @biomejs/biome check` errors on config parse) — report the version + error and adjust the `$schema`.
- Biome's Astro support in the installed version corrupts `.astro` files (verify by diffing one astro file before/after — if markup is mangled, disable formatter for `*.astro` entirely).
- The initial format diff touches more than style (e.g. linter auto-fixes a real correctness issue like removing an unused import that was actually used) — report and fix that case per file before proceeding.
- `npm ci` after pinning biome fails due to peer conflicts with `astro@7.2.4`'s typescript peer — report the error log.

## Maintenance notes

- After this lands, every agent session should run `npm run format:check` cheaply before `bash scripts/verify.sh` — it's 1–2s vs 15–20s.
- The CI gate `npm run format:check` is `biome check` (check without write). Don't change it to `--write` in CI.
- A local pre-commit hook via `husky` or `lefthook` is intentionally not added here to keep the baseline minimal. If a follow-up wants one, add it as a tiny plan that just runs `biome check --staged` (or `npx biome check --files-changed`).
- Reviewer scrutiny: verify the format diff is truly style-only by scanning `git diff -w --stat` (whitespace-ignored) — it should show only import-order or no changes. Any non-whitespace hunk must be explained.

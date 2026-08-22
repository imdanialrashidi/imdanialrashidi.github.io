# Plan 014: Gate the deploy workflow on checks — don't ship broken types

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- .github/workflows/deploy.yml .github/workflows/quality.yml`
> If either workflow changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: dx / reliability
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

The two workflows run independently on `push: main`:

- `quality.yml` runs `bash scripts/verify.sh` → `pi-doctor.sh --ci` → `npm run ci` (`check && build`) → `verify-package-integrity.mjs --online`. This is the only place types and harness tests are enforced.
- `deploy.yml` runs `bash scripts/ci-install.sh` → **`npm run build` only** → upload `dist/` → deploy to Pages.

`astro build` is not a typecheck — the `check` script (`astro check`) is separate. A commit that fails `astro check` (bad types, broken content schema, bad import) still builds in some cases and will be deployed while `quality` is red on `main` as advisory. The production URL can serve stale or broken output before anyone notices. One extra step makes deploys honest: don't deploy unless checks passed.

## Current state

- `.github/workflows/deploy.yml` as of `dbda97e` (verbatim — 7 steps after checkout):

```yaml
      - name: Install dependencies
        run: bash scripts/ci-install.sh

      - name: Build site
        run: npm run build
```

Followed directly by `Configure Pages → Upload artifact (path: dist) → Deploy to GitHub Pages`. No `astro check`, no `verify.sh`, no dependency on the quality workflow.

- `.github/workflows/quality.yml` as of `dbda97e` (verify + integrity):

```yaml
      - name: Validate template
        run: bash scripts/verify.sh

      - name: Verify pinned packages against npm
        run: node scripts/verify-package-integrity.mjs --online
```

Both workflows are SHA-pinned, `contents: read`, `node-version: 22.23.2`. `deploy.yml` has `concurrency: group: pages / cancel-in-progress: false` (correct for Pages). `quality.yml` has its own concurrency group. Neither workflow references the other.

- `package.json` scripts relevant:

```json
  "scripts": {
    "check": "astro check",
    "build": "astro build",
    "ci": "npm run check && npm run build"
  }
```

`scripts/ci-install.sh` is `npm ci` with Node version guard. `scripts/verify.sh` already composes `pi-doctor.sh --ci` + `npm run ci`.

- Verified on this commit: `npm run check` = 0 errors, `npm audit --registry=https://registry.npmjs.org` = 0 vulns. The issue is not current failures but the *gate* — a future bad commit on `main` would ship.

Repo policy: quality budgets are in `docs/DESIGN.md` and the active exec-plan; no Lighthouse/extra CI job is added here — only the existing checks.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0 |
| Build | `npm run build` | exit 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |
| YAML lint (optional) | `node --check .github/workflows/deploy.yml` is not meaningful — use `yamllint` if available, else visual review | — |

Manual check for workflow syntax: push to a feature branch and inspect the Actions run (owner-controlled — no push in this plan; the executor only edits the workflow file and verifies locally).

## Scope

**In scope** (only files you should modify):
- `.github/workflows/deploy.yml` — add the gate

**Out of scope** (do NOT touch):
- `.github/workflows/quality.yml` — no change (you may read it for context, but don't add a `workflow_run` dependency there; the fix is simplest as a pre-build step in `deploy.yml`).
- Any workflow pin versions, concurrency groups, permissions, or environment names — keep them exactly as-is.
- `package.json`, `scripts/*`, `src/*`, `docs/*`.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

### Step 1: Add a typecheck gate before the build in `deploy.yml`

In `.github/workflows/deploy.yml`, insert a new step between `Install dependencies` and `Build site`:

```yaml
      - name: Typecheck
        run: npm run check

      - name: Build site
        run: npm run build
```

This is the minimal, least-risk gate: same `npm run check` that local and `quality.yml` via `verify.sh` run. Do not replace `npm run build` — keep it as the next step (so logs show check passed, then build).

Alternative considered and rejected for this plan: making `deploy.yml` depend on the `quality` workflow via `workflow_run: workflows: [quality]`. That is more coupled, requires branch protection or workflow dependency wiring, and would delay deploys on quality flakiness (e.g. `verify-package-integrity --online` network hiccups). A direct `npm run check` is faster, offline-safe, and covers the critical typecheck lane. Leave the `workflow_run` approach as a documented future option in the maintenance notes — don't implement it here.

**Verify**:
```bash
grep -A2 "Name: Typecheck" .github/workflows/deploy.yml  # not case-sensitive; check:
grep -n "npm run check" .github/workflows/deploy.yml       # 1 match, before npm run build
grep -n "npm run build" .github/workflows/deploy.yml       # still 1 match (the build site step)
# order check:
grep -n "Install dependencies\|Typecheck\|Build site" .github/workflows/deploy.yml
# lines must be in install < typecheck < build order
npm run check
```
`npm run check` exits 0.

### Step 2: Confirm the gate doesn't break the Pages contract

Visual review of the full `deploy.yml` after edit must still satisfy Pages requirements:

- `permissions: contents: read, pages: write, id-token: write` present
- `concurrency: group: pages / cancel-in-progress: false` untouched
- `actions/configure-pages`, `actions/upload-pages-artifact` (path: dist), `actions/deploy-pages` steps still present *after* the new typecheck+build pair

**Verify**:
```bash
grep -n "pages: write" .github/workflows/deploy.yml       # 1
grep -n "group: pages" .github/workflows/deploy.yml        # 1
grep -n "upload-pages-artifact" .github/workflows/deploy.yml  # 1
grep -n "deploy-pages" .github/workflows/deploy.yml        # 1
npm run build                                              # still exit 0
bash scripts/verify.sh                                     # still exit 0
```

### Step 3: Validate workflow YAML parses

No `yamllint` dependency required. Use basic sanity:

```bash
node -e "import fs from 'fs'; const y=fs.readFileSync('.github/workflows/deploy.yml','utf8'); if(!y.includes('Typecheck')) throw new Error('missing'); console.log('deploy.yml reads ok,', y.split('\n').length,'lines');"
```

If a YAML action linter is installed (`npx --yes yaml-lint` or similar), run it — but don't add a dependency to do so.

## Test plan

No unit tests for workflow YAML. Regression net:

- `npm run check` → 0 errors (the same gate about to be enforced in CI)
- `npm run build` → artifact `dist/` still produced (spot-check `ls dist/index.html`)
- `bash scripts/verify.sh` → 0 (proves the added step is consistent with the existing quality gate)

If a local `act` or Actions runner is available, you may dry-run the workflow; otherwise explicitly report Actions proof as UNPROVEN and rely on the local gates — never fabricate an Actions run URL.

## Done criteria

ALL must hold:

- [ ] `.github/workflows/deploy.yml` contains a step `Typecheck` running `npm run check` immediately before `Build site`
- [ ] Step order is `Install dependencies` → `Typecheck` → `Build site` → `Configure Pages` → `Upload artifact` → `Deploy to GitHub Pages`
- [ ] Permissions, concurrency, and Pages steps are unchanged
- [ ] `npm run check` exits 0, `npm run build` exits 0, `bash scripts/verify.sh` exits 0
- [ ] No files outside `.github/workflows/deploy.yml` modified (`git status --short` shows only that file plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The excerpts don't match the live workflows (e.g. someone already added a typecheck or refactored the job into multiple jobs).
- `npm run check` is no longer the canonical typecheck command (check `package.json` scripts if the `check` script was renamed).
- Adding the step would exceed the job's `timeout-minutes: 10` (it adds ~5–15s — report if you observe CI needing more than a minute extra locally).
- You discover branch protection or environment approvals that already gate deploys on `quality` — report the counter-evidence instead of adding a redundant gate.

## Maintenance notes

- If a future plan adds a lint or Lighthouse-CI gate to `quality.yml`, consider whether `deploy.yml` should also gate on that. The principle: every gate that would make you block a deploy belongs before the `Upload artifact` step; optional quality signals stay in `quality.yml` only.
- The heavier alternative — `on: workflow_run: workflows: [quality] / types: completed / if: success` — couples the two workflows and requires `quality` to have historically run on the default branch. Keep the inline `Typecheck` even if `workflow_run` is added later; the redundancy is intentional and offline-safe.
- Reviewer scrutiny: verify the YAML indentation matches the existing steps (two spaces under `steps:`) and that the SHA pins on adjacent steps were not disturbed.

# Plan 001: CI installs project dependencies before verification

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Most product files in this repo are currently
> **untracked** (`git status` shows `?? src/`, `?? package.json`, …), so a
> plain `git diff` will not reveal drift. Instead, compare the "Current state"
> excerpts below directly against the working tree before proceeding; on any
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug (CI correctness)
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

The repo's only GitHub Actions workflow (`.github/workflows/quality.yml`) runs
`bash scripts/verify.sh` on every push/PR, but **never installs dependencies**.
`verify.sh` finds the `ci` script in `package.json` and runs `npm run ci`,
which is `astro check && astro build`. Without `node_modules`, that fails with
"astro: not found". Today CI is green only by accident: the site source is not
committed yet (see `plans/003`). The moment `package.json` + `src/` land in
git, every push to `main` goes red. The repo already ships an unused install
helper, `scripts/ci-install.sh`, written for exactly this purpose.

Fixing this first means every later plan gets real CI evidence instead of
local-only proof.

## Current state

- `.github/workflows/quality.yml` — the only workflow; job `workflow-doctor`.
  Relevant steps (lines 22–35):

```yaml
      - name: Checkout
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: Set up Node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22.23.2

      - name: Validate template
        run: bash scripts/verify.sh

      - name: Verify pinned packages against npm
        run: node scripts/verify-package-integrity.mjs --online
```

  Note there is no install step of any kind between checkout and verify.

- `scripts/ci-install.sh` — exists, correct, unused. It installs from
  `package-lock.json` via `npm ci` when present (this repo has
  `package-lock.json` in the working tree).

- `scripts/verify.sh` lines ~20–31 — after running `scripts/pi-doctor.sh
  --ci`, it detects the `ci` script and runs the package manager:

```bash
if [[ -f package.json ]]; then
  if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.ci ? 0 : 1)" >/dev/null 2>&1; then
    ran=1
    ...
    else npm run ci
    fi
```

- `package.json` scripts (verbatim): `"check": "astro check"`,
  `"ci": "npm run check && npm run build"`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install deps | `bash scripts/ci-install.sh` | exit 0; creates `node_modules` |
| Full gate | `bash scripts/verify.sh` | exit 0; ends with successful `astro build` output |
| Typecheck | `npm run check` | exit 0, 0 errors |
| Build | `npm run build` | exit 0; writes `dist/` |

All four were executed successfully during recon on 2026-08-21.

## Scope

**In scope** (the only files you should modify):
- `.github/workflows/quality.yml`

**Out of scope** (do NOT touch):
- Any file under `src/`, `public/`, `docs/` — no product changes belong here.
- `scripts/verify.sh` and `scripts/pi-doctor.sh` — they work as designed.
- Creating a deploy workflow — that is `plans/002`, separate concern.
- Any git commit/push — this repo is owner-controlled; leave a verified
  working-tree diff (see Git workflow below).

## Git workflow

This repository enforces **owner-controlled Git**: do NOT create branches,
stage, commit, or push. Make the edit in the working tree, run verification,
and report. The owner reviews and commits.

## Steps

### Step 1: Add dependency installation to the workflow

In `.github/workflows/quality.yml`, add an install step **after** "Set up
Node" and **before** "Validate template", matching the existing style:

```yaml
      - name: Install dependencies
        run: bash scripts/ci-install.sh
```

### Step 2: Enable npm caching on setup-node — only if the lockfile is tracked

Run:

```bash
git ls-files --error-unmatch package-lock.json >/dev/null 2>&1 && echo TRACKED || echo UNTRACKED
```

- If `TRACKED`: extend the "Set up Node" step with caching:

```yaml
      - name: Set up Node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22.23.2
          cache: npm
```

- If `UNTRACKED` (expected today, since `package.json`/`package-lock.json`
  are untracked until the owner's first product commit): **skip this step**
  entirely. `cache: npm` fails CI when no lockfile is committed. Leave a note
  in your report: "enable setup-node cache once package-lock.json is
  committed".

**Verify**: `grep -n "Install dependencies" .github/workflows/quality.yml` →
one match, positioned between the "Set up Node" block and the "Validate
template" step.

### Step 3: Prove the exact CI sequence locally

Run the same commands CI will run, in order:

```bash
bash scripts/pi-doctor.sh --ci
bash scripts/ci-install.sh
bash scripts/verify.sh
```

**Verify**: all three exit 0. `bash scripts/verify.sh` must complete without
"astro: not found" and finish the `astro build` phase (you will see its
output listing built routes).

### Step 4: YAML sanity check

```bash
python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/quality.yml')); print('yaml ok')"
```

**Verify**: prints `yaml ok`. If PyYAML is unavailable, fall back to careful
visual inspection and say so explicitly in your report (do not claim the
check ran if it didn't).

## Test plan

No new automated tests — this is a workflow-only change whose proof is Step 3
(replaying CI locally) plus the first green run after the owner pushes. The
existing harness tests (`node --test tests/*.test.mjs`, invoked inside
`pi-doctor.sh --ci`) remain the regression net for everything else.

## Done criteria

ALL must hold:

- [ ] `.github/workflows/quality.yml` contains an install step calling
      `bash scripts/ci-install.sh` positioned before "Validate template"
- [ ] `bash scripts/pi-doctor.sh --ci` exits 0
- [ ] `bash scripts/ci-install.sh` exits 0
- [ ] `bash scripts/verify.sh` exits 0 (includes astro check + astro build)
- [ ] No files outside `.github/workflows/quality.yml` modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The workflow file or `verify.sh` no longer matches the "Current state"
  excerpts (drift).
- `bash scripts/ci-install.sh` fails locally after a reasonable retry — e.g.
  registry unreachable. Report the exact error; do not switch package
  managers or edit the lockfile.
- You find yourself needing to modify anything under `src/` or `scripts/`.

## Maintenance notes

- Once the owner makes the first product commit (see `plans/003`), re-check
  whether `package-lock.json` is tracked and enable the `cache: npm` setting
  from Step 2 if it was skipped.
- If dependencies are ever added beyond `npm` (pnpm/yarn lockfiles),
  `scripts/ci-install.sh` already handles them; nothing here needs changing.
- Reviewer scrutiny: confirm the install step cannot be skipped for the
  "Verify pinned packages" step — that step intentionally stays independent
  (it audits `.pi/package-integrity.json` against the registry, not
  `node_modules`).

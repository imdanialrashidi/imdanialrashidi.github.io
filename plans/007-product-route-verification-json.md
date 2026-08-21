# Plan 007: Add a product-site route to `.pi/verification.json`

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Compare the "Current state" excerpts below
> directly against the working tree (the file is tracked, so also run
> `git diff 944f128..HEAD -- .pi/verification.json scripts/verify-affected.mjs`
> if HEAD has moved); on any mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (assumes `npm run ci` works locally, i.e. deps installed)
- **Category**: dx (verification routing)
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

The repo's verification router (`scripts/verify-affected.mjs`, driven by
`.pi/verification.json`) maps changed files to the cheapest sufficient check.
Its routes today cover **only harness files** (`scripts/**`, `tests/**`,
`.pi/**`, docs). A change to any site file — `src/pages/index.astro`,
`src/data/site.ts`, a component — matches no route and triggers the
conservative fallback: the full gate `bash scripts/verify.sh` (doctor +
harness tests + astro check + astro build) for a one-line CSS tweak.

The owner's active plan (Slice 1: "add `.pi/verification.json` product
route") already called for this. Adding an explicit product route makes
site-only changes verify with `npm run ci` (astro check + build ≈ seconds)
instead of the full gate, while keeping the fallback for genuinely unknown
paths.

## Current state

`.pi/verification.json` (complete structure; five harness routes, then):

```json
{
  "version": 1,
  "routes": [
    { "id": "workflow-evals",    "include": ["scripts/run-workflow-evals.mjs", …], "commands": [["node", "--test", "tests/workflow-evals.test.mjs"], …] },
    { "id": "verification-router", … },
    { "id": "safety-guard",      … },
    { "id": "launcher",          "include": ["p", "scripts/pi-sandbox.sh", "tests/launcher.test.mjs"], … },
    { "id": "workflow-contract",
      "include": ["AGENTS.md", ".mcp.json", ".pi/**", ".github/**", "p", "*.md", "docs/**", "scripts/*.sh", "scripts/verify-package-integrity.mjs", "Dockerfile.pi", ".dockerignore"],
      "commands": [["bash", "scripts/pi-doctor.sh", "--ci", "--static"]] }
  ],
  "fallback": [
    ["bash", "scripts/verify.sh"]
  ]
}
```

Router semantics (from `scripts/verify-affected.mjs`, read in full):
- CLI: `node scripts/verify-affected.mjs --file <path> [--file <path2>…] [--plan]`
  — `--plan` prints the selected plan as JSON instead of running it.
- First matching route wins per file; files matching no route are reported as
  `"unmatchedFiles"` and pull in the `fallback` commands.
- Route schema enforced by `validateVerificationConfig`: `id` (string),
  `include` (glob array), `commands` (array of `[command, ...args]` arrays).
- The verification-routing skill documents usage:
  `.pi/skills/verification-routing/SKILL.md:18,26`.
- `scripts/pi-doctor.sh --ci` asserts the JSON parses (nothing more), and
  `tests/verify-affected.test.mjs` exercises the router against this config.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Plan preview | `node scripts/verify-affected.mjs --file src/pages/index.astro --plan` | JSON naming the new route, no unmatchedFiles |
| Router tests | `node --test tests/verify-affected.test.mjs` | all pass |
| Routed run | `node scripts/verify-affected.mjs --file src/data/site.ts` | runs `npm run ci`, exits 0 |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope**:
- `.pi/verification.json` (add one route object)

**Out of scope** (do NOT touch):
- `scripts/verify-affected.mjs`, `tests/verify-affected.test.mjs` — the
  router works; only configuration changes.
- Any other route's include globs or commands.
- Harness integrity manifests (`.pi/package-integrity.json`) — unrelated.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes.

## Steps

### Step 1: Add the product-site route

Insert a new route object into the `routes` array of
`.pi/verification.json`, after the last existing route
(`workflow-contract`) and before the closing `],`:

```json
    {
      "id": "product-site",
      "include": [
        "src/**",
        "public/**",
        "Assets/**",
        "astro.config.mjs",
        "tsconfig.json",
        "package.json",
        "package-lock.json"
      ],
      "commands": [
        ["npm", "run", "ci"]
      ]
    }
```

Notes:
- `npm run ci` = `astro check && astro build` — the correct minimal proof for
  any site-source change (types + content schema + full static build).
- Do NOT add `package-lock.json`-only entries elsewhere or reorder existing
  routes; append only. Keep 2-space indentation matching the file.

**Verify**:
```bash
node -e "JSON.parse(require('fs').readFileSync('.pi/verification.json','utf8')); console.log('json ok')"
node scripts/verify-affected.mjs --file src/pages/index.astro --plan
```
First prints `json ok`; second prints JSON where `routes[0].id` is
`"product-site"`, `commands[0].command` is `["npm","run","ci"]`, and
`unmatchedFiles` is empty.

### Step 2: Confirm routing precedence didn't shift for harness paths

```bash
node scripts/verify-affected.mjs --file tests/safety-guard.test.mjs --plan
node scripts/verify-affected.mjs --file docs/DESIGN.md --plan
```

Expected: first plan's route id is `safety-guard`; second is
`workflow-contract` (docs still route there — the new globs deliberately do
not overlap `docs/**` or `*.md`).

### Step 3: Run the routed command once for real

```bash
node scripts/verify-affected.mjs --file src/data/site.ts
```

Expected output ends with `Affected verification passed.` (it executes
`npm run ci`). Requires `node_modules` present — run `bash scripts/ci-install.sh`
first if needed.

### Step 4: Regression-check the router and full gate

```bash
node --test tests/verify-affected.test.mjs
bash scripts/pi-doctor.sh --ci
```

Both exit 0.

## Test plan

`tests/verify-affected.test.mjs` validates config + selection logic against
this exact file — it is the regression net. Additionally, Steps 1–3 are the
behavioral proof (route selected, command runs green). No new tests required;
if the test file contains a fixture asserting the *number* of routes, update
that expectation in the same change and say so in your report (check first:
`grep -n "routes" tests/verify-affected.test.mjs`).

## Done criteria

ALL must hold:

- [ ] `.pi/verification.json` parses; contains exactly one new route
      `product-site` with the globs above
- [ ] `--plan` on a src file selects it with empty `unmatchedFiles`
- [ ] `--plan` on a harness/doc file still selects the original routes
- [ ] `node scripts/verify-affected.mjs --file src/data/site.ts` exits 0
- [ ] `node --test tests/verify-affected.test.mjs` passes
- [ ] No other file modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `validateVerificationConfig` rejects the new route (schema drift since
  recon) — report the exact error.
- Existing router tests fail after the addition — do not weaken assertions;
  report the failure.
- You find product routes already added (work done twice — reconcile/report).

## Maintenance notes

- When a real test suite for site behavior exists someday, extend this
  route's `commands` (e.g. prepend `["node", "--test", "tests/site.test.mjs"]`)
  rather than creating a competing route.
- Keep the fallback (`bash scripts/verify.sh`) untouched — it remains the
  safety net for unmatched paths like root-level files.
- Reviewer scrutiny: glob overlap — confirm nothing in the new `include`
  list shadows an existing route's more-specific mapping (checked at plan
  time: none).

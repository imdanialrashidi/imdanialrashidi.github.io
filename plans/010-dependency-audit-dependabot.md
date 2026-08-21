# Plan 010: Establish a dependency-audit baseline and put npm under Dependabot

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Compare the "Current state" excerpts below
> directly against the working tree; on any mismatch, treat it as a STOP
> condition.

## Status

- **Priority**: P3
- **Effort**: S (remediation, if any advisory surfaces, may extend)
- **Risk**: LOW (audit is read-only; Dependabot config is additive)
- **Depends on**: none (more useful after plans/001–002 so CI also sees updates)
- **Category**: security / dx
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

The product dependency surface is small but real: `astro`, `@astrojs/sitemap`,
`@astrojs/check`, `sharp`, `typescript` — all build-time (the site ships
static HTML/CSS + two vendored fonts), so supply-chain risk concentrates in
the build/CI path rather than at runtime. Two gaps:

1. **No audit evidence exists.** During the 2026-08-21 audit, `npm audit`
   could not run because this machine's npm is pointed at a registry mirror
   (`registry.npmmirror.com`) that does not implement the audit endpoint.
   Nobody has therefore ever recorded an advisory scan for this repo.
2. **`.github/dependabot.yml` covers only `github-actions`** — npm packages
   get no automated update PRs at all.

This plan produces a recorded audit baseline against the official registry
and closes the Dependabot gap. It deliberately does NOT auto-bump versions:
any remediation decision is surfaced, sized, and only then applied.

## Current state

- `package.json` devDependencies (complete list):

```json
  "devDependencies": {
    "@astrojs/check": "^0.9.10",
    "@astrojs/sitemap": "^3.7.3",
    "astro": "^7.2.4",
    "sharp": "^0.35.3",
    "typescript": "^5.9.2"
  },
```

  No runtime dependencies. Lockfile: `package-lock.json` present in the
  working tree (untracked until the owner's first product commit).

- `.github/dependabot.yml` (verbatim, complete):

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
    open-pull-requests-limit: 5
```

- Distinct concern, already covered elsewhere: `.pi/package-integrity.json`
  pins the *harness* packages with sha512 records, verified by
  `scripts/verify-package-integrity.mjs --online` in CI. That manifest does
  NOT track product deps — don't conflate them.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Audit (official registry) | `npm audit --registry=https://registry.npmjs.org` | exit 0 = no known vulnerabilities; else a findings table |
| Audit JSON record | `npm audit --registry=https://registry.npmjs.org --json > .artifacts/npm-audit.json` | file written |
| YAML check | `python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml')); print('yaml ok')"` | prints `yaml ok` |
| Full gate | `bash scripts/verify.sh` | exit 0 |

(`.artifacts/` is gitignored — safe scratch space.)

## Scope

**In scope**:
- `.github/dependabot.yml` (add one updates entry)
- `.artifacts/npm-audit.json` (scratch output; not committed)
- Your report (the audit baseline record)

**Out of scope** (do NOT touch):
- `package.json` / `package-lock.json` version bumps — see remediation rule
  below; bumps happen only under the conditions stated, never silently.
- `.pi/package-integrity.json` or any harness pin.
- Registry configuration of the local npm (use the per-command `--registry`
  flag only).

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes (only dependabot.yml should differ).

## Steps

### Step 1: Run the audit baseline

```bash
mkdir -p .artifacts
npm audit --registry=https://registry.npmjs.org --json > .artifacts/npm-audit.json; echo "exit=$?"
node -e "const a=require('./.artifacts/npm-audit.json'); console.log('vulns:', JSON.stringify(a.metadata?.vulnerabilities ?? 'n/a'))"
```

Record in your report:
- The vulnerability counts by severity (`critical/high/moderate/low/info`),
  or "0 across all severities".
- For each finding: package name, severity, whether the advisory path
  reaches `astro`/`sharp`/`@astrojs/*` build tooling (read the `via` chains),
  and the fix version if `fixAvailable` says one exists.

**Verify**: the command executed and produced parseable JSON. If the network
blocks registry.npmjs.org, mark this criterion BLOCKED in your report with
the exact error — do not substitute the mirror's answer, and do not retry
more than twice.

### Step 2: Remediation rule (apply ONLY if triggered)

If and only if the audit shows a **HIGH or CRITICAL** advisory whose `via`
chain reaches `astro`, `sharp`, `@astrojs/sitemap`, or `@astrojs/check`, AND
a non-major fix version exists:

1. Bump only that package: `npm install --save-dev <pkg>@<fixed-version>`
2. Re-run `bash scripts/verify.sh` → must exit 0.
3. Note the bump explicitly in your report.

Anything else — moderate/low advisories, major-version jumps, advisories in
dev-tooling transitive chains that don't reach the four packages above —
goes in your report as a recommendation, **not** a change. A major Astro
upgrade is an owner decision (framework migration risk); STOP and report
instead of attempting it.

### Step 3: Put npm under Dependabot

Append a second entry to `.github/dependabot.yml`, matching existing style:

```yaml
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
    open-pull-request-limit: 5
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: monthly
    open-pull-requests-limit: 5
```

(Keep the original github-actions block byte-identical; add only the npm
block.)

**Verify**:
```bash
python3 -c "import yaml; d=yaml.safe_load(open('.github/dependabot.yml')); print([u['package-ecosystem'] for u in d['updates']])"
```
→ prints `['github-actions', 'npm']`.

### Step 4: Full gate

```bash
bash scripts/verify.sh
```

**Verify**: exit 0 (dependabot.yml isn't consumed locally, but the gate
proves nothing else drifted).

## Test plan

No code changes → no new tests. Evidence artifacts: audit JSON counts in the
report (Step 1), optional remediation proof (Step 2), YAML structure check
(Step 3), full gate (Step 4). Dependabot's own effect is observable only
after push (weekly/monthly PRs) — note that as post-merge verification for
the owner.

## Done criteria

ALL must hold:

- [ ] Audit executed against registry.npmjs.org; severity counts recorded in
      report (or BLOCKED with exact error after ≤2 attempts)
- [ ] Any HIGH/CRITICAL reachable advisory either fixed per Step 2 with full
      gate green, or explicitly escalated to the owner in the report
- [ ] `.github/dependabot.yml` contains both ecosystems; YAML parses
- [ ] No other file modified (unless Step 2 triggered a documented bump)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- The official registry is unreachable from your environment (record BLOCKED;
  the owner can run Step 1 from an unrestricted network).
- The only available fixes are major-version upgrades of `astro` — owner
  decision, not executor territory.
- You discover product dependencies have moved into `dependencies:` (runtime)
  since the audit excerpt — the risk model in this plan assumed dev-only;
  report before proceeding.

## Maintenance notes

- After the owner pushes, Dependabot will open monthly npm update PRs —
  review them like any change: `bash scripts/verify.sh` + browser spot-check
  for anything touching `astro`/`sharp`.
- Re-run Step 1 whenever a dependency is added and at least quarterly; the
  recorded baseline makes drift visible.
- Reviewer scrutiny: if Step 2 fired, the bump diff must touch exactly one
  package in `package-lock.json`/`package.json`.

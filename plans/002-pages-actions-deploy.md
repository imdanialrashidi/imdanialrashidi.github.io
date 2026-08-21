# Plan 002: Deploy the built Astro site to GitHub Pages via Actions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Most product files in this repo are currently
> **untracked** (`git status` shows `?? src/`, `?? package.json`, …). Compare
> the "Current state" excerpts below directly against the working tree; on any
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED (touches deployment topology; one owner-side settings change)
- **Depends on**: plans/001 (CI must be able to build before deploy matters)
- **Category**: direction / reliability (deployment)
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

The site is not actually deployed. The repository is `imdanialrashidi.github.io`
(a GitHub Pages *user* site), but Pages is configured as **legacy "Deploy from
a branch"** (`gh api repos/imdanialrashidi/imdanialrashidi.github.io/pages`
returns `"build_type":"legacy", "source":{"branch":"main","path":"/"}`). The
repo root contains no `index.html` — the built Astro output lives in `dist/`,
which is gitignored. Result: the live URL serves GitHub's Jekyll fallback page
(just an `<h1>Danial Rashidi</h1>` from the 1-byte README), not the site.

The owner's active implementation plan
(`docs/exec-plans/active/premium-personal-brand.md`, §5.6 and Slice 1) already
decided this: build in CI, deploy the `dist/` artifact via official
`actions/deploy-pages`. This plan implements exactly that.

## Current state

- `.github/workflows/` contains only `quality.yml` — there is no deploy
  workflow.
- Pages state (verified 2026-08-21 via read-only API):
  `{"build_type":"legacy","source":{"branch":"main","path":"/"},"status":"built"}`.
- `astro.config.mjs`: `site: "https://imdanialrashidi.github.io"`,
  `base: "/"`, `output: "static"` — so `npm run build` produces `dist/` with
  absolute URLs correct for the user-site root. No CNAME involved.
- `.nojekyll` exists at the **repo root** only. `public/` contains
  `favicon.svg`, `fonts/`, `robots.txt` — no `.nojekyll`. With Actions-based
  deployments GitHub serves the uploaded artifact directly (no Jekyll pass),
  so `_astro/` hashed assets are safe; adding `.nojekyll` inside `public/`
  is belt-and-braces so `dist/.nojekyll` always exists regardless of
  deployment mode.
- Existing action-pinning convention (immutable SHA + tag comment) from
  `quality.yml`:

```yaml
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
```

- Node version used everywhere in CI: `22.23.2`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Install | `bash scripts/ci-install.sh` | exit 0 |
| Build | `npm run build` | exit 0; writes `dist/` |
| Inspect dist | `ls dist` | `index.html`, `sitemap-index.xml`, `_astro/`, `fonts/`, `work/`, … |
| Preview locally | `npm run preview` then `curl -s localhost:4321/\| head` | HTML of home page |

## Suggested executor toolkit

- If a Playwright MCP or browser tool is available, use it after the owner
  flips Pages settings to capture the live URL as final proof. Otherwise mark
  that criterion UNPROVEN — do not fabricate browser evidence.

## Scope

**In scope**:
- `.github/workflows/deploy.yml` (create)
- `public/.nojekyll` (create — empty file)

**Out of scope** (do NOT touch):
- Repo/Pages settings — switching Pages source to Actions is an **owner
  action** (Settings → Pages → Build and deployment → Source: GitHub
  Actions). You cannot and must not attempt it via API.
- `astro.config.mjs`, `src/**`, `docs/exec-plans/**`.
- `quality.yml` (owned by plans/001).

## Git workflow

Owner-controlled repo: no branches, commits, or pushes by the executor.
Leave the two new files in the working tree, verified.

## Steps

### Step 1: Resolve pinned SHAs for the three Pages actions

The repo pins every action by immutable commit SHA. Reuse the exact
checkout/setup-node SHAs shown above. For these three, resolve current SHAs
yourself:

```bash
git ls-remote https://github.com/actions/configure-pages.git refs/tags/v5.* | tail -1
git ls-remote https://github.com/actions/upload-pages-artifact.git refs/tags/v3.* | tail -1
git ls-remote https://github.com/actions/deploy-pages.git refs/tags/v4.* | tail -1
```

Record each `<sha> # vX.Y.Z`. **Verify**: three SHAs printed, all 40-hex. If
network access to github.com fails or the tags have moved major versions,
STOP and report instead of guessing.

### Step 2: Create `.github/workflows/deploy.yml`

```yaml
name: deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1

      - name: Set up Node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 22.23.2

      - name: Install dependencies
        run: bash scripts/ci-install.sh

      - name: Build site
        run: npm run build

      - name: Configure Pages
        uses: actions/configure-pages@<SHA-FROM-STEP-1> # vX.Y.Z

      - name: Upload artifact
        uses: actions/upload-pages-artifact@<SHA-FROM-STEP-1> # vX.Y.Z
        with:
          path: dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@<SHA-FROM-STEP-1> # vX.Y.Z
```

Substitute the resolved SHAs + version comments. Keep `node-version:
22.23.2` identical to `quality.yml`. Do not add `cache: npm` unless
`package-lock.json` is tracked at execution time (same rule as plans/001).

**Verify**:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/deploy.yml')); print('yaml ok')"
grep -c "@<sha>" .github/workflows/deploy.yml   # placeholder check
```
First command prints `yaml ok`; second prints `0` (no unresolved
placeholders remain).

### Step 3: Add `public/.nojekyll`

Create an empty file `public/.nojekyll` (`touch public/.nojekyll`). Astro
copies `public/*` into `dist/`, so every artifact contains it.

**Verify**: `test -f public/.nojekyll && test -f .nojekyll && echo ok` → `ok`

### Step 4: Prove the build produces a complete artifact

```bash
bash scripts/ci-install.sh && npm run build
test -f dist/index.html && test -f dist/sitemap-index.xml && test -f dist/robots.txt && test -f dist/.nojekyll && ls dist/_astro/*.css >/dev/null && echo ARTIFACT_OK
npx astro preview --port 4321 & sleep 3; curl -sf http://localhost:4321/ | grep -o "<title>[^<]*</title>"; kill %1
```

**Verify**: prints `ARTIFACT_OK`, and curl shows the real page title
("Danial Rashidi — Software & Product Builder"). Stop the preview server.

### Step 5: Document the owner handoff (in your report, not a file)

Report must include this exact instruction block for the owner:

1. Commit and push the new files (owner action).
2. In GitHub: Settings → Pages → Build and deployment → Source: **GitHub
   Actions**.
3. Re-run the deploy workflow (Actions → deploy → Run workflow).
4. Verify `https://imdanialrashidi.github.io/` returns HTTP 200 with the real
   title, and `/work/noveno` resolves.
5. Rollback drill: `git revert <deploy-commit>` and re-run the workflow.

## Test plan

No unit tests apply. Proof = Step 4 artifact checks + first green `deploy`
run + live URL check (owner-performed per Step 5). The `environment.url`
output makes the deployed URL visible on the workflow run summary.

## Done criteria

ALL must hold:

- [ ] `.github/workflows/deploy.yml` exists, YAML-parses, has zero
      placeholder SHAs, and pins all five actions by full 40-char SHA
- [ ] `public/.nojekyll` exists alongside root `.nojekyll`
- [ ] `npm run build` succeeds; Step 4's `ARTIFACT_OK` check passes
- [ ] Local preview serves the real home-page title
- [ ] Owner handoff instructions included in report
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- Action SHAs cannot be resolved from github.com (Step 1).
- `npm run build` fails for reasons not covered by plans/001 (e.g. missing
  `package.json` in the working tree — product files are uncommitted; if
  they are absent entirely, STOP).
- You discover Pages settings were already switched to Actions
  (`build_type: workflow`) — then only verify and report; do not duplicate
  configuration.
- Anything suggests a custom domain/CNAME is now in play (canonical URLs in
  `astro.config.mjs` would need updating — separate decision).

## Maintenance notes

- Until the owner flips Settings→Pages→Source, pushes will produce successful
  *builds* but the legacy branch deployment keeps serving the fallback page.
  This is expected; do not "fix" it by committing `dist/`.
- Future custom domain (`imdanialrashidi.com`): add `public/CNAME`, update
  `site:` in `astro.config.mjs`, flip Pages custom-domain setting — its own
  mini-plan; out of scope here.
- Reviewer scrutiny: permissions block (`pages: write`, `id-token: write`) is
  required by deploy-pages and intentionally broader than quality.yml's;
  concurrency group prevents overlapping deploys.

# Plan 016: Refresh stale docs — CHANGELOG, CONTRIBUTING, DESIGN budgets, ARCHITECTURE topology

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- CHANGELOG.md CONTRIBUTING.md docs/DESIGN.md docs/ARCHITECTURE.md docs/TOOLING_SETUP.md README.md`
> If any in-scope doc changed since this plan was written, compare the
> "Current state" excerpts below against the live files before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: ideally after plans 011–015 so CHANGELOG entries describe the final post-product state; can land independently if needed
- **Category**: docs
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

Docs are authority. When they lie, they cause wrong calls:

- `CHANGELOG.md` violates the repo's own change contract (`CONTRIBUTING.md` "update all affected source-of-truth documents, doctor assertions, … and CHANGELOG.md"): its `Unreleased` section ends at harness/pin updates with zero entries for the entire product build (the ~16K-line Astro site, `deploy.yml` via plan 002, `ci-install.sh` via plan 001, README rewrite, gitignore hygiene — all `DONE` per `plans/README.md`), nor for the batch of fixes landing in this series. Reconstructing v1 release notes from the 960-line exec-plan is waste.
- `CONTRIBUTING.md:2` says `Install the reviewed Pi pin from README.md` — but `README.md` has no Pi-pin section (it has Requirements / Quick start / Verification / Site structure / Deployment). A contributor following setup hits a dead end. `docs/TOOLING_SETUP.md` is the real canonical source.
- `docs/DESIGN.md:132` budget line still claims `Images 0 yet (portrait preserved not rendered)` while the portrait is rendered on Home and About via `astro:assets <Image>` (four `Danial_photo.*.webp` variants in `dist/_astro/`). The same paragraph's `CSS 23K total (7+16K)` is the foundation-slice snapshot and doesn't reflect the shipped ~90K CSS observed in the final polish update. `ARCHITECTURE.md` is titled `Foundation Slice`, describes `src/content.config.ts (stub)` and deployment as `either branch-Jekyll-bypass or future Actions deploy-pages` — but the site now has authored collections and a live `actions/deploy-pages` workflow (`deploy.yml` `DONE`). These hedges actively mislead.

## Current state

- `CHANGELOG.md` — `Unreleased` as of `dbda97e` (verbatim head — ends before any product entry):

```md
# Changelog

All notable workflow changes are documented here. This project follows the spirit of Keep a Changelog; versioning begins when the first release is tagged.

## Unreleased

### Added

- Behavioral coverage for autonomous/strict guard modes and launcher trust overrides.
- Product design contract, distinctive frontend-design skill, visual hard gates, and scored craft rubric.
… (12 Added bullets, all harness/template)
### Changed
- Made `./p` trust the checked-out project …
… (ends at `Updated reviewed pins to Pi 0.84.2, pi-mcp-adapter@2.26.1 …`)
```

`grep -i "deploy\|pages\|astro\|site\|ci-install\|og:image" CHANGELOG.md` → no product/deploy matches.

- `CONTRIBUTING.md:1–8`:

```md
## Setup

1. Use Node.js 22.19.0 or newer.
2. Install the reviewed Pi pin from `README.md`.
3. Review project-local packages/extensions before trusting the repository.
```

`README.md` full structure is `Requirements / Quick start / Verification / Site structure / Deployment` — no Pi pin.

- `docs/TOOLING_SETUP.md:1–7` — canonical tooling doc, says: "This repository pins a small production-oriented Pi tool stack … The reviewed Pi pin requires Node.js 22.19.0 or newer. … `pi-sub-agent@0.1.5`, `pi-mcp-adapter@2.26.1` …" and covers `/mcp status`, `/lsp status`, Playwright. This is the correct target for the CONTRIBUTING link.

- `docs/DESIGN.md:130–132` — budgets:

```md
- Performance: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms (targets, not claimed); lab via Lighthouse preview (manual). Budgets: CSS 23K total (7+16K), fonts 139K (preload Sans only), JS 0 external + ~2K inline (theme + nav). No React, no motion lib, no analytics, no backend.
- Pre-release lab and RUM: Lab measured locally via `npm run build` + preview + Lighthouse (not yet CI-enforced); RUM not added at foundation (deferred).
- Image/font/JS budget: Images 0 yet (portrait preserved not rendered), fonts 69+70, JS 2K inline, CSS 23K, total HTML 8 pages ~120K.
```

Portrait is actually rendered via `astro:assets` on Home (`src/pages/index.astro:230`) and About (`src/pages/about.astro:32`) with `widths=[320,480,640]`; `dist/_astro/Danial_photo.*.webp` variants exist (4 files). The `23K` CSS line also predates the shipped ~90K observed in the final exec-plan update.

`docs/DESIGN.md` "Decisions intentionally deferred" table lists `Full homepage storytelling composition` and `Fast English / Noveno case-study long-form layouts (stub "in progress" honest placeholders)` — the homepage *was* delivered with full hero/work/capabilities/principles/about/now/cta composition, so at least one row is stale if read literally; keep the second row but clarify it means "long-form body copy depth" not layout shell.

- `docs/ARCHITECTURE.md:1,6,9`:

```md
# Architecture Decisions — Danial Rashidi Personal Site (Foundation Slice)
…
- **Main modules:** `src/layouts/Layout.astro`, `src/components/{Header,Footer,ThemeToggle}`, `src/styles/{tokens,global}.css`, `src/data/site.ts`, `src/pages/{index,work,about,now,contact,404}`, `src/content.config.ts` (stub), `public/{fonts,favicon,robots}`
…
- **Deployment topology:** GitHub Pages `username.github.io` static. Source `main`, build `astro build` → `dist/` (HTML + hashed `_astro/*.css` + `fonts/*.woff2` + `.nojekyll` + `sitemap-*.xml`), deploy via GitHub Pages (either branch-Jekyll-bypass or future Actions `deploy-pages`). `.nojekyll` committed at repo root and `public/.nojekyll` → `dist/.nojekyll`.
```

` (stub)` and `either … or future Actions deploy-pages` are superseded (`deploy.yml` exists, collections authored).

Repo conventions (from `CONTRIBUTING.md`): every material change must update source-of-truth docs + `CHANGELOG.md` + doctor/integrity where pinned; reliance on tested diff/CI evidence, not startup flags.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0 |
| Build | `npm run build` | exit 0 (also use to measure dist sizes) |
| Full gate | `bash scripts/verify.sh` | exit 0 |

Measurement helpers (record results in the doc edits, don't fabricate):

```bash
npm run build
du -sh dist dist/_astro public/fonts 2>/dev/null
ls -lh dist/_astro/*.webp dist/_astro/*.css 2>/dev/null | awk '{print $9, $5}'
wc -c dist/index.html dist/about/index.html 2>/dev/null
```

## Scope

**In scope** (only files you should modify):
- `CHANGELOG.md`
- `CONTRIBUTING.md`
- `docs/DESIGN.md`
- `docs/ARCHITECTURE.md`

**Out of scope** (do NOT touch):
- `docs/PRODUCT.md`, `docs/PLAN.md` — intentionally still empty templates per `plans/003` owner choice vs active plan §4; do not fill or reconcile them here.
- `docs/RESEARCH.md`, `docs/EVALUATION.md`, `docs/QUALITY.md`, `docs/HARNESS.md`, `docs/TOOLING_SETUP.md` content (you may read TOOLING_SETUP for the correct pointer, but don't edit it).
- `src/*`, `package.json`, workflows — no product code in a docs plan.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

### Step 1: Backfill `CHANGELOG.md`

In `CHANGELOG.md` `## Unreleased`, after the existing `### Added` / `### Changed` blocks, add a new dated section for the product build so future release notes are trivial to tag. Preserve Keep-a-Changelog style. Use this structure (adjust wording minimally to match the actual `git log` subjects, but keep the bullets factual and checkable against `plans/README.md:001–010` and this series):

```md
### Added — product site (slice 1–4, plans 001–010, commit dbda97e)
- Astro 7.2.4 + TypeScript 5.9 (strict) static site — 8 routes (/, /work, /work/fast-english, /work/noveno, /about, /now, /contact, 404) with `src/layouts/Layout.astro` (canonical, OG/Twitter, JSON-LD Person, FOUC script) and `src/data/site.ts` as single source for site/social/nav.
- Content layer — `src/content.config.ts` collections (`projects` via `astro/loaders` + zod, `profile`/`now` stubs) with `src/content/projects/{fast-english,noveno}.md`; typed frontmatter for card + case-study contracts.
- Design system — semantic tokens `src/styles/tokens.css` + `global.css`, Geist/Geist Mono variable woff2 vendored to `public/fonts` (69K+70K, preload Sans), editorial × engineering aesthetic per `docs/DESIGN.md` (light-first + polished dark, `backdrop-filter` header, `clamp()` rhythm).
- Components/pages — `Header` (sticky + mobile `role=dialog` with focus trap), `Footer`, `ThemeToggle` (localStorage + prefers-color-scheme), `ProjectFeature`/`ProjectMedia`, `case-study/*` blocks; portrait via `astro:assets <Image>` on Home + About.
- Social preview — `public/og-default.png` (1200×630) via `scripts/generate-og.mjs` + OG/Twitter meta in Layout (plan 005).

### Added — deployment & CI (plans 001–002, 007, 014)
- `bash scripts/ci-install.sh` + `npm ci` install lane (plan 001).
- `.github/workflows/deploy.yml` — `actions/deploy-pages` to GitHub Pages (`contents: read, pages: write, id-token: write`, `node 22.23.2`) with typecheck gate (plan 014).
- `.github/workflows/quality.yml` product verification (`bash scripts/verify.sh` + integrity).

### Changed
- `.gitignore` + `README.md` repo hygiene (plan 003).
```

Also under `Changed` or as a `Fixed` subheading, cite the batch 011–015 if this doc plan lands after them (otherwise leave 011–015 to be added when they land — the executor must check `plans/README.md` status before finalizing wording and update the entry to name the actual plans that have landed by the time of edit).

**Verify**:
```bash
grep -n "product site\|deploy.yml\|og-default" CHANGELOG.md  # at least 1 each
grep -n "Unreleased" CHANGELOG.md                             # still present (no version bump)
```

### Step 2: Fix the dead CONTRIBUTING → README pointer

In `CONTRIBUTING.md:2`, replace the dead pointer. Change:

```md
2. Install the reviewed Pi pin from `README.md`.
```

to:

```md
2. Install the reviewed Pi pin per `docs/TOOLING_SETUP.md` (packages, MCP, Playwright, LSP — reload via `/reload` after pin changes).
```

Keep steps 1, 3–5 verbatim. Also update the Workflow-policy "Run:" block if it lists outdated pins — but it currently lists generic `bash scripts/verify.sh` etc., so keep it.

**Verify**:
```bash
grep -n "TOOLING_SETUP" CONTRIBUTING.md  # 1 match
grep -n "from \`README" CONTRIBUTING.md  # no matches
```

### Step 3: Correct `docs/DESIGN.md` budget and deferred-table staleness

In `docs/DESIGN.md`:

1. Replace the **Image/font/JS budget** line `Images 0 yet (portrait preserved not rendered)` with a measured, truthful line. First run the measurement helpers from Commands, then write something like:

```md
- Image/font/JS budget: portrait via `astro:assets <Image>` on Home + About (`Assets/Danial_photo.webp` 855×855 source, 4 responsive `dist/_astro/Danial_photo.*.webp` variants, `loading: lazy` on Home / `eager + fetchpriority:high` on About after plan 013), fonts 69+70 (preload Sans only, swap), JS 0 external + ~2K inline (theme + nav), CSS 23K at foundation, ~90K shipped (inlined via `astro.config build.inlineStylesheets` after plan 013), total HTML 8 pages ~120K + inlined CSS per page.
```

You may simplify to `Images 0 yet → portrait rendered …` if you cannot measure the exact CSS number after plan 013 — but the "Images 0 yet" claim must be gone.

2. Keep `CSS 23K total (7+16K)` only with the qualifier `at foundation` (or update to the shipped number if measurement shows otherwise). Do not claim a false current number — measure via `du -sh` / `ls -lh`.

3. In the **Decisions intentionally deferred** table, annotate the homepage row that was delivered: change `Full homepage storytelling composition (foundation is restrained, not final)` → `Full homepage storytelling composition — delivered (hero/work/capabilities/principles/about/now/cta per docs/exec-plans/active/premium-personal-brand.md slices 2–3; future copy depth still open)`. Keep the case-study long-form layouts row but clarify it means "long-form body-copy/media depth" not "layout shell" — the shell exists as honest stubs.

4. Confirm the `Decisions intentionally deferred` table says `Portrait rendering optimization — delivered: rendered via astro:assets <Image> on Home + About` is accurate (it is).

**Verify**:
```bash
grep -n "Images 0 yet" docs/DESIGN.md              # no matches
grep -n "portrait via" docs/DESIGN.md               # 1 match
grep -n "foundation.*CSS\|CSS.*foundation" docs/DESIGN.md  # qualifier present
```

### Step 4: Bring `docs/ARCHITECTURE.md` from Foundation Slice to shipped reality

- Change the title/header: `# Architecture Decisions — Danial Rashidi Personal Site (Foundation Slice)` → `(Shipped — plans 001–010 at dbda97e; updates 011+ in progress)` or similar that records the baseline commit.

- Update **Main modules** line: remove `(stub)` after `src/content.config.ts` (collections are authored and used via `getCollection`), and add `src/lib/projects.ts` if plan 012 has landed (check `plans/README.md` status before editing — if 012 is still TODO, leave it for that plan's doc touch; otherwise include it).

- Update **Deployment topology**: replace `either branch-Jekyll-bypass or future Actions deploy-pages` with the shipped `actions/deploy-pages via .github/workflows/deploy.yml (live, plan 002 DONE, gated on npm run check per plan 014)`.

- Update **Data stores**: change `markdown collections stubbed via astro/loaders glob` → `markdown collections via astro/loaders glob (projects authored: fast-english, noveno)`.

Keep all other ADRs verbatim — no behavioral change.

**Verify**:
```bash
grep -n "Foundation Slice.*stub\|future Actions" docs/ARCHITECTURE.md  # no matches after edit
grep -n "deploy-pages via" docs/ARCHITECTURE.md                        # 1 match
grep -n "content.config.ts" docs/ARCHITECTURE.md | grep -v stub       # passes
```

### Step 5: Final gate

```bash
npm run check
npm run build
bash scripts/verify.sh
```
All exit 0. No product code changed, so `dist/` should still contain the portraits and sitemap.

## Test plan

No unit tests for docs. Regression net: `npm run check` + `npm run build` still pass; the measurement helpers above prove the DESIGN numbers are grounded in `dist/`. A follow-up visual check (optional): open `CHANGELOG.md` and `docs/DESIGN.md` in the browser preview and confirm no broken markdown.

## Done criteria

ALL must hold:

- [ ] `CHANGELOG.md` `Unreleased` contains product + deploy entries mentioning Astro 7 / sitemap / og:image / deploy.yml / ci-install — and no longer ends at the harness-only `Pi 0.84.2` line as its last entry
- [ ] `CONTRIBUTING.md:2` points to `docs/TOOLING_SETUP.md`, not `README.md` (`grep -n TOOLING_SETUP` hits, `grep -n "from \`README"` misses)
- [ ] `docs/DESIGN.md` has **zero** `Images 0 yet` claims; instead the portrait-via-`astro:assets` line with measured variant info is present
- [ ] `docs/ARCHITECTURE.md` header no longer says only `Foundation Slice`; deployment topology says `deploy-pages via .github/workflows/deploy.yml (live)`; `content.config.ts (stub)` is gone
- [ ] `npm run check` exits 0, `npm run build` exits 0, `bash scripts/verify.sh` exits 0
- [ ] No files outside the four in-scope docs modified (`git status --short` shows only them plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the four docs has diverged from the excerpts (e.g. CHANGELOG already has product entries added by a parallel plan, ARCHITECTURE title already updated).
- The `dist/` measurement shows the portrait or CSS numbers differ so much that the proposed DESIGN budget wording would be false — record the actual numbers and update the doc accordingly instead of guessing.
- You discover PRODUCT.md/PLAN.md are no longer empty templates (owner started filling them) — report that; do not merge this plan's docs work with that decision.

## Maintenance notes

- CHANGELOG must now be kept current per `CONTRIBUTING.md`'s change contract — every material plan (011–019) should add its own `Fixed/Added` entry before being marked DONE, and a reviewer should enforce it.
- DESIGN budgets drift every time assets or inlining change. Measure via the helpers in Commands after any perf asset change (plans 013, 015) and update the `Budgets:` line — a one-line `du -sh` is cheaper than a stale doc.
- ARCHITECTURE's deployment topology should track `deploy.yml` changes (especially plan 014's gate). Keep it in sync when the workflow is next touched.
- Reviewer scrutiny: verify the CHANGELOG entry doesn't invent metrics/testimonials (no-invented-proof rule) and that the quoted `dist/` numbers match a local `npm run build` at the same commit.

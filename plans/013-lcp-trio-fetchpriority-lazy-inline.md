# Plan 013: Claim three one-line LCP wins — fetchpriority, eager→lazy, inline CSS

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- src/pages/about.astro src/pages/index.astro astro.config.mjs`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

Three one-line changes jointly address the largest remaining structural LCP cost on this static site (budget: LCP ≤ 2.5s per `docs/DESIGN.md`):

- `/about` renders its only large above-fold asset — the portrait — with `loading="eager"` but no `fetchpriority`. On ≤820px it is `100vw` and the likely LCP element, yet the browser discovers it at default priority behind the 69KB preloaded font and three render-blocking CSS files.
- The homepage renders its About-preview portrait **four viewports below the fold** (hero → selected work → capabilities → principles → about) with `loading="eager"`, making it compete for priority with hero text and the critical font on first paint — pure waste.
- `astro.config.mjs` uses `inlineStylesheets: "auto"` but the three emitted stylesheets (~23K total — `Layout.*.css`, `_astro_content.*.css`, `index.*.css` in `dist/index.html`) all exceed Vite's 4KB inline limit, so every first visit pays three round trips before first paint on GitHub Pages.

Each fix is one attribute or one config value. Together they remove measurable critical-path bytes without any visual change at rest.

## Current state

- `src/pages/about.astro:28–42` — the LCP candidate on `/about`:

```astro
        <div class="about-hero__media">
          <figure class="about-hero__figure">
            <Image
              src={portraitSrc}
              alt="Portrait of Danial Rashidi"
              widths={[320, 480, 640]}
              sizes="(max-width: 820px) 100vw, 360px"
              loading="eager"
              decoding="async"
              class="about-hero__portrait"
            />
```

No `fetchpriority`.

- `src/pages/index.astro:230–240` — the below-fold portrait on the homepage:

```astro
        <div class="about__media">
          <div class="about__portraitWrap">
            <Image
              src={portraitSrc}
              alt="Portrait of Danial Rashidi"
              widths={[320, 480, 640]}
              sizes="(max-width: 720px) 42vw, 320px"
              loading="eager"
              decoding="async"
              class="about__portrait"
            />
```

Four full sections above it; `sizes` shows the small-viewport intent.

- `astro.config.mjs:10–16` — build CSS inlining is not triggering:

```js
  build: {
    inlineStylesheets: "auto",
  },
```

Built `dist/index.html` head (as of `dbda97e`) links three stylesheets separately — verify with grep.

Repo conventions: `<Image>` from `astro:assets` forwards unknown props to the underlying `<img>`; `fetchpriority` is valid HTML. `global.css`/`tokens.css` and component `<style>` blocks are the only CSS sources — no extra stylesheet after inlining.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0, 0 errors |
| Build | `npm run build` | exit 0 |
| Dist check | `grep -c 'rel="stylesheet"' dist/index.html` etc. | see steps |
| Full gate | `bash scripts/verify.sh` | exit 0 |

Optional (if Playwright/browser available): build + `npm run preview -- --port 4321` and run a single mobile Lighthouse trace against `/` and `/about` before/after; expect LCP on `/about` to drop and CSS-linked fetches to vanish after step 3. If no browser tool, rely on the static checks and report Lighthouse as UNPROVEN honestly.

## Scope

**In scope** (only files you should modify):
- `src/pages/about.astro` — add `fetchpriority="high"`
- `src/pages/index.astro` — change `loading="eager"` → `loading="lazy"`
- `astro.config.mjs` — `inlineStylesheets: "auto"` → `"always"`

**Out of scope** (do NOT touch):
- Font subsetting, second preload, metric overrides, image `widths`/`sizes` tuning — all deferred; this plan is three value lines only.
- Any `src/styles/*` or component CSS change — visual diff must be zero.
- `public/fonts/*`, `src/layouts/Layout.astro`, `src/components/*`.

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

### Step 1: Give the `/about` LCP image `fetchpriority="high"`

In `src/pages/about.astro`, add `fetchpriority="high"` to the `<Image>` that is the LCP candidate (the one in `about-hero__media`):

```astro
            <Image
              src={portraitSrc}
              alt="Portrait of Danial Rashidi"
              widths={[320, 480, 640]}
              sizes="(max-width: 820px) 100vw, 360px"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              class="about-hero__portrait"
            />
```

Astro's `<Image>` forwards the attribute to the rendered `<img>`.

**Verify**:
```bash
grep -n 'fetchpriority' src/pages/about.astro   # 1 match
npm run check && npm run build
grep -c 'fetchpriority="high"' dist/about/index.html  # 1
```
Both check and build exit 0. The homepage must be unchanged by this step — confirm `grep -n fetchpriority src/pages/index.astro` returns no match yet.

### Step 2: Lazy-load the homepage About-preview portrait

In `src/pages/index.astro` (around line 230), change only the `loading` prop on the About-preview `<Image>`:

```astro
            <Image
              src={portraitSrc}
              alt="Portrait of Danial Rashidi"
              widths={[320, 480, 640]}
              sizes="(max-width: 720px) 42vw, 320px"
              loading="lazy"
              decoding="async"
              class="about__portrait"
            />
```

Keep `decoding="async"` as-is.

**Verify**:
```bash
grep -n 'loading="lazy"' src/pages/index.astro   # 1 match (this portrait)
grep -n 'loading="eager"' src/pages/index.astro   # no matches
grep -n 'fetchpriority' src/pages/index.astro     # no matches (homepage stays without priority)
npm run check && npm run build
# built homepage should now have loading=lazy on the about preview image
grep -c 'loading="lazy"' dist/index.html  # at least 1
```

### Step 3: Inline all CSS

In `astro.config.mjs`, change the build flag:

```js
  build: {
    inlineStylesheets: "always",
  },
```

Trade-off: HTML grows ~23K per page and per-page CSS cache reuse is lost. This is acceptable for an 8-page personal site with shallow visit depth and no shared-CSS reuse across navigations anyway; first-paint time dominates. Documented in `docs/DESIGN.md:130` budgets (CSS 23K total, fonts 139K, JS ~2K).

**Verify**:
```bash
npm run build
grep -c 'rel="stylesheet"' dist/index.html   # 0 (no external stylesheet links)
grep -c '<style' dist/index.html             # at least 1 (inlined CSS present)
ls -lh dist/_astro/*.css 2>&1 | head         # may still emit files but pages must not link them
```
Build exits 0. Check a second page too:
```bash
grep -c 'rel="stylesheet"' dist/about/index.html   # 0
grep -c 'rel="stylesheet"' dist/work/index.html    # 0
```

### Step 4: Final gate and optional Lighthouse evidence

Run the full verification and, if a browser tool exists, capture before/after LCP evidence.

**Verify**:
```bash
npm run check
bash scripts/verify.sh
```
Both exit 0.

If a browser is available, run one Lighthouse mobile trace on `/` and `/about` from the preview server (`npm run preview -- --port 4321 &` then lighthouse or Playwright trace). Record the numbers in the PR / plan comment; if unavailable, explicitly report lab proof as UNPROVEN. Never fabricate numbers.

## Test plan

No product unit tests cover markup attributes today. Regression net: `npm run check` + `npm run build` + `dist/*.html` grep assertions above. The homepage and `/about` still render (`dist/index.html`, `dist/about/index.html` contain the portraits with correct attributes).

Follow-up image-attribute coverage belongs in plan 012's lib tests; do not add a one-off test here.

## Done criteria

ALL must hold:

- [ ] `src/pages/about.astro` LCP `<Image>` has `loading="eager"` **and** `fetchpriority="high"`
- [ ] `src/pages/index.astro` About-preview `<Image>` has `loading="lazy"` (no `fetchpriority`)
- [ ] `astro.config.mjs` has `inlineStylesheets: "always"` (`grep` confirms)
- [ ] `dist/index.html`, `dist/about/index.html`, `dist/work/index.html` have **zero** `rel="stylesheet"` links after build
- [ ] `npm run check` exits 0, `npm run build` exits 0, `bash scripts/verify.sh` exits 0
- [ ] No files outside the three in-scope files modified (`git status --short` shows only them plus `plans/README.md`)
- [ ] `plans/README.md` status row updated (note UNPROVEN honestly if Lighthouse was unavailable)

## STOP conditions

Stop and report back (do not improvise) if:

- The `<Image>` props in the excerpts don't match the live code (ids/props renamed, portrait removed, component replaced with `<img>`).
- Astro's `<Image>` does not forward `fetchpriority` to the rendered `<img>` (the `dist/about/index.html` grep for `fetchpriority` returns 0 after step 1 — try `fetchPriority` camelCase or fall back to a plain `<img>` with the same props and report).
- `inlineStylesheets: "always"` causes the build to inline only one bundle and still emit two linked sheets — report the `dist/*.html` head you observed.
- Any verification fails twice after a reasonable fix attempt.

## Maintenance notes

- New pages with an above-fold `<Image>` should use `loading="eager" fetchpriority="high"` for the single LCP candidate, and `loading="lazy"` for everything else. Below-fold portraits elsewhere should remain lazy.
- If a future page exceeds ~100K HTML after inlining, revisit the always-inline trade-off for that route — but don't revert globally for one heavy page; use per-route splitting then.
- Reviewer scrutiny: verify the homepage and `/about` still show the portraits at every breakpoint (especially 320/375/820/1280) — lazy-load must not hide the `/about` LCP image (it stays eager) and the inlined CSS must not FOUC.

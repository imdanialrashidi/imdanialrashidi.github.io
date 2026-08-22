# Plan 019: Minor polish — footer year, placeholder a11y, theme-toggle pressed state (+ models.env guard)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat dbda97e..HEAD -- src/components/Footer.astro src/components/ProjectMedia.astro src/components/case-study/CaseFigure.astro src/components/ThemeToggle.astro src/layouts/Layout.astro .pi/models.env`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts below against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none (can land last — touches three small surfaces, good to isolate from larger plans)
- **Category**: polish / a11y
- **Planned at**: commit `dbda97e`, 2026-08-22

## Why this matters

Three small blemishes plus one latent hygiene risk:

- **Footer year frozen at build time.** `src/components/Footer.astro:4` does `const year = new Date().getFullYear();` once at `astro build`. The site displays the prior year until someone rebuilds after Jan 1 — a credibility nick on a site that emphasizes currency, and `src/pages/now.astro` already uses an explicit hard-coded date instead.
- **Placeholder frames exposed as images.** `src/components/ProjectMedia.astro:33` and `src/components/case-study/CaseFigure.astro:44` render `<div role="img" aria-label="…honest placeholder…">` inside a link that already has `aria-label="${title} — ${ctaLabel}"` (`src/components/ProjectFeature.astro:19`). Screen readers hear a verbose "image" for decorative placeholder art — noise, not signal. `ProjectMedia` also has the contradictory `aria-hidden="false"`.
- **ThemeToggle ships wrong state until JS.** `src/components/ThemeToggle.astro:4–7` hardcodes `aria-pressed="false"` + `aria-label="Toggle theme"`; the correct `aria-pressed` / label (`"Switch to dark/light theme"`) is applied only by the bundled module script's `apply()` after parse. Dark-theme users briefly see the wrong pressed state and generic label.
- **Latent: `.pi/models.env` committed without a guard comment.** The file is tracked (required by `scripts/pi-doctor.sh: required` and `p:15 source`) and on a PUBLIC repo (`gh repo view` → `PUBLIC`). Its current contents are three non-secret Pi flags (`PI_TELEMETRY`, `PI_SKIP_VERSION_CHECK`, `PI_CACHE_RETENTION` — names only inspected) — no rotation needed — but the filename is exactly where provider keys would go, and a future `PI_PROVIDER_KEY=…` would be published on `git add .`. A one-line comment is cheap insurance.

## Current state

- `src/components/Footer.astro` (lines 1–7):

```astro
---
import { social } from "../data/site.ts";

const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container site-footer__inner">
    <div class="site-footer__left">
      <div class="site-footer__brand">Danial Rashidi</div>
      <div class="site-footer__tagline">
        Software & Product Builder — Web · AI · Automation · Product Engineering
      </div>
      <div class="site-footer__copy">© {year} Danial Rashidi. Crafted with care.</div>
```

Build evaluates `new Date()` once; the output HTML contains e.g. `© 2026 Danial Rashidi.` until the next build.

- `src/components/ProjectMedia.astro:28–42` (branch when no image):

```astro
  ) : (
    <div class="pm__frame" aria-hidden="false" role="img" aria-label={`${title} — imagery placeholder, honest abstract treatment`}>
      <!-- subtle grid -->
      <div class="pm__grid" aria-hidden="true"></div>
      <div class="pm__inner">
        <div class="pm__top">
          <span class="pm__index">{indexLabel}</span>
          <span class="pm__status">{statusLabel}</span>
        </div>
```

Wrapper in `src/components/ProjectFeature.astro:15–17`:

```astro
  <div class="pf__media">
    <a href={href} class="pf__mediaLink" aria-label={`${title} — ${ctaLabel}`} tabindex="-1">
      <ProjectMedia title={title} … />
```

The link's label is the intended announcement; the inner `role="img"` duplicates it verbosely and `aria-hidden="false"` is contradictory.

- `src/components/case-study/CaseFigure.astro:38–50` — same pattern:

```astro
      />
    ) : (
      <div class="cs-figure__placeholder" role="img" aria-label={`${placeholderTitle} — honest placeholder`}>
        <div class="cs-figure__grid" aria-hidden="true"></div>
```

Inside case-study pages that are not link-wrapped, the placeholder still adds SR noise.

- `src/components/ThemeToggle.astro:1–12` (markup) + script tail:

```html
<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle theme"
  aria-pressed="false"
  class="theme-toggle"
>
```

```ts
  function apply(theme: "light" | "dark") {
    document.documentElement.setAttribute(attr, theme);
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      btn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }
  // init button state
  apply(getCurrent());
  document.getElementById("theme-toggle")?.addEventListener("click", toggle);
```

`apply()` is correct but runs only when the module executes — after parse. Static markup is briefly wrong for dark users. The existing FOUC guard in `src/layouts/Layout.astro:88–99` runs pre-paint in head but cannot touch `#theme-toggle` because the button isn't in the DOM yet — so the button fix must live on the button itself.

- `src/layouts/Layout.astro:88–99` — head FOUC script (inline, blocking before paint):

```js
      (function () {
        try {
          var k = "theme";
          var s = localStorage.getItem(k);
          var d = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          var t = s === "light" || s === "dark" ? s : d;
          document.documentElement.setAttribute("data-theme", t);
        } catch (e) {
          var m = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", m);
        }
      })();
```

- `.pi/models.env` — 8 lines, 3 vars (`PI_TELEMETRY`, `PI_SKIP_VERSION_CHECK`, `PI_CACHE_RETENTION`), committed since `a55dbf5 Initial commit`, on PUBLIC repo. No `PI_API_KEY` style secret today. Required by `scripts/pi-doctor.sh:14` and sourced by `p:15`.

Repo conventions: vanilla TS in Astro `<script>` blocks, `font-display: swap`, semantic tokens, no invented metrics. Match exactly. Verification: `npm run check`, `npm run build`, `bash scripts/verify.sh`.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Typecheck | `npm run check` | exit 0 |
| Build | `npm run build` | exit 0 |
| Dist check | `grep -n "©.*Danial Rashidi" dist/index.html` | shows year |
| A11y grep | `grep -rn 'role="img".*placeholder' src/components` | depends on step |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Scope

**In scope** (only files you should modify):
- `src/components/Footer.astro`
- `src/components/ProjectMedia.astro`
- `src/components/case-study/CaseFigure.astro`
- `src/components/ThemeToggle.astro` (and optionally one-line in `src/layouts/Layout.astro` if you choose the FOUC-shared approach — but prefer keeping the fix in ThemeToggle alone)
- `.pi/models.env` — add a comment line only (no value)

**Out of scope** (do NOT touch):
- `src/pages/*`, `src/data/site.ts`, `src/styles/*`, `src/content.config.ts`, OG generation, deploy workflows, `docs/*`.
- Any CSP, referrer, or theme-color meta hardening (deferred).

## Git workflow

Owner-controlled repo: no branches/commits/pushes. Leave verified working-tree changes.

## Steps

### Step 1: Footer year — hardcode with explicit cadence

In `src/components/Footer.astro`, replace the build-time `new Date()` with an explicit constant and a comment so the update cadence is visible in review:

```astro
---
import { social } from "../data/site.ts";

// Explicit year — update each January (or via the annual release tagging). Kept static to avoid client JS for a footer.
const year = 2026;
---
```

Alternative acceptable: keep `new Date().getFullYear()` but add a comment `// build-time year — site must be rebuilt after Jan 1`. Either satisfies the credibility requirement; pick one and keep it. Do not add a client `<script>` that rewrites the footer year at runtime — not worth the JS for a personal site rebuilt regularly.

**Verify**:
```bash
grep -n "const year" src/components/Footer.astro  # 1 match, either hardcoded or getFullYear with comment
npm run build
grep -n "©.*Danial Rashidi" dist/index.html | head -2  # shows 2026
```

### Step 2: Placeholder frames — hide decorative art from assistive tech

In both placeholder branches, the wrapper link (where it exists) already carries the concise label. The inner abstract art should be hidden:

In `src/components/ProjectMedia.astro`, change:

```astro
    <div class="pm__frame" aria-hidden="false" role="img" aria-label={`${title} — imagery placeholder, honest abstract treatment`}>
```

to:

```astro
    <div class="pm__frame" aria-hidden="true">
```

Remove the verbose `aria-label`/`role` entirely; the `ProjectFeature` link's `aria-label` remains the announcement. `aria-hidden="false"` is contradictory — removing it is part of the fix.

In `src/components/case-study/CaseFigure.astro`, same:

```astro
      <div class="cs-figure__placeholder" aria-hidden="true">
```

If a case-study figure is standalone (not link-wrapped), the caption already conveys meaning — still hide the decorative grid frame and keep only the textual `<figcaption>` or `caption` prop for SR.

**Verify**:
```bash
grep -rn 'role="img"' src/components/ProjectMedia.astro src/components/case-study/CaseFigure.astro  # no matches
grep -rn 'aria-hidden="false"' src/components/ProjectMedia.astro  # no matches
grep -rn 'aria-hidden="true".*pm__frame\|aria-hidden="true".*cs-figure__placeholder' src/components  # 2 matches
npm run check && npm run build
# spot-check built HTML: placeholder frames carry aria-hidden=true and no role
grep -c 'aria-hidden="true"' dist/index.html  # increased by at least 2 vs before
```

### Step 3: ThemeToggle — make `aria-pressed` correct from first paint

In `src/components/ThemeToggle.astro`, note the script today is `<script>` (no `is:inline`) — Astro bundles it as a deferred module (`dist/_astro/*.js` is otherwise empty for this site; ThemeToggle will produce a module script). Change it to inline so `apply(getCurrent())` runs synchronously right after the button is parsed, before the next paint:

```html
<script is:inline>
```

Keep the entire script body unchanged except for the `is:inline` attribute. The functions `getStored`/`getSystem`/`getCurrent`/`apply`/`toggle` and the final `apply(getCurrent()); document.getElementById("theme-toggle")?.addEventListener("click", toggle);` stay.

After the change, the built HTML (`dist/index.html`) should contain the ThemeToggle script as an inline `<script>` block rather than a hashed module reference, and the button's `aria-pressed` / `aria-label` are set synchronously.

If `is:inline` causes Astro to duplicate the script per page (it will — it's component-scoped), that is acceptable for ≤2K inline JS on an 8-page site; don't try to deduplicate via Layout.

Alternative acceptable: keep the module script but duplicate the `aria-pressed` logic into `src/layouts/Layout.astro`'s FOUC guard *after* `DOMContentLoaded` — but that reintroduces a timing race. Prefer the `is:inline` fix in ThemeToggle.

**Verify**:
```bash
grep -n 'is:inline' src/components/ThemeToggle.astro  # 1 match
npm run build
# built page should have inline toggle logic, not just a module import
grep -c 'aria-pressed' dist/index.html  # still present; check that the inline script sets it
grep -n 'id="theme-toggle"' dist/index.html | head -2
```

Manual check if browser tool available: load any page with system dark, assert `aria-pressed="true"` and `aria-label="Switch to light theme"` without waiting for a deferred module tick.

### Step 4: Guard `.pi/models.env` against future secret commits

At the top of `.pi/models.env`, add a comment line (comments are safe — `p` sources this file via `source` and `#` lines are shell comments):

```sh
# COMMITTED — do not add provider API keys here (public repo). Use shell env or user-local config instead.
```

Keep the three existing `PI_TELEMETRY` etc. lines unchanged. Do not add example keys, do not commit values.

**Verify**:
```bash
head -1 .pi/models.env | grep -q "COMMITTED" && echo "guard present"
git ls-files .pi/models.env  # still tracked (intentional)
```

### Step 5: Final gate

```bash
npm run check
npm run build
bash scripts/verify.sh
```
All exit 0. No `scripts/public/` artifact (from prior OG misfire) present.

## Test plan

No new unit tests (polish is visual/a11y static). Regression net: `npm run check` + `npm run build` + grep assertions above. If a browser tool is available, verify SR-related fix by inspecting the accessibility snapshot for the placeholder frames: they should no longer appear as `img` nodes with placeholder labels.

## Done criteria

ALL must hold:

- [ ] `src/components/Footer.astro` no longer calls `new Date().getFullYear()` without a cadence comment, or hardcodes `2026` with a comment (grep confirms intent)
- [ ] `src/components/ProjectMedia.astro` placeholder has `aria-hidden="true"` and zero `role="img"` / `aria-label` with `honest abstract treatment`
- [ ] `src/components/case-study/CaseFigure.astro` placeholder likewise has `aria-hidden="true"` and zero `role="img"` with `honest placeholder`
- [ ] `src/components/ThemeToggle.astro` `<script>` is `<script is:inline>` (`grep` finds it) and `npm run build` inlines the toggle logic
- [ ] `.pi/models.env` first line is the `COMMITTED — do not add provider API keys` guard comment
- [ ] `npm run check` exits 0, `npm run build` exits 0, `bash scripts/verify.sh` exits 0
- [ ] No files outside the five in-scope files modified (`git status --short` shows only them plus `plans/README.md`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any of the four components no longer matches the excerpts (e.g. Footer already hardcodes the year, ThemeToggle already uses `is:inline`, placeholder markup became real `<Image>`).
- `is:inline` causes the ThemeToggle script to duplicate per page and the duplicate inline scripts interfere with each other (two `theme` keys racing) — report the observed `dist/*.html` script content.
- `.pi/models.env` contents changed upstream to include a secret variable — do not read or commit its value; stop and reference `file:line` + credential type only.

## Maintenance notes

- Footer year: bump the hardcoded `2026 → 2027` each January when tagging a release, or when you notice `dist/` still says prior year after Jan 1. The `CHANGELOG.md` update (plan 016) is the natural trigger.
- Placeholders: when real screenshots land (owner-gated, plan backlog), the `image` branch already uses `<Image loading="lazy" alt="…">` — no a11y change needed. The `aria-hidden` placeholder branch is simply not rendered then.
- ThemeToggle: if a second toggle button is added (e.g. in the mobile dialog), share the `apply()` via `document.querySelectorAll("#theme-toggle, #theme-toggle-mobile")` — but keep the `is:inline` per-component execution; don't extract to a shared module without measuring duplicate cost.
- Reviewer scrutiny: verify the footer year bump is the only intended copy change and that the placeholder `aria-hidden` diff doesn't remove any textual caption (captions are outside the hidden container).

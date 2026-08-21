# Plan 005: Social preview image — generate an OG asset and wire the meta tags

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: Most product files in this repo are currently
> **untracked** (`git status` shows `?? src/`, …). Compare the "Current
> state" excerpts below directly against the working tree; on any mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: M (asset generation + meta wiring + visual check)
- **Risk**: LOW
- **Depends on**: none technically; review after plans/002 if deploy timing matters
- **Category**: seo / direction
- **Planned at**: commit `944f128`, 2026-08-21

## Why this matters

Every page ships Open Graph/Twitter metadata — title, description, URL,
locale — but **no `og:image` / `twitter:image` anywhere** in
`src/layouts/Layout.astro`. When anyone shares the site (or a case study) in
Slack, X, LinkedIn, or iMessage, the card renders with no preview image.
The owner's own plan promised this twice:
`docs/exec-plans/active/premium-personal-brand.md` Slice 4 ("OG images per
project") and Slice 7 ("favicon/OG social preview check").

This plan delivers the foundation slice honestly: one branded default image
used site-wide. Per-project images stay explicitly out of scope until real
project screenshots exist (the repo's no-invented-proof rule).

## Current state

- `src/layouts/Layout.astro` head section (lines ~44–60) contains the social
  block, verbatim:

```astro
    <!-- Open Graph / Twitter -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content={site.shortTitle} />
    <meta property="og:title" content={ogTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL} />
    <meta property="og:locale" content={site.locale} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={ogTitle} />
    <meta name="twitter:description" content={description} />
```

- `src/data/site.ts` exports `site` (`url`, `shortTitle`, `title`,
  `description`, …) as the canonical source for these strings — import it,
  never hardcode.
- Brand tokens (`src/styles/tokens.css`): canvas light `#fcfcfc`, text
  `#0f1419`, accent `#0f4cff`; mono font token exists but the generator must
  rely on system fonts (see Step 1 note).
- `sharp` ^0.35.3 is already a devDependency (used by Astro's image pipeline)
  — reuse it in a script instead of adding any new dependency.
- Design constraints from `docs/DESIGN.md` that apply to the image: monochrome
  + single electric-blue accent, editorial restraint, no gradients-as-design,
  no glassmorphism/neon. Keep it typographic.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Generate image | `node scripts/generate-og.mjs` | exit 0; writes `public/og-default.png` |
| Typecheck | `npm run check` | exit 0 |
| Build | `npm run build` | exit 0; `dist/og-default.png` exists |
| Full gate | `bash scripts/verify.sh` | exit 0 |

## Suggested executor toolkit

- After deploying (plans/002), validate the live card with a social-card
  debugger or by fetching the rendered HTML — mark UNPROVEN until then;
  never claim a rendered card without evidence.

## Scope

**In scope**:
- `scripts/generate-og.mjs` (create)
- `public/og-default.png` (generated artifact, ~1200×630)
- `src/layouts/Layout.astro` (add og:image/twitter:image metas)

**Out of scope** (do NOT touch):
- Per-project OG images — needs real screenshots first (no-invented-proof rule).
- `astro.config.mjs`, pages, components other than Layout.
- Adding dependencies (image libs beyond existing `sharp`).
- Changing `twitter:card` to anything besides `summary_large_image`.

## Git workflow

Owner-controlled repo: no branches, commits, or pushes. Leave verified
working-tree changes (including the generated PNG — it is committed like
other `public/` assets once the owner approves).

## Steps

### Step 1: Create `scripts/generate-og.mjs`

A deterministic generator using `sharp`. Render an SVG string → PNG. Use only
system-safe font families in SVG text (`DejaVu Sans` is present on Linux CI;
include generic fallbacks). Keep the composition simple enough that font
metric differences cannot break the layout (left-aligned text, generous
margins, nothing centered precisely):

```js
#!/usr/bin/env node
// Generates public/og-default.png (1200x630) — brand-consistent social
// preview for the whole site. Re-run whenever branding changes; commit output.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="100%" height="100%" fill="#fcfcfc"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="#0f4cff"/>
  <text x="80" y="240" font-family="'Geist','DejaVu Sans',Arial,sans-serif"
        font-size="88" font-weight="700" letter-spacing="-2" fill="#0f1419">Danial Rashidi</text>
  <text x="80" y="330" font-family="'DejaVu Sans Mono','Menlo',monospace"
        font-size="34" fill="#5f6368">Software &amp; Product Builder</text>
  <text x="80" y="410" font-family="'DejaVu Sans',Arial,sans-serif"
        font-size="30" fill="#8a8f98">Web · AI · Automation · Product Engineering</text>
  <text x="80" y="540" font-family="'DejaVu Sans Mono','Menlo',monospace"
        font-size="26" fill="#0f4cff">imdanialrashidi.github.io</text>
</svg>`;

await mkdir(path.resolve("public"), { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(path.resolve("public/og-default.png"));
console.log("wrote public/og-default.png");
```

Notes:
- Escape `&` as `&amp;` inside SVG (as shown).
- Do NOT reference `/fonts/*.woff2` via `@font-face` here — librsvg/sharp
  text rendering uses system fonts only; Geist will apply on machines that
  have it and fall back cleanly elsewhere.

**Verify**:
```bash
node scripts/generate-og.mjs
test -f public/og-default.png && node -e "const s=require('sharp'); s('public/og-default.png').metadata().then(m=>{console.log(m.width,m.height,m.size)})" 
```
Expected: `1200 630` and file size between 15_000 and 500_000 bytes. Also
view the PNG once (any image tool) — flat canvas, four text lines, blue top
bar, nothing clipped.

### Step 2: Wire the meta tags in Layout

In `src/layouts/Layout.astro` frontmatter, compute one absolute URL next to
the existing `canonicalURL` line:

```astro
const ogImageURL = new URL("/og-default.png", site.url).toString();
```

Then inside the social block, add after the `og:url` meta:

```astro
    <meta property="og:image" content={ogImageURL} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content={`${site.shortTitle} — Software & Product Builder`} />
```

and upgrade the Twitter card (replace the `twitter:card` summary line and add
an image tag alongside the other twitter: metas):

```astro
    <meta name="twitter:card" content="summary_large_image" />
    ...
    <meta name="twitter:image" content={ogImageURL} />
```

Keep every other line of the block untouched. Absolute URLs are required by
the OG spec — `site.url` already provides them.

**Verify**:
```bash
npm run build && grep -o 'property="og:image" content="[^"]*"' dist/index.html
grep -c 'name="twitter:image"' dist/index.html
grep -o 'content="summary_large_image"' dist/index.html | head -1
```
Expected: `https://imdanialrashidi.github.io/og-default.png`, count `1`,
`summary_large_image` present. Confirm `test -f dist/og-default.png`.

### Step 3: Full gate

```bash
bash scripts/verify.sh
```

**Verify**: exit 0 (doctor, harness tests, astro check, astro build).

## Test plan

No unit tests (static asset + meta tags). Deterministic checks: Step 1's
metadata probe, Step 2's built-HTML greps on `dist/index.html` plus one inner
page (`grep -o 'og:image' dist/work/noveno/index.html`), full gate. Visual
sanity of the PNG is a human glance — attach the file path in your report.

## Done criteria

ALL must hold:

- [ ] `scripts/generate-og.mjs` runs clean; regenerating produces a valid
      1200×630 PNG at `public/og-default.png`
- [ ] Built HTML on home + one inner page contains absolute
      `og:image`, dimensions, alt, and `twitter:image`;
      `twitter:card` = `summary_large_image`
- [ ] No new dependencies in `package.json`
- [ ] `bash scripts/verify.sh` exits 0
- [ ] No out-of-scope files modified
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back if:

- `sharp` fails to render text (missing librsvg in environment) after one
  install-fix attempt — report the exact error; do not switch libraries.
- The Layout social block differs materially from the excerpt (drift).
- You find an existing og:image implementation elsewhere — reconcile and
  report instead of duplicating.

## Maintenance notes

- Re-run `node scripts/generate-og.mjs` whenever name/title/role wording
  changes; commit the refreshed PNG in the same change.
- When real project screenshots exist, per-project OG images can reuse this
  exact generator pattern parameterized per project — design the follow-up
  then; don't pre-build it now.
- Reviewer scrutiny: confirm the image reads well at small card sizes
  (~500px wide previews) and that dark-mode users still get a legible card
  (light canvas is intentional and matches the brand's light-first rule).

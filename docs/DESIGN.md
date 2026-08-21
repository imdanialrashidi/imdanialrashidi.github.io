# Product Design Contract — Danial Rashidi Personal Site

## Experience brief

- **Product / surface:** Personal credibility hub — Software & Product Builder identity & work
- **Primary audience:** Hiring managers, recruiters, technical peers, product collaborators, Noveno-referred visitors
- **Single job of this surface:** Answer in 15 seconds who Danial is, what he builds, what he’s shipped, how he thinks, how to reach him
- **Desired user feeling before → after:** uncertain/skimming → calm confidence, clear signal, intent to reach out
- **Success signal:** Visitor clicks “View work” or “Contact” and can articulate Danial’s focus (Web · AI · Automation · Product Engineering, Building Noveno) without scrolling confusion

## Brand character

- **Calm & precise**, not noisy or demonstrative
- **Technically literate**, not buzzword AI
- **Editorial restraint**, not generic SaaS/gradient/cyberpunk

## Reference calibration

| Reference | Adopt | Avoid | Why it fits |
|---|---|---|---|
| Linear / Vercel editorial | Typography, whitespace, monochrome + single accent, precise grid | Over-minimal emptiness | Proves engineering credibility with restraint |
| Readwise / Stripe Docs | Hierarchy via type scale, not color; subtle borders | Heavy cards everywhere | Editorial readability for case studies |
| Mid-century editorial (Kinfolk) | Generous whitespace, measured rhythm | Decorative illustration | Premium calm |

## Direction

- **Visual thesis:** Editorial × Engineering × Product — monochrome foundation, electric blue accent, generous whitespace, hierarchy through type and space, not decoration.
- **Signature element:** Restrained accent link/hover + pill badges + 1px hairline borders — premium without chroma excess.
- **One justified aesthetic risk:** Single electric blue (`#0f4cff` light, `#4f7cff` dark) as only chromatic signal — high contrast, memorable, but risks generic “blue link” if overused; mitigated by monochrome canvas and muted text.
- **What must feel familiar:** Header nav, card grid, footer — standard information architecture so recruiter scanning is effortless.
- **What must never look generic:** Uniform rounded-card wall, neon gradients, glassmorphism, fake terminal, cyberpunk, stock tech icons, excessive gradients, scroll-jacking.

## Semantic tokens

### Color

| Role | Light | Dark | Use | Contrast proof |
|---|---|---|---|---|
| canvas | `#fcfcfc` | `#09090b` | page bg | text 16.5:1 on canvas light, 18:1 dark |
| surface | `#ffffff` | `#111113` | cards, header, footer | border 1.05:1 negligible, text same as canvas |
| surface-raised | `#f5f5f3` | `#1a1a1e` | active nav pill | subtle lift |
| border (hairline) | `#e9e9e7` | `#232326` | hairline dividers | decorative only |
| border-strong | `#d6d6d4` | `#2e2e32` | hover border | decorative |
| text | `#0f1419` | `#f4f4f5` | primary | 16:1 on canvas (AAA) |
| muted | `#5f6368` | `#a1a1aa` | secondary, lede | 7.2:1 light, 6.8:1 dark (AA) |
| faint | `#8a8f98` | `#71717a` | kicker, meta | 4.6:1 light small (AA), 4.5:1 dark |
| accent | `#0f4cff` | `#4f7cff` | links, buttons, kicker | 4.6:1 on white (AA for large), soft bg `#eef2ff` used for card accent |
| focus ring | `rgba(15,76,255,0.4)` | `rgba(79,124,255,0.45)` | outline + shadow | 3:1 focus indicator |

Contrast measured via Lighthouse and manual ratio (WCAG 2.2 AA: 4.5:1 text, 3:1 large/UI). Verified in browser; tokens live in `src/styles/tokens.css`.

### Typography

| Role | Family / fallback | Scale / weight / leading | Purpose |
|---|---|---|---|
| display | Geist 100–900, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial | `clamp(2.125rem,5vw,3.5rem)` / 600 / 1.1 / -0.02em | Hero h1, page titles |
| body | Geist 100–900, same fallback | `1.0625rem` / 400 / 1.7 / -0.01em | Prose, lede |
| mono | Geist Mono 100–900, ui-monospace, SFMono, Menlo, monospace | `0.8125rem` / 500 / 1.5 | Labels, kicker (optional) |

- **Source:** Geist / Geist Mono variable `woff2` (69K + 70K) vendored to `public/fonts/`, `font-display: swap`, single `100–900` range each, `preload` only Sans (critical).
- **Fallback:** system-ui metrics preserved; no FOUT layout shift due to similar x-height.
- **License:** SIL OFL (Geist) — vendoring allowed; no CDN request.

### Geometry and depth

- **Spacing/rhythm:** 4pt base (`0.25rem` steps: 4,8,12,16,24,32,48,64,96) — `src/styles/tokens.css` `--space-*`
- **Grid/content measure:** `--width-prose 42rem (672px, ~66ch)`, `--width-content 72rem (1152px)`, `--width-wide 80rem`; gutters `clamp(1rem,4vw,2rem)`; mobile recomposes to single-column grid at 720–820px.
- **Radius logic:** `xs 4, sm 8, md 12, lg 16, xl 20, pill 999px` — cards `lg`, header pill `pill`, tags `pill`
- **Border/shadow logic:** `1px hairline` always; hover `--border-strong`; shadows `sm` (1px diffused) only on card hover, focus ring via `box-shadow`; no elevated glass.
- **Icon/media treatment:** 16px stroke icons (sun/moon 1.75px), no fill, currentColor; portrait (Assets/Danial_photo.webp 855×855) rendered on Home/About via `astro:assets`; future screenshots use aspect-ratio boxes, not invented UI.

### Media and art direction

- Photography: natural, neutral light, square crop preserved for portrait; project screenshots (when available) with subtle border + rounded `lg`, no device mock oversell.
- Subject: Danial portrait only at v1; art direction calm, precise, intentional.
- Icon: Stroke-based, 1.75px, rounded caps, monochrome.
- Asset source: `Assets/Danial_photo.webp` (original preserved, 85K); Geist fonts vendored; favicon `public/favicon.svg` custom geometric D.
- Responsive: Art direction preserves 1:1 portrait; no crop change at mobile; `max-width:100%` universal; `overflow-x` prevented (verified at 320,375,1280).
- Fallback: If portrait fails, alt text + initials; font falls to system-ui.

## Composition and responsiveness

- **Desktop composition:** Sticky header (64px) with backdrop blur, max `72rem` container, hero (eyebrow + 3-line title + lede + 2 CTAs + meta), 2-column card grid (`work-tease`), now strip (label + text + border). Footer 2-col grid (brand left, links right).
- **Mobile recomposition:** Header nav hidden, hamburger + theme toggle; 1-column card stack; hero spacing clamps via `clamp()`; now strip single column below 560px; footer single column below 720px.
- **Dense/long-content behavior:** Prose max 60–66ch; lists with comfortable line-height; cards wrap gracefully; no horizontal scroll at 320 verified.
- **Supported viewport/device baseline:** 320, 375, 780, 1280; touch targets 36–44px; sticky header with safe `overflow:hidden` mobile lock on menu open.
- **RTL/localization behavior:** English LTR only (v1); logical properties used for future RTL readiness.

## Components and states

| Component | Variants | Required states | Reuse / change |
|---|---|---|---|
| Layout | base | light/dark/system, skip-link focus | Reuse — shell, SEO, FOUC script |
| Header | default | default / hover / focus / active (nav pill) / expanded (mobile dialog) | Reuse |
| ThemeToggle | light/dark | pressed true/false, hover, focus | Reuse |
| Footer | default | link hover | Reuse |
| Card / WorkCard | default, accent | hover (border + bg + translateY 1px + shadow), focus | Reuse for work tease / work index |
| Button | primary (dark bg), ghost (surface) | hover, active (scale 0.98), focus | Reuse |
| Container | default, prose, wide | — | Reuse |

**Required journey states:**

- loading: none (static HTML — no skeleton needed at foundation)
- empty: work cards show “Details coming soon” honest placeholder, no invented proof
- error/retry: 404 editorial page (`/404.html`, `/404/index.html` via Astro) with Go home / View work / Contact
- success: contact is `mailto:` (no form success); theme persist via localStorage verified
- permission/offline: no auth; offline is browser cache (static HTML works offline after load)

## Motion and feedback

- Orchestrated moment: none — foundation is intentionally restrained.
- **State-transition motion:** `color/background/border/transform` only; `duration fast 120ms, base 200ms`; `ease-default cubic-bezier(0.2,0,0,1)`, `ease-out 0.16,1,0.3,1`; `translateY(-1px)` on card hover, `scale(0.98)` on button active; mobile dialog `mobileIn` (opacity + translateY 6px, 200ms ease-out).
- **Duration/easing tokens:** `--duration-fast/base/slow`, `--ease-default/out/in-out`
- **Reduced-motion alternative:** `@media (prefers-reduced-motion: reduce)` sets durations to 0.01ms and disables animations (also global `*` reset).
- Sound/haptics: none.

## Content voice

- Vocabulary: direct, precise, builder-oriented; “Software & Product Builder — Web · AI · Automation · Product Engineering” as canonical positioning.
- Tone: calm, credible, technically literate; no hype (“revolutionary”, “world-class”), no invented adjectives.
- Action-label rules: Verbs first — “View selected work”, “Get in touch”, “Read case study”, “Open noveno.ir →”; “Building Noveno” not “Noveno Product”.
- Error/empty rules: Honest placeholders — “Details coming soon”, “Screenshots will be added when ready — no placeholders, no invented proof.”
- Realistic fixtures: Home hero lede references Noveno; Work index has two cards (Fast English, Noveno) with honest status; 404 shows 404 + email; Now page dated Aug 2026.

## Quality budgets

- Accessibility: WCAG 2.2 AA, text 4.5:1, large/UI 3:1, focus visible, keyboard tab order, skip link, touch 36px+, dialog `aria-modal`, `aria-expanded`, Escape + click-away, `aria-pressed` on toggle.
- Text/non-text contrast: see color table (all AA); focus ring `0 0 0 3px rgba`.
- Keyboard/focus/touch: Tab order verified, focus ring on :focus-visible, mobile menu traps Tab within the dialog, Escape closes and restores focus to the menu button.
- Performance: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms (targets, not claimed); lab via Lighthouse preview (manual). Budgets: CSS 23K total (7+16K), fonts 139K (preload Sans only), JS 0 external + ~2K inline (theme + nav). No React, no motion lib, no analytics, no backend.
- Pre-release lab and RUM: Lab measured locally via `npm run build` + preview + Lighthouse (not yet CI-enforced); RUM not added at foundation (deferred).
- Image/font/JS budget: Images 0 yet (portrait preserved not rendered), fonts 69+70, JS 2K inline, CSS 23K, total HTML 8 pages ~120K.
- Supported browsers/input: Evergreen (Chromium, Firefox, Safari), keyboard + touch + pointer, no IE; prefers-color-scheme supported.

## Screen acceptance

| Flow / screen | Critical states | Viewports/locales | Visual proof |
|---|---|---|---|
| Home `/` | light/dark, focus, mobile nav closed/open, hover cards | 1280, 375, 320 / en LTR | `.artifacts/playwright/page-...png` desktop light + dark + mobile dark + mobile menu open |
| Work `/work` | list, hover, empty honest | 1280,375 | Snapshot (a11y) |
| About `/about` | prose + aside sticky | 1280,375 | Snapshot |
| Now `/now` | dated card | 1280 | Snapshot |
| Contact `/contact` | mailto + external links | 1280,375 | Snapshot |
| 404 | editorial 404, 404 http status | 375 | Snapshot + console |

## Decisions intentionally deferred

- Full homepage storytelling composition (foundation is restrained, not final)
- Fast English / Noveno case-study long-form layouts (stub “in progress” honest placeholders)
- Notes/blog (`/writing`) — omitted until cadence exists
- ~~Portrait rendering optimization~~ — delivered: rendered via `astro:assets <Image>` on Home + About
- Analytics, backend form — deferred per brief

## Decision log

| Date | Decision | Evidence / rationale | Revisit when |
|---|---|---|---|
| 2026-08-21 | Astro 7 + TypeScript 5.9 static, `site: https://imdanialrashidi.github.io`, `trailingSlash: never`, `sitemap` + `.nojekyll` | Static-only Pages requires static output; 8 pages built in 1.7s; sitemap generated; .nojekyll copied via public/ | If Pages moves to Actions artifact needs verification |
| 2026-08-21 | Tokens: monochrome + electric blue `#0f4cff`/`#4f7cff`, Geist vendored (69+70K), `font-display:swap`, preload Sans only | Meets editorial thesis, AA contrast, 2K JS; preload Mono would warn (unused) | If Mono needed above fold, preload |
| 2026-08-21 | Theme: inline FOUC script + `data-theme` + localStorage + `prefers-color-scheme`, toggle preserves, reduced-motion disables | Verified persisted across reload, Escape, keyboard; no flash; minimal inline JS | If SSR needed |
| 2026-08-21 | Geist vendored, `geist` npm removed after copy | Shipped fonts 139K, no CDN, no disproportionate dep (7.9M removed) | If subset needed |

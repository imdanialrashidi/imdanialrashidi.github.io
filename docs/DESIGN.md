# Design Contract: Danial Rashidi personal site

Current for the 2026-11-23 rebuild. This document owns the visual and interaction contract for the English site at <https://imdanialrashidi.github.io>. System and operations live in [ARCHITECTURE.md](ARCHITECTURE.md); outcomes and non-goals in [PRODUCT.md](PRODUCT.md); release evidence rules in [QUALITY.md](QUALITY.md). Tokens and component CSS in the repository are the implementation of this contract, not a second source of truth.

## Experience brief

| Field | Contract |
| --- | --- |
| Surface | English personal credibility site for Danial Rashidi, software and product builder. Static HTML, one page tree, no app shell. |
| Primary audience | Hiring managers and recruiters judging a builder; technical peers and product collaborators; visitors arriving from the Persian sibling site or from Noveno. |
| Single job | In about 15 seconds, show who Danial is, what he has shipped, how he works, and how to reach him, with evidence specific enough to be believed. |
| Feeling before | Skeptical skimming, comparing against polished portfolios whose claims are hard to check. |
| Feeling after | Calm confidence: the work is real, the limits are stated, the next action is obvious. |
| Success signal | The visitor opens a case study or reaches /contact/ and emails, and can restate the focus without re-reading. |
| Hard constraints | Static GitHub Pages, no analytics, cookies, forms, backend, CMS or auth; English only; every proof point must be real. |

## Brand character

- Editorial premium: warm paper, ink type, printed-page rhythm. Not a SaaS dashboard and not a dark developer-portfolio template.
- Confident, not loud: declarative sentences, one accent color, no badges, urgency devices or decorative numbers.
- Specific and honest: named projects, real screenshots, stated limits. No invented metrics, testimonials, clients or outcomes.
- Technically literate: mono metadata, real stack names, precise verbs. Not buzzword AI.
- Human and warm: the portraits, the travel photographs and the first-person voice carry personality. Decoration does not.

## Direction

**Visual thesis.** A printed portfolio translated to the web: warm paper canvas, ink typography, hairline rules, one vermilion signal, a serif display voice over a technical sans and mono ledger labels. Credibility comes from the work and the restraint, not from gradient effects.

**Signature element.** The vermilion italic phrase that closes a serif display line: "system that works" on home, "work better" in the CTA band, "useful" on contact. It appears at most once per screen, is always Instrument Serif italic in `--accent`, and carries an emphasis a plain word cannot. The supporting editorial system is the numbered section head: mono index, hairline rule, serif title.

**One justified aesthetic risk.** The site leads with serif display and warm paper in a category that defaults to monochrome sans, dark canvases and gradient hero blocks. The risk is reading as literary rather than technical. Mitigation: Geist for every body and UI string, Geist Mono for all metadata, real interface screenshots, and no decorative illustration.

**Must feel familiar.** Sticky header with plain text navigation; a work index that scans like a list; a case study with facts beside the prose; an email address large enough to act on; a footer that repeats every route.

**Must never look generic.** Equal rounded-card grids for every section, glassmorphism, neon or gradient glows, fake dashboards or terminals, stock technology icon walls, cursor effects, scroll hijacking, invented metrics or award badges.

## Dials

| Dial | Setting | What it means here | What is explicitly not done |
| --- | --- | --- | --- |
| ENERGY | 2 of 5 | Confident and declarative: large serif statements, one accent, generous quiet. | No slogan stacking, urgency labels, countdowns or oversized statistics. |
| RHYTHM | 3 of 5 | Asymmetric editorial sections: numbered heads, alternating feature grid, prose beside a facts rail, hairline separators. | No uniform full-width card grid, no centered-everything pages, no auto-carousel. |
| MOTION | 2 of 5 | Feedback on hover and focus, one menu entrance, cross-document view transitions. | No scroll hijacking, parallax, autoplay, looping animation or long eases. |

## Color

### Tokens

| Token | Light | Dark | Role |
| --- | --- | --- | --- |
| `--bg` | `#f6f2ea` | `#11100e` | Page canvas: warm paper, light-first. |
| `--bg-raised` | `#fffdf8` | `#171613` | Raised surfaces: screenshot frames, chips, buttons, header controls. |
| `--bg-sunk` | `#efe9dd` | `#0b0a09` | Sunken bands: footer, about teaser, code blocks, media wells. |
| `--ink` | `#191612` | `#f4f0e6` | Primary text and the inverted button fill. |
| `--ink-soft` | `#4e483f` | `#b5ae9f` | Body prose, ledes, secondary links. |
| `--ink-faint` | `#6b655a` | `#8a8375` | Metadata, captions, eyebrows, default status dot. |
| `--line` | `#ded5c4` | `#2b2823` | Hairline dividers and borders. |
| `--line-strong` | `#c2b7a3` | `#3d3831` | Hover borders, inline underlines, decorative dots. |
| `--accent` | `#b8320c` | `#ff6a3a` | The single signal: emphasis, hover, index numbers, focus ring. |
| `--accent-hover` | `#8f2508` | `#ff875f` | Accent hover fill and text. |
| `--on-accent` | `#fffdf8` | `#11100e` | Text on an accent fill. |
| `--accent-wash` | `#f1dbd2` | `#2b1a12` | Reserved tint. No current component references it. |
| `--status-live` | `#1f7a3d` | `#5fd08a` | Live status dot only, always paired with a text label. |
| `--status-building` | `#a3570a` | `#e9a23b` | Building status dot only, always paired with a text label. |
| `--focus` | `#b8320c` | `#ff6a3a` | Focus ring, same value as the accent. |
| `--shadow` | `20 16 10` | `0 0 0` | RGB triple for the soft screenshot shadow. |

Theme is selected before first paint: stored `light` or `dark` wins, otherwise `prefers-color-scheme`. The CSS also carries a `prefers-color-scheme` fallback under `:root:not([data-theme])` for the rare no-JavaScript first paint. There is no third theme and no per-page override.

### Contrast proof

Measured with the WCAG 2.x relative-luminance formula on 2026-11-23 from `src/styles/tokens.css`. The text floor is 4.5:1 and the non-text UI floor is 3:1. `on-accent` is paper (`#fffdf8`), not pure white.

| Pair | Light | Dark | Verdict |
| --- | --- | --- | --- |
| ink on bg | 16.15 | 16.71 | AAA |
| ink-soft on bg | 8.10 | 8.62 | AAA |
| ink-faint on bg | 5.18 | 5.06 | AA |
| accent on bg | 5.37 | 6.68 | AA |
| on-accent on accent | 5.90 | 6.68 | AA |
| on-accent on accent-hover | 8.48 | 8.04 | AA |
| weakest text pair on raised, ink-faint on bg-raised | 5.68 | 4.81 | AA |
| weakest text pair on sunken, ink-faint on bg-sunk | 4.78 | 5.26 | AA |
| status-live dot against bg (non-text) | 4.81 | 9.85 | 3:1 |
| status-building dot against bg (non-text) | 4.79 | 8.78 | 3:1 |
| focus ring accent against bg (non-text) | 5.37 | 6.68 | 3:1 |

Notes:

- Every text pair used by a component passes AA; the weakest is 4.78:1 (faint text on the light sunken band).
- Hairlines and strong borders measure 1.6 to 2.0 against the canvas. They are separators and secondary outlines, never the only state signal: hover and focus also change text color, underline, fill or elevation.
- Status color appears only as a 0.45rem dot. The uppercase mono label carries the meaning, so the state never depends on color alone.
- The focus ring is `2px solid var(--focus)` with `3px` offset and a `1px` radius. It is the same accent color, so it measures at least 4.96:1 against every surface.

## Typography

### Families and roles

| Role | Family and fallback | Weight | Size and leading | Where |
| --- | --- | --- | --- | --- |
| Display | Instrument Serif, Georgia, Times New Roman, serif | 400 regular and 400 italic | `--display-h1` clamp(2.875rem, 7.2vw, 6rem), page overrides 2.75rem to 7rem; `--display-h2` clamp(2.125rem, 4.6vw, 3.375rem); `--display-h3` clamp(1.4375rem, 2.2vw, 1.875rem); leading 0.98 to 1.15; tracking -0.025em to -0.01em | h1 to h3, hero and page titles, section heads, case titles, pull quotes, footer email |
| Body and UI | Geist, system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif | Variable 100 to 900, used at 400, 500 and 600 | `--text-base` 1.0625rem (17px) at 1.65; `--text-lg` 1.1875rem at 1.6; `--text-sm` 0.875rem; `--text-xs` 0.75rem | Body copy, ledes, navigation, buttons, non-metadata labels |
| Metadata | Geist Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace | Variable 100 to 900, used at 400 and 500 | `--text-xs` with 0.03em to 0.07em tracking, usually uppercase; `--text-sm` for inline mono | Eyebrows, dates, statuses, project meta, captions, chips |

Font loading and licensing:

- Four woff2 files are vendored in `public/fonts`: instrument-serif-regular 21K, instrument-serif-italic 22K, geist-latin 28K, geist-mono-latin 31K (about 103K total). SIL Open Font License 1.1 with license files beside them.
- `Layout.astro` preloads the serif regular and Geist only. Geist Mono and the serif italic are not preloaded and load on first use.
- `font-display: swap`; no CDN, no npm font runtime, no system-font-only fallback aesthetic. The fallback stacks are metric-tolerant but not claimed as metric-identical.

### Scale tokens

| Token | Value | Use |
| --- | --- | --- |
| `--text-xs` | 0.75rem | Mono labels, eyebrows, captions, status text |
| `--text-sm` | 0.875rem | Notes, dense meta, small links, footer bottom |
| `--text-base` | 1.0625rem | Body copy and most interface text |
| `--text-lg` | 1.1875rem | Ledes on routes that use the large lede |
| `--display-h1` | clamp(2.875rem, 7.2vw, 6rem) | Page h1, plus per-page clamp overrides |
| `--display-h2` | clamp(2.125rem, 4.6vw, 3.375rem) | Section and page section titles |
| `--display-h3` | clamp(1.4375rem, 2.2vw, 1.875rem) | Card and sub-section titles |
| `--leading-tight` | 1.02 | Display headings |
| `--leading-snug` | 1.18 | h2 and h3 |
| `--leading-body` | 1.65 | Body copy |

Reserved tokens: `--text-xl` and `--display-quote` are defined in `tokens.css` but no current component uses them. Adding a use is a design decision, not a free substitution.

Measure: prose is capped at `--measure` (40rem); ledes at 34rem to 38rem; section notes at 26rem to 34rem; hero titles at 14ch to 18ch. Long body text is never set to full container width.

## Layout and responsive recomposition

### Primitives

| Primitive | Value | Use |
| --- | --- | --- |
| Container | `width: min(100% - 2 * gutter, 76rem)`, centered; wide variant 84rem | Every band and page hero |
| Gutter | clamp(1.25rem, 4vw, 3rem) | Page side padding, about 20px at 320 and up to 48px on desktop |
| Grid | 12 columns, gap clamp(1rem, 2.5vw, 2rem) | Composition sections; 6 columns at 860px and below |
| Section rhythm | padding-block clamp(3.5rem, 8vw, 7.5rem), top hairline unless the section is flush | Vertical bands across routes |
| Header | Sticky, height 4.25rem, translucent paper with a 14px backdrop blur, bottom hairline | All routes |
| Shape | Radius 2px for chips, small controls and media frames; 6px for buttons, shots and images; 1px hairline everywhere | Elevation is a hairline plus one soft shadow on screenshot and portrait media frames only |
| Measure | 40rem prose, 34rem to 38rem lede | Reading comfort |

The `--space-1` to `--space-8` scale and `--radius-md` / `--radius-lg` are defined but not referenced today; components use rem and clamp values in their scoped styles. Do not build a second spacing system on top; migrate only as a deliberate change.

### Screen composition

| Route | Composition |
| --- | --- |
| `/` | Hero in a 7:4 split (statement and lede left, portrait right), selected work as alternating media and body features at about 1.3:1, a compact "also in the index" list, capabilities and principles in two-column blocks, three travel cards, an about teaser on the sunken surface, CTA band. |
| `/work/` | Page hero with a product and client count plus period, then two numbered groups (products, client work) as full-width rows with index, title, summary, metadata and thumbnail. |
| `/work/<slug>/` | Breadcrumbs, case hero with kicker and summary, priority screenshot, prose at 40rem beside a sticky facts rail, then a next-project band. |
| `/travels/` | Page hero, three 4:5 photograph cards, Instagram CTA band. |
| `/about/` | Hero with portrait at about 1.45:1, year timeline, methods in a two-column split, now and beyond-software columns, elsewhere list. |
| `/now/` | Dated hero, numbered current-work list, learning and open-to columns, based-in note. |
| `/contact/` | Email-led hero, three help capabilities, channel list, pre-write notes. No form. |
| `/404` | Narrow editorial column with recovery links. Noindex. |

### Responsive recomposition

Breakpoints are shared and deliberate: 1100 (availability label hidden), 960 (desktop navigation becomes the dialog menu), 900 (hero and feature grids collapse, case rail moves under the prose), 860 (12-column grid becomes 6, footer top becomes one column), 760 (now columns collapse), 560 (travel cards and footer link columns collapse, hero portrait returns below the text), 480 (brand role hidden).

| Viewport | Navigation and header | Layout | Type and space |
| --- | --- | --- | --- |
| 320 | Brand mark and menu button plus theme toggle. Menu is a full-screen native dialog. | One column on every route. Hero starts with text, portrait after it. Footer link columns become 2. Travels single column. No horizontal scroll. | Smallest clamps: display h1 about 2.75rem (now page), section padding 3.5rem, gutter 20px. Primary controls stay at least 44px tall. |
| 375 | Same as 320. | Same single-column stack. | Same clamps; the lede and body keep 17px and 1.65 leading. |
| 768 | Dialog menu. Availability label hidden. | Hero and features single column with the portrait above the text (the 561 to 900 band). Travels 2 across. Case facts below prose. Footer top one column with 3 link columns. Now page still 2 columns. | Middle of every clamp range. |
| 1280 | Text navigation, availability label, sticky header. | Container capped at 76rem (1216px), 12-column grid, hero 7:4, alternating features, travels 3 across, sticky facts rail beside prose. | Largest clamps up to 6rem to 7rem display, gutters near 48px. |

Recomposition principles: reorder instead of shrink; keep one reading column; never hide content to fit; preserve touch targets and focus order; fluid type clamps rather than discrete size jumps; imagery keeps its intrinsic width and height attributes so reflow does not shift.

## Components and states

| Component | Variants | Required states | Notes |
| --- | --- | --- | --- |
| Layout and head | One shell | Light, dark, system, no-JavaScript first paint | Canonical, OG, JSON-LD, skip link, font preloads, theme guard live here. |
| Header | Sticky shell with brand, text nav, availability status, theme toggle, menu control | Current page, hover, focus-visible, dialog open and closed | Desktop nav is plain text with an accent underline for the current page. The narrow menu is a native `dialog` with backdrop, Escape, focus containment and focus return. |
| Theme toggle | Sun and moon glyphs | `aria-pressed` false and true, label swaps, hover, focus | The current theme is applied before paint; storage failure still toggles for the page. |
| Section head | Optional index, title, optional note, optional "all" link | Default, responsive two-column with right-aligned note | Mono index plus hairline plus serif title is the shared editorial device. |
| Project feature | Alternating media and body, real screenshot or plate | Normal, hover and focus-within, flipped | Title link is the main affordance; metadata carries role, year and honest status. |
| Project row | Full-width index, title, summary, meta and thumbnail | Hover, focus-visible, compact plate fallback | One stretched link per row; hover underlines the title and lifts the thumbnail. |
| Project plate | Typographic plate for a project without a public screen | Compact and full | `role="img"` with an accessible label that says no screenshot exists. Never an invented interface. |
| Shot | Responsive image with optional caption and meta | Priority and lazy loading | Frame is raised surface, hairline border and one soft shadow; caption uses mono metadata. |
| Travel card | 4:5 photograph, date label, destination, note | Hover image scale, reduced-motion off | Date labels keep both Iranian and Gregorian years. |
| CTA band | Heading, lede, primary email, outline contact, socials | Default, hover, focus | One closing next step, never repeated mid-page. |
| Footer | Sunken band with email, three link columns, bottom line | Hover, focus | Repeats every route and the Persian sibling site. |
| Buttons and links | Primary ink fill, outline, inline `.link` and `.link--quiet` | Hover, active, focus-visible | Primary hover turns accent. Arrow moves 0.15rem on hover. |
| Status label | Live, building, in development, shipped | Dot plus uppercase mono label | Dot mapping: live green, building amber, in development faint, shipped neutral faint. Text always carries the meaning. |
| Prose | Case study body | Headings, lists, blockquote, code, rule, links | Serif h2 and h3, accent list markers, blockquote rule in accent, measure 40rem. |

Journey and environment states:

- Loading: none. Pages are complete static HTML, so no skeleton or spinner is presented.
- Empty: not reachable from current content. Eight case studies and three travel notes are schema-required; a project without a real cover degrades to the typographic plate instead of an empty frame.
- Error: 404 only, with recovery links and no index. There is no form, request or account failure state.
- Success: email handoff to `mailto:`; there is no in-page success screen.
- Permission and account: none.
- No JavaScript: all content and links remain usable; theme follows the system setting; the desktop nav works above 960; below that the footer is the fallback route list and the menu button does nothing.
- Reduced motion: transitions and animations are effectively removed; see Motion.

## Motion

Motion is CSS only. There is no animation library, no ClientRouter and no scroll-driven JavaScript.

| Gesture | Implementation | Timing |
| --- | --- | --- |
| Hover and focus feedback | Color, background, border, underline and small translation changes | 140ms fast for color and small feedback, 220ms base for bordered surfaces |
| Project row and travel media | Thumbnail translateY(-2px) and scale(1.025); travel photo scale(1.03) | 220ms and 420ms |
| Menu entrance | Native dialog, opacity and translateY(-0.75rem) | 220ms |
| Cross-document view transitions | `@view-transition { navigation: auto }`, root fade out and in | 140ms out, 180ms in |
| Entrance utilities | `.rise` 420ms and opt-in `.reveal` scroll-linked fade gated by `@supports (animation-timeline: view())` | Defined in `global.css`; current routes do not apply either class |
| Reduced motion | Global 0.01ms override for animation and transition duration, scroll-behavior auto, dialog and media transitions off | `prefers-reduced-motion: reduce` |

Motion rules: animate opacity and transform, never layout; one gesture per element; no looping ambient animation; no scroll hijacking, sticky scene or parallax; view transitions are progressive enhancement and other browsers navigate normally.

## Content voice

- First person, calm, specific. Short declarative sentences. No hype adjectives, no "revolutionary", "world-class" or "passionate".
- No em dash character in source copy. `tests/seo-metadata.test.mjs` fails any `src/pages`, `src/components`, `src/content`, `src/data`, `src/lib` or `src/layouts` file containing U+2014.
- No invented proof: no metrics, testimonials, client logos, awards or fabricated screenshots. The content schema has no metric fields; covers come only from the eight real captures documented in `src/assets/SOURCES.md`; Fast English has no public screen and renders the plate.
- Status must match reality. The visible label comes from `statusLabel` in project frontmatter: "Live product · v1.0.0", "Live, in development", "Live, growing", "Released, v0.2.1", "Shipped 2024".
- Actions are verbs: "See the work", "Read the product case study", "Start a conversation", "Read the now page", "Visit noveno.ir". Labels never say "click here".
- Headings are sentence case. Uppercase is reserved for short mono metadata, never for sentences.
- Copy states limits. Case studies say what is unfinished or out of scope; the product states it has no tracker, form or analytics, and that is a promise the architecture keeps.
- The Persian sibling site is named `danialrashidi.ir` and linked as an outbound anchor marked `lang="fa"`, with `hreflang="fa"` where it is presented as the Persian home. There is no page-level alternate and no claim of a translated page pair.

## Accessibility targets

Target: WCAG 2.2 AA.

- Contrast: every text pair passes 4.5:1, large text passes 3:1, non-text indicators pass 3:1; values are in Color above.
- Focus: `:focus-visible` gets a 2px accent outline at 3px offset on every interactive element; the skip link moves into view on focus.
- Keyboard: all navigation, project rows, buttons, the theme toggle and the dialog are keyboard operable. The native dialog handles focus containment and Escape, and returns focus to the menu button. No custom keyboard traps.
- Semantics: one `h1` per page (enforced by the built-artifact check), landmark header, nav, main and footer, real `figure` and `figcaption`, descriptive alt text for every image, `aria-current="page"` on the active route, `aria-pressed` on the theme toggle, `aria-expanded` plus `aria-controls` on the menu button, `role="img"` and a spoken label on typographic plates.
- Motion: `prefers-reduced-motion: reduce` removes transitions, animations and smooth scrolling.
- Reflow and zoom: usable at 320 CSS px without horizontal scrolling and at 200% text zoom without loss of content or function.
- Touch and pointer: primary controls are 44px or taller (buttons 48px, icon buttons 44px, navigation and list links 36px to 52px); inline prose links follow text flow and are exempt from that target.
- Language: document language `en`; Persian links carry `lang="fa"`, and the links that present the Persian home also carry `hreflang="fa"`.
- No content depends on color alone: status is dot plus label, current route is underline plus `aria-current`, links carry underlines, focus is a visible ring.

Lab evidence observed on 2026-11-23, not field data: Lighthouse accessibility 100 on home desktop and mobile, and accessibility 100 plus SEO 100 with zero failing audits on `/work/`, `/work/noveno/`, `/about/` and `/contact/`. These are lab runs and do not prove real-device or assistive-technology behavior.

## Quality budgets

| Surface | Budget | Current | Enforced by |
| --- | --- | --- | --- |
| Largest HTML page | Under 50K | 46K (home) | Manual review; total HTML has a hard check |
| All HTML | Under 700K | 434K across 15 files | `scripts/check-built-site.mjs` |
| CSS | External, hashed, no inline global sheet; about 47K total | 6 hashed files; indexable pages load the 19K shared sheet plus a 4K to 9K page sheet, and the 404 loads only the shared sheet | Artifact check for external stylesheets; source test for `inlineStylesheets: "auto"` |
| JavaScript | 0 external chunks | 0 chunks | Artifact check |
| Inline behaviour | Under 3K raw | About 2.6K: theme guard, theme toggle, menu dialog | Documented; payloads also include JSON-LD and speculation rules |
| Fonts | 4 woff2, under 110K, 2 preloads | 103K; serif regular 21K and Geist 28K preloaded | Source test for vendored fonts and licence files |
| Images | Responsive WebP, no file over 300K | 97 responsive variants; largest under 300K | Artifact check |
| Dist artifact | Under 8MB | 4.53MB (14 pages verified, 114 images) | Artifact check |
| Web Vitals targets | LCP 2.5s or less, CLS 0.1 or less, INP 200ms or less | Lab: desktop LCP 0.4s, CLS 0.001, TBT 0ms; mobile LCP 2.0s, CLS 0.001, TBT 0ms. INP has no lab measurement here. | Lighthouse lab, manual |
| SEO baseline | Sitemap and canonical agreement, unique titles and descriptions, one h1, JSON-LD parses | 14 sitemap URLs, all checks pass | Artifact check |

Performance is budgeted as a static-site contract rather than tuned per route: no external JS, images sized and responsive, fonts limited to four files, CSS hashed and cacheable. Lab results are pre-production signals; no field or RUM claim is made because no analytics is installed.

Supported baseline: evergreen Chromium, Firefox and Safari; keyboard, touch and pointer; no Internet Explorer. Viewports 320, 375, 768 and 1280 are the accepted set.

## Screen acceptance

| Screen | Required states | Viewports | Evidence status on 2026-11-23 |
| --- | --- | --- | --- |
| `/` | Light and dark, current route, hover and focus, dialog closed and open | 320, 375, 768, 1280 | Lighthouse desktop 100/100/100/100 and mobile 99/100/100/100 observed. Dark theme and open dialog are implemented and inspected in source but have no committed render, so their visual state is UNPROVEN. |
| `/work/` | Eight rows in two groups, real thumbnails, hover and focus | 320, 375, 768, 1280 | Lighthouse accessibility 100 and SEO 100, zero failing audits. Rendered list and hover states are UNPROVEN beyond the audit render. |
| `/work/noveno/` | Case hero, priority shot, prose, sticky rail, next project | 320, 375, 768, 1280 | Lighthouse accessibility 100 and SEO 100, zero failing audits. Sticky rail and long-content states are UNPROVEN beyond the audit render. |
| `/work/fast-english/` | Live screenshot hero, honest live-product status, long prose | 320, 375, 768, 1280 | Lighthouse accessibility 100 and SEO 100, zero failing audits. |
| `/travels/` | Three photographs, caption metadata, reduced-motion variant | 320, 375, 768, 1280 | Built-artifact checks only; no browser audit recorded for this route, so rendered state is UNPROVEN. |
| `/about/` | Portrait hero, timeline, methods, elsewhere | 320, 375, 768, 1280 | Lighthouse accessibility 100 and SEO 100, zero failing audits. |
| `/now/` | Dated hero, numbered list, two columns | 320, 375, 768, 1280 | Built-artifact checks only; no browser audit recorded, rendered state UNPROVEN. |
| `/contact/` | Email hero, channel list, no form | 320, 375, 768, 1280 | Lighthouse accessibility 100 and SEO 100, zero failing audits. |
| `/404` | Editorial not-found, recovery links, noindex | 320, 375, 768, 1280 | Built-artifact check confirms noindex and exclusion from the sitemap; rendered state is UNPROVEN. |

This table deliberately separates what was observed from what is assumed. A route can be accepted for content and contract while its visual state remains UNPROVEN; record a real render before claiming otherwise.

## Intentionally deferred

- Analytics, RUM, cookies and tag managers. The site is a promise of no tracking, so this is not a pending feature.
- Contact form, backend, newsletter and scheduled email. Email is the only channel by decision.
- CMS, database, authentication and comments.
- Blog or notes section under a new route. No cadence exists yet.
- Custom domain and CNAME. The GitHub Pages URL is the accepted host for now.
- Translation infrastructure. The Persian site is separate and not a 1:1 translation set, so no hreflang cluster is used.
- Image lightbox, video, carousels and scroll-driven storytelling.
- A committed browser screenshot set or CI visual regression lane. Lab audits are manual and recorded as observations.
- Third theme, density switch or user-selectable type scale.
- Search, filtering and pagination on the work index. Eight projects do not justify them.

## Decision log

| Date | Decision | Evidence and rationale | Revisit when |
| --- | --- | --- | --- |
| 2026-11-23 | Editorial premium direction: warm paper and ink with one vermilion accent, replacing any SaaS or dark-portfolio default. | `src/styles/tokens.css`; a credibility site for a builder reads better as a printed portfolio than as a product landing page. | The site becomes product marketing rather than personal credibility. |
| 2026-11-23 | Instrument Serif for display, Geist for body and UI, Geist Mono for metadata; self-hosted under OFL. | `global.css` font faces and preloads; 103K total, two preloads, no CDN; serif voice without losing technical scanability. | Language coverage, font size or licence constraints change. |
| 2026-11-23 | One accent, warm neutrals and status dots that never carry meaning alone; every measured pair passes AA. | Contrast table above and `tokens.css`; a second accent would dilute emphasis and complicate dark mode. | Status vocabulary grows beyond live, building, in development and shipped. |
| 2026-11-23 | Theme: system preference first, persisted choice, pre-paint guard; no theme flash. | `Layout.astro` inline guard, `ThemeToggle.astro`, `prefers-color-scheme` fallback in tokens. | The site is expected to follow the OS theme only. |
| 2026-11-23 | Motion budget 2: CSS feedback, one dialog entrance and MPA view transitions, no ClientRouter and no scroll effects. | `global.css` transitions, `@view-transition`, reduced-motion block; keeps 0 external JS and no hydration cost. | Richer choreography becomes a real product need within the performance budget. |
| 2026-11-23 | Real captures only. Every project now has a real screenshot; a future project with no public screen renders a typographic plate instead of invented UI. | Eight screenshots and provenance in `src/assets/SOURCES.md`; the Fast English capture is from the live product with support phone numbers hidden. | A future project has no public screen. |
| 2026-11-23 | Numbered section heads and the vermilion italic phrase are the only recurring editorial devices. | Home, work and now use numbered sequences; the italic phrase appears at most once per screen. | The information architecture changes enough that numbering loses sequence meaning. |
| 2026-11-23 | Persian sibling site is a marked outbound link, not a language alternate of this page. | `lang="fa"` and `hreflang="fa"` on anchors only; content sets are not 1:1 translations. | Translated page pairs are maintained and indexed. |

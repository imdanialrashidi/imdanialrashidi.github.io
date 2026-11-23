# English parity rebuild

Status: active. The working tree is complete and locally verified as of 2026-11-23. Independent review, owner commit and Pages deployment are pending.
Updated: 2026-11-23

Durable handoff for the English rebuild of the personal site. The pre-rebuild plan in `docs/exec-plans/active/premium-personal-brand.md` is stale history and must not be read as current state; keep it as a historical record and do not rewrite it.

## Goal

Rebuild the English site at parity with the Persian sibling `https://danialrashidi.ir`: the same project record in English (eight case studies), three travel notes, rewritten About, Now and Contact pages, a new editorial premium design with real screenshots as evidence, and a static SEO and performance foundation on GitHub Pages. Keep the site honest: no invented metrics, screenshots or testimonials.

## Non-goals

- A Persian mirror or `hreflang` cluster on this domain.
- Mirroring the Persian support page.
- Analytics, RUM, cookies or a backend contact form.
- A CMS, database, auth or newsletter.
- A client router, framework islands, Tailwind, a UI framework, WebGL or scroll-jacking.
- A custom domain or CNAME.
- A writing or blog section.

## Acceptance contract

Criteria live in [PRODUCT.md](../../PRODUCT.md). This table records the proof needed for the rebuild and its current status.

| ID | Criterion | Proof required | Status |
| --- | --- | --- | --- |
| A1 | 14 indexable routes plus 404; canonical, internal links and sitemap use the trailing-slash form | `node scripts/check-built-site.mjs` | PASS on 2026-11-23 |
| A2 | Eight case studies (four product, four client) and three travel notes pass the schema and project invariants | `npm test` (18 tests), `npm run check` | PASS on 2026-11-23 |
| A3 | Eight real screenshots with provenance and honest limits | `tests/projects.test.mjs` cover 1:1, `src/assets/SOURCES.md` | PASS on 2026-11-23 |
| A4 | Design contract matches the shipped editorial system, states and screen acceptance | `docs/DESIGN.md` plus rendered acceptance per `docs/VISUAL_REVIEW.md` | Document level PASS; rendered acceptance recorded in the independent review |
| A5 | SEO baseline: canonical, robots, sitemap, 14 social cards, manifest and icons, one JSON-LD `@graph`, `rel="me"`, noindex 404 | `node scripts/check-built-site.mjs`, `tests/seo-metadata.test.mjs` | PASS on 2026-11-23 |
| A6 | Static performance: zero external JS, external hashed CSS, 103K fonts, lab Lighthouse home desktop and mobile scores | Recorded lab run | PASS as lab evidence; field data UNPROVEN |
| A7 | WCAG 2.2 AA target with Lighthouse accessibility 100 on audited routes | Recorded lab run | PASS on audited routes; manual AT and cross-browser UNPROVEN |
| A8 | Contact is email first with public profiles second, no form and no tracker | Built artifact and source | PASS on 2026-11-23 |
| A9 | 404 is noindex, offers recovery, excluded from the sitemap | `node scripts/check-built-site.mjs` | PASS on 2026-11-23 |
| A10 | Static-only contract: no external JS, analytics, cookies, backend, CMS, auth or secrets | Built artifact, `package.json` | PASS on 2026-11-23 |
| A11 | Activation and funnel behaviour | No instrumentation by decision | UNPROVEN (open decision) |
| A12 | Cross-browser rendering in Chromium, Firefox and Safari | Real browser evidence in each engine | UNPROVEN (Chromium headless lab only) |

## Confirmed current state

- Astro 7.2.4 static build, `site: "https://imdanialrashidi.github.io"`, `output: "static"`, `trailingSlash: "always"`, `@astrojs/sitemap` excluding 404, `inlineStylesheets: "auto"`, LightningCSS. The build produces 15 pages: 14 indexable routes plus 404.
- Routes: `/`, `/work/`, `/work/{noveno,fast-english,study,gym-log,elsa-hamrah,isbatab,mobile-khorsandi,php-ielts-house}/`, `/travels/`, `/about/`, `/now/`, `/contact/`, `/404`.
- Content: `src/content/projects/*.md` (eight case studies: four `product`, four `client`; statuses `building`, `live`, `shipped`, `in_development`; seven `cover` keys mapped 1:1 to `src/assets/work/*.webp`) and `src/content/travels/*.md` (three notes with real photographs). `src/content.config.ts` is the only collection and schema source. There is no `now` or `profile` collection.
- Case studies render through one shared `src/pages/work/[slug].astro` route using Markdown bodies. There are no bespoke per-project `.astro` pages.
- Design: editorial premium direction, warm paper palette, Instrument Serif display over Geist and Geist Mono, one vermilion accent, light and dark themes, real screenshots as evidence, typographic plate for Fast English. No Tailwind, no UI framework, no client router.
- Performance shape: zero external JavaScript chunks in the artifact; global CSS ships as external hashed files; five inline script elements on content pages (theme FOUC guard, theme behavior, mobile dialog, JSON-LD, speculation rules); CSS cross-document view transitions; speculation rules prefetch; four vendored woff2 fonts totalling 103K including OFL licenses.
- SEO shape: per-page canonical in trailing-slash form, unique title and description, robots meta, sitemap with 14 URLs, `robots.txt`, 14 committed 1200x630 JPEG social cards in `public/og`, web manifest and app icons, one JSON-LD `@graph` per page (WebSite, Person with `image`/`sameAs`/`owns`/`knowsAbout`, page entity with narrower type, BreadcrumbList, CreativeWork for projects, ItemList), `rel="me"` identity links, noindex 404 excluded from the sitemap, and no `hreflang` cluster.
- Commands: `bash scripts/ci-install.sh`, `npm run dev`, `npm run build`, `npm run preview`, `npm run check`, `npm test`, `npm run format:check`, `bash scripts/verify.sh`, `npm run og`, `npm run icons`. `scripts/verify.sh` runs the workflow check, format, tests, `npm run ci` and `node scripts/check-built-site.mjs`. `.github/workflows/quality.yml` runs the gate; `.github/workflows/deploy.yml` runs `npm run check` and `npm run build`, uploads `dist/` and deploys with `actions/deploy-pages`.
- Git state at handoff: the rebuild exists only in the working tree. Nothing was committed, pushed, deployed or otherwise published during this work. `.artifacts/` and `dist/` are ignored.

## Relevant surface

- Routes: `src/pages/index.astro`, `src/pages/work/index.astro`, `src/pages/work/[slug].astro`, `src/pages/travels.astro`, `src/pages/about.astro`, `src/pages/now.astro`, `src/pages/contact.astro`, `src/pages/404.astro`.
- Components: `src/components/` (Header, Footer, ThemeToggle, CtaBand, ProjectFeature, ProjectRow, ProjectPlate, Shot, SectionHead, SocialIcon, TravelCard). The old `case-study/` set, `CompactWorkCard` and `ProjectMedia` were removed.
- Layout and design: `src/layouts/Layout.astro`, `src/styles/tokens.css`, `src/styles/global.css`.
- Content and data: `src/content.config.ts`, `src/content/projects/`, `src/content/travels/`, `src/data/site.ts`, `src/lib/work.ts`, `src/lib/travels.ts`, `src/lib/seo.ts`. The old `src/lib/projects.ts` was removed.
- Assets and provenance: `src/assets/work/`, `src/assets/travels/`, `src/assets/portrait/`, `src/assets/SOURCES.md`.
- Public: `public/fonts/` (four woff2 plus two OFL licenses), `public/og/**/*.jpg`, `public/icons/`, `public/apple-touch-icon.png`, `public/site.webmanifest`, `public/favicon.svg`, `public/robots.txt`.
- Scripts: `scripts/verify.sh`, `scripts/check-built-site.mjs`, `scripts/generate-og.mjs`, `scripts/generate-icons.mjs`, `scripts/verify-workflow.mjs`.
- Tests: `tests/projects.test.mjs` (content, routes, static-first contract, provenance), `tests/seo-metadata.test.mjs` (layout SEO markers, titles, config, robots, trailing-slash links, social cards, no em dashes, artifact gate presence).
- CI: `.github/workflows/quality.yml`, `.github/workflows/deploy.yml`.
- Docs: `docs/PRODUCT.md`, `docs/QUALITY.md`, `docs/PLAN.md`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, and this file. `docs/DESIGN.md` and `docs/ARCHITECTURE.md` are owned and rewritten by the design and architecture writer scoped to this rebuild.

## Decisions

- `trailingSlash: "always"`: GitHub Pages serves a directory URL from `index.html` without a redirect, so canonical URLs, internal links, sitemap entries and the artifact check all use the trailing-slash form. This resolves the pre-rebuild redirect and canonical mismatch risk.
- No `hreflang` cluster: the English and Persian content sets are not 1:1. The Persian site is linked with `lang="fa"` and remains the Persian home. Revisit only when every page has a true twin.
- Two content collections only (`projects`, `travels`): About, Now and Contact are pages, not collections. The previous `now` and `profile` collections were removed because nothing read them.
- One shared case-study route with Markdown bodies: cheaper to maintain, gives all eight projects the same structure, and keeps prose in content rather than in bespoke components.
- Real screenshots only: eight project covers are real captures from shipped or live work, including the live Fast English product with its public support phone numbers hidden before capture. The typographic plate remains the fallback for a future project with no public screen. There are no fabricated interfaces, metrics, testimonials or stock photographs. Provenance is `src/assets/SOURCES.md`.
- Editorial premium design: warm paper canvas, Instrument Serif display over Geist and Geist Mono, one vermilion accent, hairline rules and real screenshots rather than a card wall. Tokens are recorded in `docs/DESIGN.md`.
- Small vendored font set: Instrument Serif regular and italic, Geist latin and Geist Mono latin. 103K total including OFL licenses; no external font request.
- External hashed CSS rather than inlined CSS: the global stylesheet is one cacheable file (`inlineStylesheets: "auto"`), which suits a 15-page site better than repeating CSS in every HTML document.
- No client router, no framework islands: CSS cross-document view transitions and speculation rules provide the navigation feel without a JavaScript runtime. Five inline scripts cover theme fallback, theme behavior, the mobile dialog, JSON-LD and speculation rules.
- Generated assets committed: social cards and icons are rendered once and committed; CI does not need Chrome or image generation. They must be regenerated with `npm run og` (local Chrome) and `npm run icons` when copy or screenshots change, and tests assert that every expected card file exists.
- Static-only contract retained: no analytics, cookies, backend, forms, CMS, auth or secrets. Contact is `mailto:` plus public profiles.
- The Persian support page is not mirrored. The footer links to the Persian home `danialrashidi.ir`, which owns support.
- The old `plans/`, `.pi/` and `.omp/` workflow layers and the historical `premium-personal-brand.md` plan are history, not current state. Git history and the historical plan file remain the record.

## Evidence

Observed 2026-11-23 on the working tree, before the documentation pass and independent review. These are evidence, not new claims; rerun them on the final tree before delivery.

- `npm run check`: 0 errors, 0 warnings, 0 hints (33 files).
- `npm test`: 18 tests pass, 0 fail.
- `npm run build`: 15 pages.
- `node scripts/check-built-site.mjs`: PASS for 14 pages, 114 images, 4.5MB total; every sitemap URL is in trailing-slash form and maps back to a built file; no external JS chunks; every page links the external stylesheet.
- `bash scripts/verify.sh`: all required checks pass.
- Lighthouse, local preview with Chrome headless:
  - Desktop home: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 0.4s, CLS 0.001, TBT 0ms.
  - Mobile home: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.0s, CLS 0.001, TBT 0ms.
  - `/work/`, `/work/noveno/`, `/about/`, `/contact/`: accessibility 100 and SEO 100 with no failing audits.
- Shape of the artifact: 15 HTML files, 114 images (14 social cards, 97 image variants), dist 4.5MB, built HTML about 434K, fonts 103K, zero external JavaScript files.

Limits of this evidence: it is a lab bundle from one Chromium environment on a local preview server. It is not field data, not a production measurement, not a screen-reader audit and not a cross-browser test.

Known open item at handoff: a later edit to `scripts/check-built-site.mjs` (outside this documentation scope) added a Biome `lint/complexity/useOptionalChain` violation, so a re-run of `npm run format:check` fails at the time this plan was written. Fix that file and re-run `bash scripts/verify.sh` before delivery.

## Files changed

- Pages: `src/pages/index.astro`, `src/pages/work/index.astro`, `src/pages/work/[slug].astro` (new), `src/pages/travels.astro` (new), `src/pages/about.astro`, `src/pages/now.astro`, `src/pages/contact.astro`, `src/pages/404.astro`.
- Components: new `CtaBand`, `ProjectRow`, `ProjectPlate`, `Shot`, `SectionHead`, `SocialIcon`, `TravelCard`; reworked `Header`, `Footer`, `ThemeToggle`, `ProjectFeature`; removed the `case-study/` set, `CompactWorkCard` and `ProjectMedia`.
- Content and data: `src/content.config.ts`; eight project Markdown files (two new: `gym-log`, `study`); three travel Markdown files (new); `src/data/site.ts`; new `src/lib/work.ts`, `src/lib/travels.ts`; rewritten `src/lib/seo.ts`; removed `src/lib/projects.ts`, `src/content/now/` and `src/content/profile/`.
- Design and layout: `src/styles/tokens.css`, `src/styles/global.css`, `src/layouts/Layout.astro`.
- Assets: seven project screenshots, three travel photographs, two portraits, `src/assets/SOURCES.md`. Removed the old `Assets/Danial_photo.webp` and `src/assets/work/SOURCES.md`.
- Public: new font files and OFL licenses, `public/og/**/*.jpg` (14 cards), `public/icons/`, `public/apple-touch-icon.png`, `public/site.webmanifest`, updated `public/favicon.svg`; removed the old Geist variable fonts and `public/og-default.png`.
- Build and verification: `astro.config.mjs`, `package.json`, `package-lock.json`, `tests/projects.test.mjs`, `tests/seo-metadata.test.mjs`, `scripts/verify.sh`, new `scripts/check-built-site.mjs`, updated `scripts/generate-og.mjs`, new `scripts/generate-icons.mjs`, `.github/workflows/quality.yml`.
- Docs: `docs/PRODUCT.md`, `docs/QUALITY.md`, `docs/PLAN.md`, `AGENTS.md`, `README.md`, `CHANGELOG.md`, this plan; `docs/DESIGN.md` and `docs/ARCHITECTURE.md` are rewritten by the design and architecture writer.

## Remaining risks

- No field data: lab scores cannot be presented as Core Web Vitals proof. There is no RUM by decision.
- Cross-browser unproven: the recorded browser evidence is Chromium headless. Firefox and Safari layouts remain unverified until a real pass exists.
- Screenshot freshness: client and product captures age. Update screenshots and social cards when the owner supplies new images; tests check card existence, not card freshness.
- Generated asset drift: `npm run og` needs local Chrome, so a copy change can ship with a stale social card if the regeneration step is skipped. Regenerate and review the cards in the same change.
- Independent review and delivery: review findings must be resolved and the final canonical gate must pass on the final tree before commit and deploy.
- Docs convergence: `docs/DESIGN.md` and `docs/ARCHITECTURE.md` are written by another scope; verify their tokens, routes and budgets against the final artifact before release.
- Parity drift: the English site can lag the Persian site. No `hreflang` cluster means search engines see two independent sites until true twins exist.

## Next actions

1. Resolve independent review findings, including the current `scripts/check-built-site.mjs` Biome error.
2. Run `bash scripts/verify.sh` on the final tree and record the exact output.
3. Owner reviews the diff and docs, then commits explicit paths to `main` and lets the Pages workflow deploy. Publication needs explicit authorization per [GIT_POLICY.md](../../GIT_POLICY.md).
4. After deploy, verify the 14 trailing-slash routes, the sitemap and the social card URLs against production, and record one production Lighthouse run as lab evidence only.
5. Open product decisions only when evidence justifies them: RUM or analytics, writing section, custom domain, Persian mirror or `hreflang`, support mirroring.

## Handoff

- What changed: the English site was rebuilt end to end for content, design, routes, SEO, performance evidence and docs, and now matches the Persian sibling's depth without inventing proof.
- What remains: independent review findings, one final gate run, owner commit and deploy, and a production lab re-check.
- What must not be overwritten: `docs/DESIGN.md` and `docs/ARCHITECTURE.md` belong to their writer; `src/` belongs to the site rebuild; this file and the other product and quality docs belong to the documentation writer; unrelated user changes in the working tree must be preserved.
- First action for a fresh session: run `bash scripts/verify.sh`, read the evidence block above, inspect `git status` for unrelated changes, and only then edit.

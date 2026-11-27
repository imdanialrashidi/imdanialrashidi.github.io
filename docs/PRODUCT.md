# Product Contract: Danial Rashidi Personal Site

Source of truth for what the shipped product must do. Updated 2026-11-27 with the Kidotalks case study and the Fast English client classification; the baseline rebuild dates to 2026-11-23. System and trust boundaries live in [ARCHITECTURE.md](ARCHITECTURE.md); the visual contract lives in [DESIGN.md](DESIGN.md); the evidence bar lives in [QUALITY.md](QUALITY.md); stage status lives in [PLAN.md](PLAN.md); the rebuild's durable handoff is [exec-plans/active/english-parity-rebuild.md](exec-plans/active/english-parity-rebuild.md).

## Users and problem

- Primary users: hiring managers and recruiters scanning for a software and product builder; technical peers and product collaborators; visitors referred from Noveno; English-speaking readers who need the English surface while the Persian sibling covers Persian.
- Context and ability: English LTR, technically literate readers, evergreen browsers (Chromium, Firefox, Safari) with keyboard, touch and pointer; viewports 320, 375, 768 and 1280; system `prefers-color-scheme` and `prefers-reduced-motion` respected; no account, auth or required script.
- Problem: no single fast English hub answers in about 15 seconds who Danial is, what he has built, what the work is like, and how to reach him, without invented proof or a scattered social trail. The Persian site at `https://danialrashidi.ir` is the Persian home and the source for this English rebuild; the two sites are siblings, not translations of each other.
- Current alternative: scattered profiles (GitHub, X, Instagram, Telegram), the Persian site, and the external Noveno site.
- Why now: the Persian site already carries the honest project record. The English rebuild presents the same work to an English audience with real screenshots, case studies, and a static setup that costs nothing to host.

## Shipped product (v1, English)

- 15 indexable routes plus a 404: `/`, `/work/`, `/work/noveno/`, `/work/fast-english/`, `/work/study/`, `/work/gym-log/`, `/work/kidotalks/`, `/work/elsa-hamrah/`, `/work/isbatab/`, `/work/mobile-khorsandi/`, `/work/php-ielts-house/`, `/travels/`, `/about/`, `/now/`, `/contact/`. Every URL uses the trailing-slash form.
- Content: nine English case studies, three own products (Noveno, Study Center, Gym Log) and six client builds (Fast English, Kidotalks, Elsa Hamrah, Isbatab, Mobile Khorsandi, PHP IELTS House); three travel notes (Dalakhani Valley, Dareh Marg, Yakh Morad Cave); rewritten About, Now and Contact pages.
- Evidence: nine real screenshots from live or shipped work. A project with no public screen would render a typographic plate instead of an invented interface. Provenance is [src/assets/SOURCES.md](../src/assets/SOURCES.md). There are no invented metrics, screenshots or testimonials.
- Design: editorial premium direction with a warm paper palette, Instrument Serif display type over Geist and Geist Mono, one vermilion accent, real screenshots as evidence, light and dark themes.
- Delivery: static Astro 7.2.4 output on GitHub Pages at `https://imdanialrashidi.github.io`. No backend, database, form endpoint, analytics, cookies, auth, CMS or secrets. Contact is `mailto:` plus public profiles.

## MVP outcome

- Measurable outcome: a visitor can state the focus in about 15 seconds and reach `/work/` or `/contact/` in one click from the hero. Lab targets are LCP ≤ 2.5 s and CLS ≤ 0.1 on 1280 and 375, with WCAG 2.2 AA as the accessibility target.
- Riskiest product assumption: honest case studies with explicit limits and real screenshots still convey credibility to hiring managers better than polished, metric-heavy portfolios. Status: assumed. No analytics or funnel instrument exists, so the assumption stays unmeasured until real conversation or email evidence arrives.
- Smallest experiment that tests it: ship the English rebuild, watch direct email and conversation quality, and read owner feedback. There is no tracker by design, so this is a qualitative signal rather than a metric.
- Hard constraints: static HTML only (`output: "static"`, `trailingSlash: "always"`), zero external JavaScript chunks, Node ≥ 22.19, no backend or tracker, no invented proof, generated social cards and icons committed to the repository.

## Must-have user flows

1. Land and orient: `/` shows the identity hero, capabilities and principles, selected work with real screenshots, travel notes, and a closing contact band. "See the work" and "Start a conversation" are one click away.
2. Evaluate work: `/work/` lists nine projects, three own products and six client builds, each with a real preview, an honest status and a link. `/work/<slug>/` renders the Markdown case study, the stack, the honest limits and the next project.
3. See the human side: `/travels/` shows three travel notes with real photographs. `/about/` covers background, working style and direction. `/now/` records the current focus and a "last updated" date.
4. Contact: `/contact/` leads with the direct email, then public profiles, with explicit "No form, no tracker" copy. There is no POST surface.
5. Recover: `/404.html` is a noindex page with recovery links to Work, Travels, About and Contact, plus the email.

## Non-goals

- `/writing` or a blog/notes section until a writing cadence exists.
- CMS, database, authentication, newsletter or a backend contact service. `mailto:` is the contact path.
- Analytics, RUM, pixels or any tracker in v1.
- Framework islands, a client router, Tailwind, CSS-in-JS, WebGL, particles, scroll-jacking or decorative motion.
- A Persian mirror or `hreflang` cluster on this domain. The content sets are not 1:1. The Persian site remains the Persian home and is linked with `lang="fa"`; revisit only when every page has a true twin.
- Mirroring the Persian support page. The Persian site owns support; this site does not collect money or support details.
- A custom domain or CNAME. The `username.github.io` origin is the published URL.

## Acceptance criteria

Evidence for the shipped state is the recorded bundle of 2026-11-23; see [QUALITY.md](QUALITY.md) for commands and exact outputs. Statuses below use the same labels as the evaluator rubric.

| ID | Criterion | Evidence | Status |
| --- | --- | --- | --- |
| A1 | 15 indexable routes plus 404; canonical, sitemap and internal links all use the trailing-slash form | `node scripts/check-built-site.mjs`: 15 page URLs in sitemap, every one in trailing-slash form | PASS |
| A2 | Nine case studies (three product, six client) and three travel notes pass the content schema and the project invariants | `npm test` (18 tests) and `npm run check` (0 errors, 0 warnings, 0 hints) | PASS |
| A3 | Honest evidence: nine real screenshots, provenance in SOURCES.md, no invented metrics or testimonials | `tests/projects.test.mjs` cover 1:1 and body rules; `src/assets/SOURCES.md` | PASS |
| A4 | Design contract matches the shipped editorial system and its states | `docs/DESIGN.md`; rendered acceptance follows [VISUAL_REVIEW.md](VISUAL_REVIEW.md) | PASS at document level |
| A5 | SEO baseline: canonical, robots meta, Google and Bing verification tokens, sitemap, robots.txt, per-page social card, manifest and icons, one JSON-LD `@graph` per page, `rel="me"`, 404 noindex and sitemap exclusion | `node scripts/check-built-site.mjs` and `tests/seo-metadata.test.mjs` | PASS |
| A6 | Static performance: zero external JavaScript chunks, external hashed CSS, 103K vendored fonts, lab Lighthouse home desktop 100/100/100/100 and mobile 99/100/100/100 | Recorded lab run of 2026-11-23; see QUALITY.md | PASS as lab evidence; field data UNPROVEN |
| A7 | Accessibility: WCAG 2.2 AA target, Lighthouse accessibility 100 on `/`, `/work/`, `/work/noveno/`, `/about/` and `/contact/` | Recorded lab run of 2026-11-23 | PASS on audited routes; manual AT and cross-browser UNPROVEN |
| A8 | Contact is email first with public profiles second, no form and no tracker | `src/pages/contact.astro` (mailto only, no form element) and the built contact page | PASS |
| A9 | 404 is noindex, offers recovery links, and is excluded from the sitemap | `node scripts/check-built-site.mjs` | PASS |
| A10 | Static-only contract: no external JS, analytics, cookies, backend, CMS, auth or secrets | Built artifact, `package.json` dependency set, static-first assertions in `tests/projects.test.mjs` | PASS |
| A11 | Activation and funnel behaviour | No instrumentation by decision | UNPROVEN (open decision) |
| A12 | Cross-browser visual parity in Chromium, Firefox and Safari | Recorded lab evidence is Chromium headless only | UNPROVEN |

## Security, privacy and compliance constraints

- Data classification: public only. Name, public email, public social links, project copy, public screenshots, public portrait and photographs, and vendored fonts. No sensitive PII, no private logs, no customer data, no secrets in the repository; `.env.example` is a placeholder.
- Boundaries: Author -> Git -> CI -> GitHub Pages -> visitor. The visitor is read-only static; the only browser storage is the `theme` key in `localStorage`; there is no cookie, session, form POST or server.
- External links: outbound to GitHub, X, Instagram, Telegram, the Persian site, Noveno, and live client and product sites. No payment, subscription, callback or third-party script.
- Retention and recovery: Git is the source of truth; `dist/` is ephemeral; generated cards and icons are committed; rollback is `git revert` plus a Pages redeploy.

## Performance and UX budgets

- Field targets: Core Web Vitals `good` at the 75th percentile (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1). No RUM or field data exists; the measured numbers are lab evidence only and must be labelled that way.
- Static build budget: 16 pages; dist about 4.95MB including 15 social cards and 99 image variants; all HTML 459K; fonts 103K vendored; zero external JavaScript chunks; five inline script elements on content pages (theme FOUC guard, theme behavior, mobile dialog, JSON-LD, speculation rules); external hashed CSS; `sharp` used offline at build and asset-generation time only.
- Enforced budgets in `scripts/check-built-site.mjs`: sitemap 15 URLs; total HTML under 700K; no image over 300K; dist under 8MB; no external JS; every page links the external stylesheet; canonical and sitemap agree.
- UX targets: WCAG 2.2 AA; reflow at 320 CSS px; 200% text zoom; visible focus; light and dark themes; reduced motion respected; no horizontal overflow at 320, 375, 768 and 1280.
- Brand character (x, not y): calm and precise, not noisy; technically literate, not buzzword AI; editorial restraint, not generic SaaS or gradient cyberpunk. The warm paper palette with one vermilion signal is the only chromatic move.

## Measurement and operations

- Activation and success event: a visitor reaches the work index or sends an email. There is no client-side event; email and conversation are the only signals.
- Guardrails: `bash scripts/verify.sh` is the canonical gate (workflow pin, format, tests, type/content check, build, artifact check). CI runs it in `.github/workflows/quality.yml`; deployment runs `npm run check` and `npm run build` in `.github/workflows/deploy.yml`.
- Telemetry: none, by decision. No analytics endpoint or RUM exists. See open decisions.
- Support and recovery: email is the support path; rollback is revert plus redeploy; previous `main` remains deployable; no database to migrate; generated assets are reproducible with `npm run og` (local Chrome needed) and `npm run icons`.

## Open product decisions

- Field performance: decide whether RUM or analytics is worth breaking the no-tracker promise, and what script budget would be acceptable. Until then, lab evidence only.
- Writing: add `/writing` or notes only when a writing cadence justifies the content and maintenance cost.
- Custom domain: a CNAME would change `site.url`, canonical URLs, the sitemap, social card URLs and the Pages settings; revisit with a migration plan.
- Persian parity and hreflang: no `hreflang` cluster today because the two content sets are not 1:1. Revisit only when every English page has a true Persian twin and the reverse mapping is stable.
- Persian support page: not mirrored. If support is ever added in English, it must be a deliberate product decision, not a translated payment surface.
- Client screenshot freshness: captures age. Regenerate screenshots and social cards when the owner supplies new captures; do not describe a current site from an old image.
- Fast English status: the live website, public repository and Android 1.0.0 build are real as of 2026-11-24; revisit the label and case-study details if the product changes.

# Product Contract — Danial Rashidi Personal Site

Source of truth for what the shipped product must do. Filled during bootstrap 2026-08-27 from repository evidence at `main` (Astro 7.2.4, `src/data/site.ts`, `src/content.config.ts`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`).

## Users and problem
- Primary users: Hiring managers and recruiters scanning for a software & product builder; technical peers and product collaborators; Noveno-referred visitors.
- Context, ability, language, and device assumptions: English LTR only (v1); technically literate readers; evergreen browsers (Chromium, Firefox, Safari) with keyboard + touch + pointer; viewports 320, 375, 780, 1280; system prefers-color-scheme and prefers-reduced-motion respected; no auth, no required account.
- Problem being solved: No single, fast, verifiable hub answers in ~15 seconds who Danial is, what he builds and has shipped, how he thinks, and how to reach him without invented proof or scattered social links.
- Current alternative / workaround: Scattered profiles (GitHub `imdanialrashidi`, X `@imdaniarshidi`, Instagram, Telegram) plus external `https://noveno.ir` link; no owned searchable site with curated case studies.
- Why now: Portfolio must honestly represent six public projects (Fast English, Noveno, plus four Noveno client sites) with provenance and remain cheap to host as static HTML; Astro static on GitHub Pages satisfies this without backend.

## MVP outcome
- Measurable outcome: Visitor can in ≤15 seconds articulate focus — “Software & Product Builder — Web · AI · Automation · Product Engineering, Building Noveno” — and reach `/work` or `/contact` in one click. Lab targets LCP ≤2.5 s, CLS ≤0.1 on 1280 and 375 (see Performance budgets below).
- Riskiest product assumption: Honest case studies with explicit limitations and real screenshots (no invented metrics, traffic, or testimonials) still convey credibility to hiring managers versus polished, metric-heavy portfolios.
- Smallest experiment that tests it: Ship static site with two featured product efforts (Fast English `in_progress`, Noveno `building`) and four client web profiles (Elsa Hamrah, Isbatab, Mobile Khorsandi, PHP IELTS House) with real hero screenshots (`src/assets/work/SOURCES.md`), mailto CTA, and measure inbound email/click-through vs. prior scattered links.
- Deadline / hard constraints: No calendar deadline. Must remain static HTML only (`output: static`, `trailingSlash: never`), zero framework runtime, no backend, no analytics/RUM v1, no CMS per brief, Geist fonts vendored to `public/fonts` (no CDN), no invented proof.
- Supported platforms and environments: GitHub Pages `https://imdanialrashidi.github.io` static; source `main`, build `node scripts/generate-og.mjs && astro build` → `dist/`; Node ≥22.19 (CI pins 22.23.2); Astro 7.2.4 + TypeScript 5.9 strict via `astro check`; no server, no DB.

## Must-have user flows
1. Land and orient — Visitor lands on `/` → reads hero eyebrow/title/lede/capabilities/principles → clicks “View selected work” (`/work`) or “Get in touch” (`/contact`) without horizontal scroll at 320.
2. Evaluate work — Visitor opens `/work` → sees featured deep-work section (2) and selected client work grid (4) → opens any `/work/<id>` profile → reads Problem / What was built / Status / Limitations / Sources with real hero screenshot, follows outbound live link (`links.live`/`links.noveno`) or returns to index.
3. Contact — Visitor opens `/contact` → copies or activates `mailto:imdanialrashidi@gmail.com` (primary) → follows secondary links (GitHub, X, Instagram, Telegram, noveno.ir) with `rel="me noopener noreferrer"` where applicable; no form POST.

## Non-goals
- Blog/notes under `/writing` (deferred until cadence exists)
- CMS, database, authentication, newsletter, or backend contact service (explicitly deferred; mailto suffices)
- Analytics or RUM instrumentation v1 (deferred per brief)
- Heavy animation, WebGL/particles, scroll-jacking, glassmorphism, or framework islands (rejected per ARCHITECTURE.md)
- Tailwind / CSS-in-JS or client-side data fetching (monochrome tokens in `src/styles/tokens.css` remain authoritative)

## Acceptance criteria
- [x] Home `/` renders hero (eyebrow, `clamp(2.125rem,5vw,3.5rem)` display, lede, CTAs, meta) plus portrait `Assets/Danial_photo.webp` via `astro:assets` at 1280/375/320 without layout shift or horizontal overflow
- [x] Work index `/work` derives count and grouping from `src/content/projects/*.md` via `getDisplayProjects()` / `getFeaturedProjects()` / `getClientProjects()` — 2 featured + 4 client profiles, honest “Details coming soon” where `hasVisual` is false
- [x] Each `/work/<id>` page derives props via `cardPropsFor` / `imageFor` / `statusLabelFor` / `hrefFor` with blocked `javascript:` caseStudy links ( zod refine in `src/content.config.ts`) and provenance noted in `src/assets/work/SOURCES.md`
- [x] Contact `/contact` exposes primary `mailto:` and secondary outbound links, states “No form · No tracker · Direct”, no backend POST surface
- [x] Theme persists via `localStorage` `theme=light|dark`, FOUC prevented by inline `is:inline` script before paint, respects `prefers-color-scheme`, toggle preserves `aria-pressed`; reduced-motion disables animations
- [x] SEO baseline: canonical `new URL(Astro.url.pathname, site.url)`, OG/Twitter, JSON-LD `Person`, `robots.txt`, `sitemap-index.xml` via `@astrojs/sitemap`, 404 editorial page served as `404.html` with recovery links
- [x] Draft posts (`status: draft`) excluded from display via `isDraft` filter; “building”/“in_progress” mapped to visible labels

## Security, privacy, and compliance constraints
- Data classification: Public only — name, email (`imdanialrashidi@gmail.com`), portfolio copy, public screenshots, vendored Geist fonts and portrait. No sensitive PII, no secrets in repo; `.env.example` contains only placeholder `APP_ENV`.
- Critical access rules: No authentication. Write path is Author → Git → CI (`npm run check` + `npm run build`) → Pages (`actions/deploy-pages`). Visitor is read-only static. Theme stored in `localStorage` (`theme`), no cookie or server session. External links use `noopener noreferrer`; `caseStudy` links validated against `javascript:` at schema level.
- External/payment providers: None. Outbound links only to `github.com`, `x.com`, `instagram.com`, `t.me`, `noveno.ir`, and live client domains; no payment, callback, or subscription flow.
- Retention/deletion requirements: Git is source of truth; `dist/` is ephemeral and rebuilt via `npm run build`. `public/fonts` and `Assets/Danial_photo.webp` are committed. Visitor can clear `localStorage` to reset theme.

## Performance and UX budgets
- Core page/API target: Core Web Vitals `good` at 75th percentile as targets — LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1. Lab measured via `npm run build && npm run preview --port 4321` + Lighthouse manually (field data/RUM not yet present; see Deferred decisions).
- Supported device/network baseline: Viewports 320, 375, 780, 1280 verified (no overflow); touch targets 36–44 px; evergreen browsers; no IE. Font budget Geist 69K + Geist Mono 70K (139K) vendored, preload Sans only, `font-display: swap`. CSS 23K foundation (7K tokens + 16K global) shipped ~90K inlined via `build.inlineStylesheets: "always"` after plan 013. JS 0 external + ~2K inline (theme + nav). Portrait source `Assets/Danial_photo.webp` 85K → 4 responsive `dist/_astro/Danial_photo.*.webp` variants. OG default `public/og-default.png` 30.8K (1200×630, regenerated by `scripts/generate-og.mjs`).
- Accessibility target: WCAG 2.2 AA — text ≥4.5:1, large/UI ≥3:1 (tokens measured in DESIGN.md), reflow at 320 CSS px, 200% zoom, visible `:focus-visible` ring `rgba(15,76,255,0.4)`, skip-link, header `role=dialog aria-modal` with `aria-expanded`, Escape + click-away + resize listener, ThemeToggle `aria-pressed`.
- Brand character (x, not y): Calm & precise, not noisy; technically literate, not buzzword AI; editorial restraint, not generic SaaS/gradient/cyberpunk.
- Visual ambition (utility / product / flagship): Product-level — editorial × engineering with considered tokens, composition, and states, not flagship experimental. Single electric blue `#0f4cff`/`#4f7cff` over monochrome canvas is the only chromatic signal.
- Required locales and directions (LTR/RTL): English LTR only v1 (`site.language: en`, `locale: en_US`); logical properties used for future RTL readiness; no translation infrastructure.
- Link to accepted visual contract: `docs/DESIGN.md` (editorial thesis, token tables, geometry, components, screen acceptance).

## Measurement and operations
- Activation / success event: Visitor clicks “View selected work” or “Contact/Get in touch” / activates mailto, and can state focus without confusion (hero → work/contact funnel).
- Guardrail metrics: `npm run check` (astro check strict) and `npm run build` must pass locally and in CI (`deploy.yml`, `quality.yml`); no browser console errors; layout-stable at 320; `robots.txt` and `sitemap-index.xml` valid; OG image present at `/og-default.png`.
- Required product telemetry: UNKNOWN — none v1 by decision. Manual Lighthouse preview is the lab budget; no analytics endpoint is shipped. See Open product decisions for RUM plan.
- Support / recovery expectation: Copy on `/contact` promises response within a day or two via email. Rollback is `git revert` + redeploy; previous `main` remains deployable. No DB to migrate; `dist/` rebuilt deterministically. GitHub Pages artifact is `dist/` via `actions/upload-pages-artifact`.

## Open product decisions
- Whether/when to add RUM/analytics (e.g., Plausible/Umami) and acceptable script budget without breaking zero-tracker promise on `/contact`.
- Depth of long-form case studies for Fast English and Noveno once verifiable narrative/assets exist (without inventing outcomes).
- Adding `/writing`/notes or a CMS once writing cadence justifies it.
- Custom domain (CNAME) vs. `username.github.io` — would require updating `site.url`, `astro.config.mjs` `site`, canonical and sitemap, and re-verifying `.nojekyll`.

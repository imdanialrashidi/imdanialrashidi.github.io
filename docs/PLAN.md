# Product Roadmap: Danial Rashidi Personal Site

Execution state for the English static site at `https://imdanialrashidi.github.io`. Updated 2026-11-23 after the English parity rebuild. Durable task-level state and evidence live in [exec-plans/active/english-parity-rebuild.md](exec-plans/active/english-parity-rebuild.md). The older [exec-plans/active/premium-personal-brand.md](exec-plans/active/premium-personal-brand.md) is stale history from the pre-rebuild site and is not current state.

## Outcome and boundaries

- Product outcome: a fast, honest English credibility hub that answers in about 15 seconds who Danial is, what he builds, what the work looks like, and how to reach him, with eight verifiable case studies, three travel notes, and no invented proof.
- Measurable success: a visitor reaches `/work/` or `/contact/` in one click from the hero, the site meets its lab budgets (LCP ≤ 2.5 s, CLS ≤ 0.1, WCAG 2.2 AA) at 320, 375 and 1280, and the canonical gate passes locally and in CI.
- Explicit non-goals: `/writing`, CMS/DB/auth/newsletter, analytics or RUM in v1, backend contact form, framework islands, Tailwind or a UI framework, client router, Persian mirror or `hreflang` cluster, support page mirroring, and a custom domain. See [PRODUCT.md](PRODUCT.md) and [ARCHITECTURE.md](ARCHITECTURE.md).
- Constraints: static GitHub Pages output, `trailingSlash: "always"`, Node ≥ 22.19, zero secrets, committed generated assets (social cards need local Chrome), vendored OFL fonts, and provable provenance for every image.

## Current stage

Stage 7, staged production. The English rebuild is complete in the working tree as of 2026-11-23 and has passed the local canonical gate. It is not committed or deployed yet, so the public Pages URL still serves the previous build until the owner commits `main` and the Pages workflow runs. Durable state, decisions and the exact evidence bundle are in [english-parity-rebuild.md](exec-plans/active/english-parity-rebuild.md).

## Evidence ledger

| Claim or assumption | Status | Evidence | Next test or decision |
| --- | --- | --- | --- |
| Static build and Pages deploy chain | confirmed | `astro.config.mjs` (`output: "static"`, `site`, `trailingSlash: "always"`), `deploy.yml` (check, build, artifact, deploy), `quality.yml` (`verify.sh`) | Run the gate on the final tree, then owner commit and deploy |
| 14 routes, trailing-slash URLs, sitemap agreement | confirmed | `node scripts/check-built-site.mjs`: 14 sitemap URLs in trailing-slash form, canonical maps back to the built file | Keep the artifact check in the gate |
| Eight case studies and three travel notes | confirmed | `npm test` 18 passes; `npm run check` 0 errors, 0 warnings, 0 hints | Enforce on every content change |
| Honest evidence: eight real screenshots | confirmed | `tests/projects.test.mjs` cover/asset 1:1 and provenance assertions; `src/assets/SOURCES.md` | Refresh captures and social cards when the owner supplies new images |
| Editorial design with light and dark themes | confirmed | `docs/DESIGN.md`; Lighthouse accessibility 100 on audited routes; rendered acceptance per `docs/VISUAL_REVIEW.md` | Browser pass before any design change |
| SEO and identity infrastructure | confirmed | 14 committed social cards asserted by tests; JSON-LD graph, robots.txt, manifest and icons checked by `scripts/check-built-site.mjs` | Re-run the artifact check after any SEO or copy change |
| Zero external JS and lab performance budget | confirmed as lab | 0 JS chunks in the artifact; Lighthouse home desktop 100/100/100/100 and mobile 99/100/100/100 | Field data absent; keep re-running the lab after deploy |
| Field Core Web Vitals and RUM | unmeasured | No RUM or analytics by decision | Decide only if the product decides to break the no-tracker promise |
| Honest case studies beat metric-heavy portfolios | assumed | No funnel or analytics data exists | Read inbound email and conversation quality over time |
| Persian parity and `hreflang` decision | decided | Content sets are not 1:1; Persian site linked with `lang="fa"` | Revisit only when every page has a true twin |
| Cross-browser rendering | unproven | Recorded lab is Chromium headless only | Spot-check Firefox and Safari before a redesign |

## Stage gates

| Stage | Scope | Exit evidence | Status |
| --- | --- | --- | --- |
| 0. Discovery proof | Users, problem, MVP outcome | `docs/PRODUCT.md` filled from evidence | Complete 2026-11-23 |
| 1. Experience direction | Critical journey, IA, visual thesis | Accepted `docs/DESIGN.md` with tokens and screen acceptance | Complete 2026-11-23 |
| 2. Walking skeleton | Typecheck, build and Pages deploy path | `npm run check` + `npm run build`; `deploy.yml` live | Complete |
| 3. Vertical MVP | 14 routes, eight case studies, three travels, the about/now/contact pages, and 404 | Built artifact and `node scripts/check-built-site.mjs` | Complete in working tree |
| 4. Internal alpha | Tests, type/content check and artifact check green | `npm test` 18 passes; `npm run check` clean; no open BLOCKER/MAJOR in the independent review | In progress |
| 5. External beta | Public Pages visitors, reversible static rollout, email support | Older build is public; rebuild awaits deploy | Pending deployment |
| 6. Release candidate | Frozen tree, full gate, docs match the artifact, independent review | `bash scripts/verify.sh` on the final tree; review findings resolved | In progress |
| 7. Staged production | Single static stage; stop on gate failure; rollback by revert | Owner-authorized commit and Pages deploy; previous `main` deployable | Pending owner action |
| 8. Learning loop | Each shipped change updates the owning doc, tests and plan | Docs, tests and `exec-plans` updated per slice | Active |

## Critical path and risks

| Risk or dependency | Control or experiment | Owner | Trigger |
| --- | --- | --- | --- |
| GitHub Pages redirects from directory serving | `trailingSlash: "always"`; canonical, internal links, sitemap and the artifact check all use the trailing-slash form | Author | Any URL, route or domain change |
| Generated asset drift (social cards, icons) | Cards and icons are committed; tests assert every card exists; `SOURCES.md` records provenance; regenerate with `npm run og` (local Chrome) and `npm run icons` after copy or screenshot changes | Author | Before release and after any image or copy change |
| Font budget or licensing drift | Four vendored woff2 files (103K with OFL licenses), preload display and body faces, `font-display: swap` | Author | If budget tightens or a face changes |
| Content honesty | Schema plus tests, provenance file, explicit limits sections, no invented metrics | Author | Every content change |
| Content schema drift | `src/content.config.ts` plus `npm run check` and `tests/projects.test.mjs` | Author | Schema or content change |
| Stale client screenshots | Captures age; regenerate cards and screenshots when the owner supplies fresh images; never describe a current site from an old capture | Author | New capture supplied |
| Persian parity drift | No `hreflang` cluster until twins exist; Persian site linked with `lang="fa"`; review when the Persian content set changes | Author | Persian content release |
| No field performance data | Lab evidence only; never claim field Core Web Vitals | Author | If RUM is considered |

## Next bounded slice

- Goal: land the English rebuild. Resolve any outstanding review findings, run `bash scripts/verify.sh` on the final tree, then let the owner commit to `main` and deploy through the Pages workflow per [GIT_POLICY.md](GIT_POLICY.md). After deploy, re-check the production URL, the sitemap and a lab Lighthouse run against production.
- Acceptance proof: `bash scripts/verify.sh` exits 0; `node scripts/check-built-site.mjs` reports PASS for 14 pages and 114 images; the production URL serves the 14 trailing-slash routes; performance remains labelled as lab evidence.
- Recovery and rollback: `git revert` on `main` plus a Pages redeploy; the previous `main` remains deployable; `dist/` is ephemeral and rebuilt deterministically.

## Deferred decisions

- RUM or analytics provider and script budget, if the no-tracker promise is intentionally revisited.
- A writing or notes section and its content model.
- A custom domain (CNAME) and the canonical, sitemap and social card migration that follows.
- A Persian mirror or `hreflang` cluster, only when every page has a true twin.
- Mirroring the Persian support page, if support ever becomes an English product need.
- Font subsetting if the character budget tightens.

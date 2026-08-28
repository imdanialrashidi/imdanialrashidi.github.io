# Architecture Decisions — Danial Rashidi Personal Site (Shipped — plans 001–010 at dbda97e; updates 011+ in progress)

## Current system

- **Runtime/platform:** Astro 7.2.4 + TypeScript 5.9 (strict, `astro/tsconfigs/strict`) — static HTML only
- **Main modules:** `src/layouts/Layout.astro`, `src/components/{Header,Footer,ThemeToggle,ProjectFeature,CompactWorkCard,ProjectMedia}`, `src/components/case-study/{CaseHero,CaseSection,Callout,CaseFigure,ArchitectureDiagram,NextProject}`, `src/styles/{tokens,global}.css`, `src/data/site.ts` (single source `site`/`social`/`navigation`), `src/lib/projects.ts` (pure helpers + preview map → `src/assets/work/*.webp`), `src/pages/{index,work/index,work/*,about,now,contact,404}`, `src/content.config.ts` (zod schemas), `public/{fonts/Geist*,favicon.svg,robots.txt,og-default.png}`; portrait source `Assets/Danial_photo.webp` via `astro:assets`
- **Data stores:** File-system content only — `src/content/projects/*.md` (6 projects: `fast-english` `in_progress`, `noveno` `building`, plus 4 client `published` with `hasVisual: true`), `src/content/now/` and `src/content/profile/` present but `now.astro` currently uses hardcoded date `lastUpdated` (no `getCollection` runtime); no DB, no CMS, no backend
- **External services:** None at runtime (no analytics, no form backend, no CDN font request). Noveno `https://noveno.ir` and live client domains (`elsahamrah.com` etc.) are outbound links only; image proxy `thum.io` used once for source screenshots, not at runtime
- **Deployment topology:** GitHub Pages `username.github.io` static. Source `main`, build `node scripts/generate-og.mjs && astro build` → `dist/` (12 pages: `/`, `/about`, `/now`, `/contact`, `/work`, `/work/fast-english`, `/work/noveno`, `/work/elsa-hamrah`, `/work/isbatab`, `/work/mobile-khorsandi`, `/work/php-ielts-house`, `/404` + hashed `_astro/*.webp` + `fonts/*.woff2` + `.nojekyll` + `sitemap-*.xml` + `og-default.png` 30.8K), deploy via `actions/deploy-pages` in `.github/workflows/deploy.yml` (live, gated on `npm run check` per plan 014, 10m timeout, `actions/configure-pages`). `.nojekyll` committed at repo root and `public/.nojekyll` → `dist/.nojekyll`.

## Trust boundaries and critical data flows

1. **Author → Git → CI → Pages → Visitor:** Author commits markdown/astro → CI builds static → Pages serves HTML/CSS. No user input reaches server.
2. **Visitor → mailto / external:** Contact is `mailto:imdanialrashidi@gmail.com` + outbound `rel="me noopener noreferrer"` links (GitHub, X @imdaniarshidi, Instagram, Telegram, noveno.ir). No form POST, no injection surface.
3. **Browser-local:** Theme preference stored in `localStorage` (`theme` = `light|dark`), read by inline FOUC script before paint, toggled via minimal vanilla JS; no cookie, no server.

## Non-negotiable invariants

- Static-first, zero-JS content by default; JS only for theme toggle (~1K) + mobile nav (~1K) inline, no framework runtime.
- No invented project proof: case studies show honest “in progress” placeholders; no metrics/screenshots until assets exist.
- Light-first, system-aware, persisted `data-theme` — FOUC prevented, reduced-motion respected.
- `public/fonts` (Geist) served locally, `font-display: swap`, preload only critical Sans.

## Chosen patterns

| Area | Decision | Why | Revisit when |
|---|---|---|---|
| Site generation | Astro static, `output: static`, `trailingSlash: never`, `site: https://imdanialrashidi.github.io`, `@astrojs/sitemap` | Minimal JS, typed content, native image pipeline, optimal for Pages static; 12 pages build in ~2.8s (8 pages at foundation in 1.7s) | If SSR or islands needing server required |
| Language | TypeScript strict, `astro check` | Type safety for `site` data, props; harness requires strict | If check needs TS 7, upgrade @astrojs/check peer |
| Styling | CSS custom properties tokens (`src/styles/tokens.css`), global reset, no Tailwind/CSS-in-JS, LightningCSS | Semantic tokens for light/dark, spacing, motion; 23K total CSS; editorial control without framework | If design system grows to need component library |
| Fonts | Geist / Geist Mono variable `woff2` vendored to `public/fonts` (69K + 70K), `@font-face 100–900 swap`, single preload Sans | Premium but efficient, no CDN, no 7.9M npm dep after vendoring; fulfills brief without disproportionate dep | If subsetting or additional weights needed |
| Theme | Inline `<script is:inline>` FOUC guard + `ThemeToggle.astro` + `localStorage` + `prefers-color-scheme`, `aria-pressed` | System on first visit, persisted manual, no flash, keyboard accessible, `prefers-reduced-motion` disables | If need system-only reset UI |
| Navigation | Sticky header + backdrop blur, desktop nav pill, mobile dialog `role=dialog aria-modal` with `aria-expanded`, Escape + click-away + resize listener | Restrained, accessible from start, verified at 320/375/1280, no overflow | If IA adds more items |
| Content | File-system `src/content.config.ts` with `glob` loaders + zod, `src/data/site.ts` for typed site/social/nav, no CMS | Keeps data separate from presentation, build fails on bad frontmatter later, honest placeholders now | When Fast English/Noveno copy ready |
| Assets | `Assets/Danial_photo.webp` rendered on Home and About via `astro:assets <Image>` (responsive `widths=[320,480,640]`, eager above fold) | Satisfies brief “optimize only when introduced” | Done — revisit if portrait treatment changes |
| SEO | Canonical `new URL(Astro.url.pathname, site.url)`, OG/Twitter, JSON-LD `Person`, `robots.txt`, sitemap via `@astrojs/sitemap`, `noindex` on 404 | Baseline for Pages domain, no invented sitemap | If custom domain added (CNAME) |
| Error handling | `src/pages/404.astro` editorial 404 with nav recovery + `404.html` + `/404` via Astro static | Works on GitHub Pages (404.html served) | If custom 404 content needed |

## Explicitly rejected complexity

- Next.js / Remix / SPA runtime — heavy JS, not needed for static credibility hub, Pages static can't run node.
- React / Vue islands — no interaction requires framework; vanilla handles theme/nav in ~2K.
- Heavy animation libs (Framer Motion, GSAP) — restrained CSS transitions only, reduced-motion disables.
- CMS (Sanity/Contentful/Notion), DB, auth, newsletter — no content cadence justifies.
- Analytics (Plausible/Umami) — explicitly deferred per brief (V1 none).
- Backend contact service (Formspree/Formspark) — deferred; `mailto:` suffices.
- Tailwind — would obscure semantic tokens and editorial tuning; raw CSS preserves control.
- WebGL / particles / custom cursor / scroll hijack / glassmorphism — rejected per brief avoid list.
- `@fontsource` / `geist` npm runtime — vendored directly to avoid 7.9M dep and CDN.

## Operational baseline

- **Configuration/secrets:** `site.url = https://imdanialrashidi.github.io` in `src/data/site.ts` and `astro.config.mjs` `site` own canonical; `.env.example` only `APP_ENV` (no secrets). Public social/email intentionally exposed per brief.
- **Migrations:** None (static files). `dist/` is ephemeral.
- **Backup and tested restore:** Git is source of truth; `dist/` can be rebuilt via `npm run build`. Fonts in `public/fonts` (69K+70K) and portrait `Assets/Danial_photo.webp` (85K) committed.
- **Logging/monitoring:** No server logs (Pages). Browser console clean (0 errors, Mono preload removed; Sans preload only). Lighthouse lab budget manual (`npm run build && npm run preview --port 4321` + Lighthouse).
- **Rollback:** `git revert` + redeploy; previous `main` remains deployable. No DB to migrate.

## Agent development interfaces

- **Install:** `bash scripts/ci-install.sh` is canonical (detects `package-lock.json` → `npm ci`; verifies single lockfile). Equivalent direct `npm ci` works when `package-lock.json` is the only lockfile (Node ≥22.19, CI pins 22.23.2).
- **Local start:** `npm run dev` → `astro dev` (default `http://localhost:4321` after `4321` port log; HMR, type-aware). `npm run preview` → `astro preview --port 4321` serves built `dist/`. Build is `npm run build` which runs `node scripts/generate-og.mjs` then `astro build`.
- **Health / readiness signal:** No HTTP health endpoint. Readiness is exit-code 0 from `npm run check` (`astro check` strict types + content zod) and `npm run build`. Built artifact `dist/index.html` and `dist/sitemap-index.xml` exist; `dist/og-default.png` regenerated each build. Browser health is clean console + no layout overflow at 320.
- **Logs / diagnostics:** `astro dev` / `astro build` stdout/stderr; `npm run check` diagnostics include content schema errors (frontmatter zod). No server log file. Optional local artifacts ` .artifacts/preview.log` and ` .artifacts/playwright/` are not canonical; `public/og-default.png` generation logs `wrote public/og-default.png`.
- **Test entrypoints:** `node --test tests/projects.test.mjs` (product helpers, frontmatter safety, draft filtering, shared prop usage — no `astro:content` import). Harness suites: `node --test tests/*.test.mjs` (89 tests at baseline); gate via `bash scripts/verify.sh` which runs `bash scripts/omp-doctor.sh --ci` then `npm run ci` (`check && build`) or `format:check`/`lint` fallbacks.
- **Browser entrypoints:** No Playwright config in repo. Critical routes are `/` (hero + curated 3), `/work` (6-project index), `/work/<id>` (6 profiles), `/about`, `/now`, `/contact`, `/404`. Browser QA uses native `browser` tool against `npm run preview` or `npm run dev`; reuse server, no CI mode/video/trace/screenshots. Deterministic tests remain in `node:test` suites, separate from interactive browser exploration. See `docs/DESIGN.md` Screen acceptance for viewports and required states.
- **Database / test-state setup:** No DB, no backend, no seeded state. File-system content via `src/content/projects/*.md` validated at `astro check` time; tests use inlined pure helpers and fixture frontmatter, not live collections. `src/content/now` and `profile` collections exist but are not queried at runtime.
- **Rollback / recovery:** `git revert <sha>` on `main` + push triggers `deploy.yml` redeploy of previous green commit. `dist/` is rebuildable (`npm run build`). No migration to undo; `public/.nojekyll` ensures Pages does not Jekyll-process.

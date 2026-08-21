# Architecture Decisions — Danial Rashidi Personal Site (Foundation Slice)

## Current system

- **Runtime/platform:** Astro 7.2.4 + TypeScript 5.9 (strict, `astro/tsconfigs/strict`) — static HTML only
- **Main modules:** `src/layouts/Layout.astro`, `src/components/{Header,Footer,ThemeToggle}`, `src/styles/{tokens,global}.css`, `src/data/site.ts`, `src/pages/{index,work,about,now,contact,404}`, `src/content.config.ts` (stub), `public/{fonts,favicon,robots}`
- **Data stores:** File-system content only (markdown collections stubbed via `astro/loaders` glob) — no DB, no CMS, no backend at v1
- **External services:** None at foundation (no analytics, no form backend, no CDN font request). Noveno `https://noveno.ir` is external link only.
- **Deployment topology:** GitHub Pages `username.github.io` static. Source `main`, build `astro build` → `dist/` (HTML + hashed `_astro/*.css` + `fonts/*.woff2` + `.nojekyll` + `sitemap-*.xml`), deploy via GitHub Pages (either branch-Jekyll-bypass or future Actions `deploy-pages`). `.nojekyll` committed at repo root and `public/.nojekyll` → `dist/.nojekyll`.

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
| Site generation | Astro static, `output: static`, `trailingSlash: never`, `site: https://imdanialrashidi.github.io`, `@astrojs/sitemap` | Minimal JS, typed content, native image pipeline, optimal for Pages static; 8 pages build in 1.7s | If SSR or islands needing server required |
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

- **Configuration/secrets:** `site.url` constant owns canonical; `.env.example` only `APP_ENV` (no secrets). Public social/email intentionally exposed per brief.
- **Migrations:** None (static files). `dist/` is ephemeral.
- **Backup and tested restore:** Git is source of truth; `dist/` can be rebuilt via `npm run build`. Fonts in `public/fonts` committed.
- **Logging/monitoring:** No server logs (Pages). Browser console clean (0 errors, 1 preload warning for Sans preloaded but not yet used within timing — benign, fixed by removing Mono preload). Lighthouse budget manual.
- **Rollback:** `git revert` + redeploy; previous `main` remains deployable. No DB to migrate.

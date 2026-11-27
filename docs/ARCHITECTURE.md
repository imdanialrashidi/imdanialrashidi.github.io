# Architecture and Operations: Danial Rashidi personal site

Updated 2026-11-27 for the Kidotalks addition and the Fast English client classification; the baseline rebuild dates to 2026-11-23. This document owns system structure, data flow, invariants, build and operations for the English site at <https://imdanialrashidi.github.io>. Visual and interaction rules live in [DESIGN.md](DESIGN.md); product outcomes in [PRODUCT.md](PRODUCT.md); release evidence rules in [QUALITY.md](QUALITY.md); workflow pin in [WORKFLOW.md](WORKFLOW.md).

## Current system

| Layer | Fact |
| --- | --- |
| Generator | Astro 7.2.4 with `output: "static"`, `site: "https://imdanialrashidi.github.io"`, `base: "/"`, `trailingSlash: "always"`. |
| Language | TypeScript 5.9.2 under `astro/tsconfigs/strict`, plus `strict` and `noUncheckedIndexedAccess`; `astro check` is the type and content gate. |
| Styling | CSS custom properties in `src/styles/tokens.css`, shared rules in `src/styles/global.css`, scoped styles beside components; LightningCSS transformer; no Tailwind, CSS-in-JS or UI framework. |
| Build tools | `@astrojs/sitemap` 3.7.3 for the sitemap, `sharp` 0.35.3 for Astro's image pipeline and offline social cards and icons, Biome 1.9.4 for format and lint. Six devDependencies, zero runtime dependencies. |
| Runtime | None. No server, database, auth, cookies, backend form, analytics, CMS or client framework. Every route is static HTML served by GitHub Pages. |
| Node | `>=22.19.0` in `package.json`; CI pins 22.23.2. |
| Output | 16 HTML files: 15 indexable routes plus `404.html`. About 4.95MB in `dist/`, including 99 responsive WebP variants, 15 social cards, four fonts and six hashed CSS files. Zero emitted JavaScript chunks. |
| Host | GitHub Pages account root URL, published by `.github/workflows/deploy.yml` from `dist/`. `.nojekyll` at the archive root keeps underscore paths (`_astro/`) served as-is. |

### Modules

| Path | Owns |
| --- | --- |
| `src/data/site.ts` | Single source for identity, canonical URL, email, social profiles, `sameAs` list, navigation, product links, Noveno organisation and `isActiveNav`. |
| `src/content.config.ts` | Zod schemas for the `projects` and `travels` collections, loaded from Markdown with `glob`. Build fails on schema drift. |
| `src/content/projects/*.md` | Nine case studies: three own products and six client builds, each with summary, meta description, kicker, kind, role, year, status, stack, links, optional real cover and an ordered body. |
| `src/content/travels/*.md` | Three travel notes with destination, dual-calendar date label, summary, image key, alt text and focal position. |
| `src/lib/work.ts` | Typed cover map for the nine real screenshots, `coverFor`, `hrefFor`, ordering, featured and kind splits, and next-project lookup. |
| `src/lib/travels.ts` | Typed image map and ordering for travel notes. |
| `src/lib/seo.ts` | Breadcrumb, item list, image, Person and WebSite nodes, the per-page `@graph` builder and the CreativeWork node for case studies. |
| `src/layouts/Layout.astro` | Document shell, head metadata, canonical normalisation, social metadata, rel-me links, search-engine verification tokens, font preloads, JSON-LD, speculation rules, pre-paint theme guard, skip link, header, main, footer. |
| `src/components/*.astro` | `Header` with dialog menu, `ThemeToggle`, `Footer`, `SectionHead`, `ProjectFeature`, `ProjectRow`, `ProjectPlate`, `Shot`, `TravelCard`, `CtaBand`, `SocialIcon`. |
| `src/pages/**` | Eight route files that generate 16 HTML files: `index`, `work/index`, `work/[slug]`, `travels`, `about`, `now`, `contact`, `404`. |
| `src/styles/**` | Tokens and shared primitives: reset, container, grid, typography, buttons, links, status, shot, prose, motion and reduced-motion rules. |
| `public/**` | Fonts and licences, generated social cards, generated icons, favicon, manifest, robots and `.nojekyll`. |
| `scripts/**` | Artifact validator, social card and icon generators, canonical gate, workflow lock verifier, install helper. |
| `tests/*.test.mjs` | Content contract and SEO metadata tests using `node:test` (18 tests, no browser). |

### Routes

| URL | Source | Page entity | Notes |
| --- | --- | --- | --- |
| `/` | `src/pages/index.astro` | `ProfilePage` plus an `ItemList` of all projects | Root page, portrait hero, featured work, travels, CTA. |
| `/work/` | `src/pages/work/index.astro` | `CollectionPage` with an `ItemList` | Breadcrumb trail Home, Work. |
| `/work/<slug>/` | `src/pages/work/[slug].astro` | `CreativeWork` with `BreadcrumbList` | One page per project, generated from the collection. |
| `/travels/` | `src/pages/travels.astro` | `CollectionPage` | No breadcrumb list because it is a single-level section. |
| `/about/` | `src/pages/about.astro` | `AboutPage` with `mainEntity` Person | Breadcrumb trail Home, About. |
| `/now/` | `src/pages/now.astro` | `WebPage` with `dateModified` | Breadcrumb trail Home, Now. |
| `/contact/` | `src/pages/contact.astro` | `ContactPage` plus `ContactPoint` | Breadcrumb trail Home, Contact. Email only, no form. |
| `/404` | `src/pages/404.astro` | none | `noindex, nofollow`, no JSON-LD, excluded from the sitemap. Served as `404.html`. |

Every indexable page emits exactly one JSON-LD `@graph` containing `WebSite`, `Person` (portrait image, four profile `sameAs` links plus the Persian site, `owns` Noveno, `knowsAbout`), and one page entity typed `WebPage` with a narrower second type where applicable. Breadcrumbs are emitted where the page passes a trail. Canonical URLs, sitemap URLs, and every internal link use the trailing-slash form.

### Structured data and sharing

| Node | Pages | Contents |
| --- | --- | --- |
| `WebSite` | Every indexable page | Canonical origin, name, description, language, publisher Person node. |
| `Person` | Every indexable page | Name, alternate name, URL, email, job title, description, portrait `ImageObject`, five `sameAs` profiles, seven `knowsAbout` topics, owned Noveno organisation, country-level address. |
| Page entity | Every indexable page | `WebPage` plus a narrower second type where used: `ProfilePage` on home, `CollectionPage` on work and travels, `AboutPage`, `ContactPage`. Carries canonical, title, description, language, `isPartOf`, `primaryImageOfPage` and `mainEntity`; `/now/` adds `dateModified`. |
| `BreadcrumbList` | Work index, case studies, about, now, contact | Home plus the route item trail. `/travels/` has no trail because it is a single-level section. |
| `CreativeWork` | Each case study | Name, description, canonical, creator Person, creation year, product or client genre, stack keywords, website part, social card image, live URL when one exists. |
| `ItemList` | Home and work index | The nine projects with name, description and canonical URL. |
| `ContactPoint` | Contact | Professional enquiries email, English and Persian. |

Sharing metadata is generated from the same page props: Open Graph and Twitter tags, a 1200x630 JPEG card from `public/og/` for every indexable page, `og:type=article` on case studies, and `article:modified_time` where a page supplies an update date.

### Rendering and asset pipeline

1. `astro build` reads the content collections and validates frontmatter with zod. An invalid project or travel note fails the build rather than rendering incomplete.
2. Markdown bodies render through `render(entry)` on case study pages. Travel notes are metadata-only cards.
3. Imported images go through `astro:assets`, producing responsive WebP sources with explicit width and height. Project covers use widths 640 to 1600, index thumbnails 320 to 800, travel photos 320 to 720, portraits 280 to 640.
4. The layout builds the head from its props: title and suffix, description, canonical, robots, Open Graph and Twitter tags, JSON-LD, speculation rules and font preloads.
5. Indexable pages ship five inline script elements and no external chunk: the JSON-LD payload, the speculation-rules payload, the pre-paint theme guard, the theme toggle behaviour and the mobile dialog behaviour. The 404 carries only the three behaviour scripts because it has no structured data or prefetch rules.
6. Astro writes per-route `index.html` files, hashed CSS files and hashed image variants into `dist/`. All six current stylesheets are above Astro's auto-inline threshold, so CSS ships as external hashed files. `@astrojs/sitemap` writes `sitemap-index.xml` and `sitemap-0.xml`, filtering `404`.
7. `scripts/check-built-site.mjs` reads the finished artifact and fails on canonical, sitemap, metadata, JSON-LD, link, JavaScript, CSS, image or size regressions.

Social cards and icons are generated offline, not during the build: `npm run og` renders 1200x630 JPEG cards with locally installed Chrome and `sharp`, and `npm run icons` rasterises the brand mark with `sharp`. Both outputs are committed, so CI and a clean clone never need a browser or image renderer beyond `sharp` for Astro's image pipeline.

## Data flow and trust boundary

```text
Author
  edits src/** or content/** and generated assets
    -> git commit / pull request
      -> quality.yml: bash scripts/verify.sh
           format, 18 tests, astro check, Astro build, artifact check
      -> deploy.yml on main: install, check, build, upload dist, deploy Pages
        -> GitHub Pages serves immutable static files over HTTPS
          -> Visitor reads HTML, CSS, images and fonts
             theme preference stored in localStorage only
             email opens the visitor's mail client
             outbound social and live-site links leave the site
```

- The write path is author-controlled source in Git. No visitor input reaches a server, build, queue or database, because no input surface exists: no form, query-driven page, API, account or comment.
- Generated social cards and icons are treated as source artifacts. They are regenerated offline and committed; the build treats them as static files.
- Content honesty is a build and test contract: zod validates shape, `tests/projects.test.mjs` validates counts, ordering, word floors, link schemes, cover-to-asset parity and provenance, and `tests/seo-metadata.test.mjs` enforces the no em dash rule and metadata budgets.
- External links are outbound only. Project links are https-only under the content test, and outbound anchors use `rel="noopener"` where the destination is external. There is no inbound integration and no webhook.
- The only browser storage is `localStorage` key `theme` with values `light` or `dark`. There are no cookies, no session identifiers, no analytics beacons and no third-party scripts.
- Public identifiers are intentional: name, email, social handles, country-level location, portraits, project links. `.env.example` contains only `APP_ENV=development`; the Search Console verification value in the layout is public metadata, not a credential.
- Speculation rules prefetch same-origin pages without query strings, exclude `/404`, and use moderate eagerness. This is browser-local navigation acceleration and sends no user data anywhere else.

## Invariants

| Invariant | Why it matters | Enforced by |
| --- | --- | --- |
| Static artifact only, no client framework, no external JS chunks | Keeps the site copyable, cacheable and free of hydration and tracking surface. | `tests/projects.test.mjs` rejects `astro:transitions` and `client:load`; the artifact check counts `.js` files and requires zero. |
| Every URL uses the trailing-slash form | GitHub Pages redirects non-slash directory URLs; matching canonical, sitemap and links avoids redirects and duplicate signals. | `astro.config.mjs`, canonical normalisation in `Layout.astro`, slash assertions in the artifact check, slash assertions in links tests. |
| 15 indexable routes plus a noindex 404, with sitemap agreement | Search engines see exactly the intended page set. | Artifact check compares each canonical with the sitemap, requires 15 URLs, rejects `/404`, and asserts the 404 is noindex. |
| One JSON-LD `@graph` per indexable page with Person, WebSite and a page entity | Keeps identity and page meaning machine-readable from one block. | Artifact check requires exactly one block, parses it, checks types and a non-thin `sameAs`; 404 has none. |
| Unique title and description, one `h1`, `lang="en"`, indexable robots, existing social card | Baseline search and sharing correctness. | Artifact check per page, including the OG image file. |
| Internal links resolve, images have alt text and dimensions and real files | The artifact must be self-contained and accessible. | Artifact check walks every page. |
| CSS stays external and hashed | Caching without inlining the design system into every page. | Artifact check requires a linked stylesheet per page; source test pins `inlineStylesheets: "auto"`. |
| Content contract: nine projects (three products, six client), three travels, unique order and titles, honest status labels, no placeholders | The credibility claim depends on real, complete content. | Zod at build time plus `tests/projects.test.mjs`. |
| Real images only, one cover per real screenshot, provenance | No invented interface or stock proof. | Cover map parity test, cover alt presence test, `src/assets/SOURCES.md` reference test. |
| No em dash character in site copy | A mechanical house style rule, not a preference. | `tests/seo-metadata.test.mjs`. |
| Budgets: total HTML under 700K, no image over 300K, artifact under 8MB | The static-first performance claim must stay measurable. | Artifact check. |
| Fonts are vendored with licences | No third-party font request and a clean licence trail. | Tests require four woff2 files and both licence files, and `SOURCES.md` references. |
| Generated cards exist for every indexable page | Social sharing cannot point at a missing file. | `tests/seo-metadata.test.mjs` plus the artifact check per page. |

## Trailing-slash contract

GitHub Pages serves a directory route from `dir/index.html` and treats the non-slash form as a different URL, so a request for `/work` is answered with a redirect to `/work/`. The site therefore chooses one form deliberately: `trailingSlash: "always"` in `astro.config.mjs`.

The form is kept consistent at every layer rather than patched per page:

- Astro emits `/work/index.html`, `/about/index.html` and so on, with `404.html` as the only flat page.
- `Layout.astro` normalises `Astro.url.pathname` to end with a slash before building the canonical URL.
- `@astrojs/sitemap` receives those routes and the 404 filter, so all 15 sitemap URLs end in `/`.
- `src/data/site.ts` navigation, product links and `hrefFor` produce slash-terminated internal URLs.
- `scripts/check-built-site.mjs` fails if any sitemap URL or canonical drifts from the slash form, and `tests/seo-metadata.test.mjs` fails if a navigation href does not end in a slash.

Changing this contract means changing the canonical URL of every page, so treat it as a public-route change and update the artifact validator in the same change.

## Chosen patterns

| Area | Choice | Why | Revisit when |
| --- | --- | --- | --- |
| Site generation | Astro static output on GitHub Pages, no adapter, no SSR. | A credibility site needs no runtime; static output is the cheapest, fastest and most durable deployment on Pages. | A feature genuinely needs request-time behaviour and a backend is accepted. |
| Styling | Semantic tokens plus scoped component CSS; LightningCSS; external hashed CSS. | One palette and type system across routes, no utility or CSS-in-JS layer to fight, no runtime style cost. | The system grows large enough that component styles need a stronger sharing model. |
| Type safety | TypeScript strict, `noUncheckedIndexedAccess`, typed props and content collections. | Frontmatter, routes and SEO metadata fail at check time instead of in production. | Astro or TypeScript upgrades change the strict config contract. |
| Content model | File-based Markdown collections with zod schemas and typed asset maps. | Content is reviewable in Git, validated at build, and cannot reference an undeclared screenshot. | A second author needs a non-Git editing path, or content volume justifies a CMS. |
| Images | `astro:assets` responsive WebP with explicit dimensions, and eager priority only for above-the-fold hero imagery. | Real evidence without hand-managed variant files; width and height prevent layout shift. | A different image source or CDN is introduced. |
| Generated assets | Social cards and icons generated offline and committed. | The build stays deterministic and Chrome-free in CI; generated output is versioned with the source. | Card or icon churn becomes frequent enough to justify a post-build generation step. |
| SEO and structured data | One `@graph` per page from `src/lib/seo.ts`, committed social cards, sitemap, robots, manifest, rel-me links. | Identity, page meaning and sharing are consistent and centrally generated. | A custom domain, new route type or additional schema entity is added. |
| Persian sibling site | Linked as a language-marked outbound anchor (`lang="fa"`, with `hreflang="fa"` where it is presented as the Persian home), with no hreflang cluster. | The English and Persian content sets are not 1:1 translations, so a cluster would claim pairs that do not exist. | Maintained translation pairs are added and indexed. |
| Theme | Inline pre-paint guard, `data-theme`, `localStorage`, `prefers-color-scheme` fallback, accessible toggle. | No flash, system default, user override that survives navigation, no cookie and no server. | The site is required to follow the OS theme only. |
| Navigation | Sticky header, CSS-visible desktop nav, native `dialog` menu below 960px with inline behaviour script. | Native dialog gives focus containment, Escape and backdrop handling without a framework. | The information architecture outgrows a five-item navigation. |
| Motion | CSS transitions, one dialog entrance, `@view-transition` MPA transitions, reduced-motion guards; no ClientRouter. | Polish without hydration, an SPA router or JavaScript animation infrastructure. | Cross-browser view-transition parity is required and worth the complexity. |
| Error handling | Build-time validation plus a noindex editorial 404. | There is no runtime error path to design; failures should stop the build. | A runtime service is introduced. |
| Dependencies | Six devDependencies, no runtime packages, one lockfile. | Every dependency is a maintenance and supply-chain cost; the static site gains nothing from more. | A dependency replaces real code with a maintained, justified capability. |

## Explicitly rejected complexity

- SPA frameworks and client routers (Next.js, Remix, Astro ClientRouter, React or Vue islands): no interaction requires hydration, and the site must stay static with zero external JavaScript.
- Tailwind or CSS-in-JS: the design contract is a small semantic token system with hand-tuned editorial styles; a utility layer would obscure it and add build surface.
- Animation libraries (Framer Motion, GSAP), scroll hijacking, parallax, autoplay and WebGL: rejected by the motion budget and reduced-motion requirement.
- CMS, database, authentication, newsletter, comments and server-side forms: no content cadence or user account justifies them; email is the contact path.
- Analytics, RUM and tag managers: rejected by the product promise of no tracking; lab Lighthouse runs are the available performance evidence.
- Backend contact services (Formspree and similar): the site explicitly states it has no form and no tracker; `mailto:` is the contract.
- Font CDNs and npm font runtimes: four licensed woff2 files are vendored locally for privacy and performance.
- A search service, filtering, pagination or infinite scroll on nine projects: a static list is faster to scan and adds no state.
- Per-request dynamic social cards and an image CDN: cards are generated rarely and committed, so request-time rendering adds cost with no benefit.
- A custom error service or server redirects: GitHub Pages has no server; the 404 page and slash contract cover the actual failure modes.
- Committed browser test infrastructure, Lighthouse CI and visual regression in CI: no browser tool is part of the default environment; lab runs are recorded as observations, not CI automation.

## Operational baseline

### Commands

| Purpose | Command | Notes |
| --- | --- | --- |
| Install | `bash scripts/ci-install.sh` | Detects the single committed lockfile and runs `npm ci`; no other lockfile is allowed. |
| Develop | `npm run dev` | Astro dev server, hot reload. |
| Build | `npm run build` | `astro build` only. Social cards and icons are committed and not regenerated. |
| Preview | `npm run preview` | Serves the built `dist/` on port 4321. Use this for browser QA. |
| Type and content check | `npm run check` | `astro check`: TypeScript, Astro files and content schema. Observed 0 errors, 0 warnings, 0 hints on 2026-11-23. |
| Tests | `npm test` | `node --test tests/projects.test.mjs tests/seo-metadata.test.mjs`; 18 tests, 18 pass on 2026-11-27. |
| Format and lint | `npm run format:check` | Biome check over `src` and `scripts`. |
| Type check plus build | `npm run ci` | `npm run check && npm run build`. |
| Artifact check | `node scripts/check-built-site.mjs` | Run after build; also run by the canonical gate. |
| Canonical gate | `bash scripts/verify.sh` | Conflict and whitespace checks, workflow lock, script syntax, skill frontmatter, format, tests, check and build, then artifact check. |
| Regenerate social cards | `npm run og` | Needs a local Chrome binary; set `CHROME_PATH` when detection fails. Commit the JPEG output. |
| Regenerate icons | `npm run icons` | Uses `sharp`; commit the PNG output. |
| Verify workflow pin | `node scripts/verify-workflow.mjs` | Offline check that vendored DSH skills match `.dsh/workflow.json`. |

### Continuous integration and deployment

| Workflow | Trigger | Runs | Releases |
| --- | --- | --- | --- |
| `quality.yml` | Pull requests and pushes to `main` | `bash scripts/verify.sh` on Node 22.23.2, 15 minute timeout | Nothing. It is the correctness gate. |
| `deploy.yml` | Pushes to `main` and manual dispatch | Install, `npm run check`, `npm run build`, upload `dist/`, deploy with `actions/deploy-pages`; Node 22.23.2, 10 minute timeout, Pages concurrency group | Publishes the artifact to GitHub Pages. |

`deploy.yml` does not rerun tests, formatting or artifact checks; `quality.yml` runs the canonical gate on the same `main` push and owns those lanes. By project policy a pull request passes `verify.sh` before merge, and nothing is deployed from a branch.

### Artifact and recovery

- The build produces 16 static HTML files, the sitemap index and URL set, hashed CSS and image variants, a copied `public/` tree including 15 committed social cards and four fonts, and no JavaScript chunks. The report on 2026-11-27: 15 pages verified, 127 images, 4.95MB, all artifact checks pass.
- `dist/` and `.astro/` are build output and are not committed. `public/og/**`, `public/icons/**`, `public/apple-touch-icon.png`, fonts and `.nojekyll` are source artifacts and are committed.
- A warm Astro build produced 16 pages in about 1.3 seconds; `npm run build` end to end took about 2 seconds in the 2026-11-27 run. The build is deterministic from the lockfile and committed assets.
- Rollback is `git revert <sha>` on `main` and push. `deploy.yml` rebuilds that commit and republishes it; the previous commit remains deployable. There is no database, migration, queue or server state to undo.
- Monitoring is the workflow status plus a manual Lighthouse lab run against `npm run preview`. There is no runtime logging, error reporting or traffic telemetry by design, so failures are build and deploy failures, not production incidents.
- Secrets: no repository secrets are required. Deployment uses the permissions declared in `deploy.yml` (contents read, pages write, id-token write), and `.env.example` documents only `APP_ENV=development`.

## Agent interfaces

- **Install:** `bash scripts/ci-install.sh`. Read `package-lock.json` only through npm; do not hand-edit it or add a second lockfile.
- **Change loop for content:** edit `src/content/projects/*.md` or `src/content/travels/*.md`; run `npm run check` and `npm test`; run `npm run build` and `node scripts/check-built-site.mjs`. Regenerate social cards with `npm run og` when copy, screenshots or card design change, and commit the output.
- **Change loop for interface or tokens:** edit the owning component, page or `src/styles/*`; run `npm run check`, `npm test`, and `npm run build` plus the artifact check. A token change requires updating the measured contrast table in [DESIGN.md](DESIGN.md).
- **Test entrypoints:** `npm test` for the content contract and metadata; `node scripts/check-built-site.mjs` for the served artifact; `bash scripts/verify.sh` for the canonical gate. There is no Playwright config, no browser test runner and no screenshot suite in the repository.
- **Browser QA entry:** run `npm run preview` (serves `dist/` on `http://localhost:4321`) and exercise the route from a browser-capable tool. If no browser tool is available, visual and interaction claims are `UNPROVEN`; source checks are not a substitute. Record route, viewport, theme and the state actually exercised.
- **Diagnostics:** `astro check` reports type and content-schema problems with file and line; `npm run build` reports collection and route failures; Biome reports format and lint drift; `check-built-site.mjs` prints one `PASS` or `FAIL` line per artifact rule; `verify-workflow.mjs` reports lock mismatches.
- **Public contracts and risk:** routes and the trailing-slash form, DESIGN tokens and accessibility budget, content schemas, `src/data/site.ts` and the JSON-LD contract are public. Changing them requires explicit scope and the full gate. Generated assets, CI or deploy changes, dependency upgrades and structured-data changes are high risk: use independent review when available. Publication still requires the explicit authorization described in [GIT_POLICY.md](GIT_POLICY.md).

### Deferred operational changes

- Field RUM or analytics is deferred by the no-tracking product contract, so lab Lighthouse remains the only performance evidence.
- Lighthouse CI, committed browser screenshots and visual regression testing are deferred until a browser-capable CI lane is justified.
- A custom domain and CNAME are deferred; changing them would touch `site.url`, `astro.config.mjs`, canonical, sitemap, the artifact validator and the manifest.
- Dependency upgrades are normal maintenance but require the full gate and a check that the Astro version still emits the expected static structure.

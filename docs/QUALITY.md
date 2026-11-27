# Quality Contract: Danial Rashidi Personal Site

Evaluator-facing quality bar for the English Astro static site at `https://imdanialrashidi.github.io`. Updated 2026-11-23 for the English parity rebuild from repository evidence. Workflow sections follow DSH Workflow v0.2 (`.dsh/workflow.json`); commands and evidence live here and in [WORKFLOW.md](WORKFLOW.md); product outcomes live in [PRODUCT.md](PRODUCT.md).

## Release rule

A change is not complete because the code compiles or the happy-path test passes. Every accepted behavior must be implemented rather than stubbed, exercised at the appropriate layer, and supported by evidence.

A required criterion that is unproven is **not passed**.

## Functional completeness

For accepted scope:

- controls that imply behavior must actually perform that behavior;
- persistence must survive the lifecycle promised by the product;
- displayed state must come from the authoritative source rather than a convenient fake;
- required error, empty, loading, disabled, success, permission, retry, and recovery states must behave coherently;
- no accepted feature may be satisfied by a placeholder, TODO handler, mock response, display-only control, or hard-coded success path unless the contract explicitly says it is a prototype.

## Correctness

- Preserve domain invariants across success and failure paths.
- Validate external/untrusted data at boundaries.
- Handle retries, duplicate requests, time, rounding, ordering, partial failure, and concurrency where they are material to the changed behavior.
- A production bug should gain regression evidence when practical.
- Tests should assert behavior and contracts rather than implementation trivia.
- A new regression test should demonstrably fail on pre-fix behavior (or a safe focused mutation/equivalent independent characterization) when practical, then pass after the fix.
- Generated tests must build, pass reliably, add a distinct behavioral signal, and isolate relevant state; line coverage alone is not acceptance evidence.

### Test Value Gate

`test-design` owns this gate; apply it before adding or materially changing tests.

A new or materially changed test is retained only when it identifies:

1. an observable contract or invariant;
2. a plausible failure it can detect;
3. a gap not already covered by an existing test, type, schema, or deterministic check;
4. the cheapest faithful layer;
5. an oracle independent from the implementation under test; and
6. red-before-green, a controlled focused mutation, or equivalent defect-sensitivity evidence when practical.

Extend an existing case only to close a distinct evidence gap; otherwise add no test. `No new test` is an acceptable professional outcome for behavior-neutral changes or behavior already proved by the suite. Coverage, assertion count, and test count are diagnostic signals, not acceptance goals.

A test must justify what could break, why existing evidence misses it, and how it would detect that failure. Keep this explanation proportional; do not create a separate test-plan document for a small edit. Never substitute mocked unit tests for a real integration risk, or use prose/source-text matching as proof that an agent follows instructions. Preserve explicit machine-format and architecture checks where those are the contract.

Select one representative per equivalence class and exact material boundaries. Use decision tables, pairwise cases, or properties for meaningful interactions instead of Cartesian enumeration. Prefer the lowest-cost layer that preserves the real contract; use full end-to-end tests only for failures lower layers cannot represent.

Do not compute expected values with the implementation's own logic, mock the subject/authority, verify private calls unless contractual, test framework or third-party behavior, use broad incidental snapshots, blind-update snapshots, sleep/retry away nondeterminism, or duplicate cases that add no distinct behavioral signal. Mocks are reserved for owned boundaries that are expensive, nondeterministic, or unsafe. Browser tests use user-visible behavior and accessible roles/labels, keep independent state, and exercise only the journey that requires a browser.

## Security and data integrity

For trust-boundary changes, apply the focused risk review below.

At minimum:

- authorization and ownership are enforced server-side;
- client-provided roles, prices, payment/subscription states, ownership, and permissions are never authoritative;
- secrets and sensitive data do not enter source, logs, screenshots, fixtures, prompts, or public artifacts;
- money/callback/state-transition operations are verified, idempotent, replay-aware, and auditable where applicable;
- schema/data changes have compatibility, rollback/recovery, and failure-path reasoning.

The site has no server, auth, form, payment or database. Its real security surface is publication hygiene (secrets and private material stay out of the repository) and the integrity of static links and structured data.

### Focused risk review

Review only the accepted scope and actual diff. Trace changed trust boundaries, input-to-sink data flows, state transitions, public contracts, dependencies, and operational behavior; check the actual controls and tests before reporting a finding.

Check only relevant failure paths: authorization/tenant isolation, injection and unsafe files/URLs, credential/session handling, payment/replay/idempotency, races and partial writes, timeout/cancellation/recovery, unbounded work, inaccessible/error states, dependency/CI mismatch, migration rollback. For high-risk scopes prefer a `review` pass; otherwise a direct evidence-focused pass.

For each evidence-backed finding give severity, `file:line` or symbol, a concrete failure/attack scenario, why the current control is insufficient, the smallest safe fix, and a proof test. Prefer a few actionable findings over speculative checklist output.

- **BLOCKER:** exploitable security, data loss/corruption, money/access violation, migration/deployment breakage, or a broken critical flow.
- **MAJOR:** likely user-visible correctness/reliability failure or substantial security/performance regression.
- **MINOR:** bounded defect or maintenance risk.
- **NIT:** optional clarity/style improvement; never a release blocker.

Return the acceptance evidence and one verdict: `PASS`, `PASS WITH FIXES`, or `BLOCK`. `PASS` requires proven required criteria and no unresolved BLOCKER/MAJOR. Use the `review` skill for the complete review procedure.

## User-facing quality

For rendered interfaces:

- exercise the critical journey in a real browser when a browser-capable tool is available; otherwise mark visual and interaction criteria `UNPROVEN`;
- preserve keyboard access, visible focus, semantic controls, labels, contrast, touch targets, and reduced-motion behavior;
- check realistic data, long text, localization/RTL when relevant, and at least one narrow viewport for mobile-facing surfaces;
- follow the accepted `docs/DESIGN.md`; use existing design tokens/components when they remain sound and change them deliberately when the accepted direction requires it;
- do not add explanatory copy that merely restates obvious UI;
- visual polish cannot compensate for missing interaction depth or broken behavior.

Default accessibility baseline when the product has not chosen a stricter target:

- WCAG 2.2 AA;
- text contrast at least 4.5:1, or 3:1 for qualifying large text;
- non-text UI/state contrast at least 3:1 where WCAG requires it;
- reflow without loss of information/functionality at 320 CSS px where the content is not inherently two-dimensional;
- usable at 200% text zoom, with clear visible focus and meaning that does not depend on color alone.

The project target is WCAG 2.2 AA. Lab evidence of 2026-11-23 recorded Lighthouse accessibility 100 on `/`, `/work/`, `/work/noveno/`, `/about/` and `/contact/`. A manual screen-reader pass and cross-browser interaction pass are not part of that bundle and stay `UNPROVEN`.

### Visual excellence

For a new interface, redesign, launch surface, or explicitly high-aesthetic task, apply the repository rubric in [VISUAL_REVIEW.md](VISUAL_REVIEW.md) and evaluate the rendered result against the accepted design contract.

Require:

- a product-specific visual thesis and one restrained signature element;
- typography, palette, composition, geometry, media, and motion derived from the product/audience rather than interchangeable defaults;
- semantic tokens and coherent components without turning every section into the same card;
- mobile recomposition rather than simple shrinkage;
- real content and deliberately designed loading, empty, error, success, focus, selected, disabled, and permission states as relevant;
- one product/interaction browser pass and one independent studio/aesthetic pass;
- named desktop, mobile, and demanding-state evidence when the application can run.

Hard-gate failures cannot be offset by aesthetic scoring. The ordinary production craft threshold is 2.75/4 with no dimension below 2; an explicitly flagship surface requires 3.25/4 with every dimension at least 3. Any criterion that depends on rendered evidence is `UNPROVEN` when only code was inspected.

## Reliability and performance

Apply only where relevant to the changed path:

- avoid unbounded reads/work, N+1 access, duplicate calls, uncontrolled concurrency, and blocking hot paths;
- use explicit timeouts/cancellation/retries where the boundary requires them;
- preserve meaningful non-sensitive logs or diagnostics for critical transitions;
- performance claims require a reproducible baseline and after-measurement;
- a flaky test or intermittent runtime path is a reliability defect, not automatic permission to weaken the gate.

For production web surfaces without accepted product-specific field budgets, use current Core Web Vitals `good` thresholds as targets at the 75th percentile, segmented by mobile and desktop: LCP ≤ 2.5 s, INP ≤ 200 ms, and CLS ≤ 0.1. Before field data exists, require an accepted repeatable lab budget, RUM instrumentation, and a staged-rollout check. Lab results are pre-production signals; do not present them as field/RUM proof.

This project records no RUM or field data by design. Performance acceptance is a lab budget only: Lighthouse on a local preview, and the artifact budgets in `scripts/check-built-site.mjs`.

## Maintainability and architecture

- Prefer existing project patterns and stable framework/platform primitives.
- Keep public interfaces small and backward-compatible unless a breaking change is accepted.
- Keep business rules separable from presentation/transport when the existing architecture supports it.
- New abstractions should solve more than one real current use case or remove a demonstrated risk/duplication.
- New dependencies require a concrete benefit over existing/platform capabilities. The current dependency set is deliberately small: Astro, `@astrojs/sitemap`, `@astrojs/check`, TypeScript, Biome, and `sharp` (generation scripts only).
- Architecture invariants that matter repeatedly should be enforced mechanically with types, lint rules, structural tests, schemas, or CI rather than prose alone.

## Evidence hierarchy

Prefer stronger evidence when practical:

1. deterministic automated check of the accepted behavior;
2. a real runtime run or a browser exercise when available;
3. type/lint/structural analysis and `astro check` diagnostics for invariant classes;
4. reproducible measurement for performance/reliability claims;
5. focused independent review (`review` skill or fresh subagent) for aspects that cannot be automated economically.

A reviewer or subagent opinion alone is not proof.

## Evaluator rubric

An evaluator should assess the accepted contract, not invent adjacent scope.

For each acceptance criterion return one of:

- **PASS:** implementation and evidence satisfy the criterion;
- **FAIL:** evidence demonstrates incorrect/incomplete behavior;
- **UNPROVEN:** implementation may exist but adequate evidence is missing;
- **BLOCKED:** a genuine prerequisite prevents verification.

Then inspect cross-cutting regression risk only where the diff makes it relevant.

The overall task cannot be called complete while a required criterion is `FAIL` or `UNPROVEN`, or while a required independent review has an unresolved BLOCKER/MAJOR finding.

## Project-specific quality invariants

Confirmed from `package.json`, `astro.config.mjs`, `src/data/site.ts`, `src/content.config.ts`, `src/lib/work.ts`, `src/lib/travels.ts`, `src/lib/seo.ts`, `src/layouts/Layout.astro`, `tests/*.test.mjs`, `scripts/*.mjs` and the CI workflows.

- Architecture direction: `src/data/site.ts` (site, socials, navigation, products, `persianSite`, `knowsAbout`) -> `src/content.config.ts` (zod schemas for the `projects` and `travels` collections only) -> `src/lib/work.ts` (cover map, hrefs, ordering, featured/client split, next project, kind label), `src/lib/travels.ts` (image map, ordering) and `src/lib/seo.ts` (canonical helpers, breadcrumbs, JSON-LD nodes) -> `src/pages/**` + `src/components/**` + `src/layouts/Layout.astro`. Pages and components import from `lib`/`data`, never the reverse; `content.config.ts` owns validation.
- Route contract: 15 indexable routes plus 404. `/work/index.astro` and `/work/[slug].astro` are the only work pages; there are no bespoke per-project `.astro` case studies. `/travels/`, `/about/`, `/now/` and `/contact/` are pages. Every canonical and internal URL uses the trailing-slash form because `trailingSlash: "always"` matches GitHub Pages directory serving. `/404.html` is `noindex` and excluded from the sitemap. Enforced by `tests/projects.test.mjs`, `tests/seo-metadata.test.mjs` and `scripts/check-built-site.mjs`.
- Content honesty: nine English case studies (three own products, six client builds) and three travel notes. `hasVisual` is not used; real screenshots are mapped in `src/lib/work.ts` from `src/assets/work/*.webp` and checked 1:1 against `cover` values. Every project has a real screenshot, including Fast English and Kidotalks. Provenance is `src/assets/SOURCES.md`. Status labels are `building`, `live`, `shipped` and `in_development`, mirrored honestly in the UI and structured data. No invented metrics, screenshots or testimonials; no em dash characters in site copy. Enforced by `tests/projects.test.mjs` and `tests/seo-metadata.test.mjs`.
- Static-first performance contract: no `ClientRouter`, no `client:load`, no framework islands, no external JavaScript chunks. The five inline script elements on content pages are the theme FOUC guard, theme behavior, mobile dialog behavior, JSON-LD, and speculation rules. Global CSS ships as one external hashed file (`inlineStylesheets: "auto"`); cross-document view transitions are CSS only. Fonts are four vendored woff2 files in `public/fonts` (Geist latin 28K, Geist Mono latin 31K, Instrument Serif regular 21K, italic 22K; 103K with OFL licenses). Enforced by `tests/projects.test.mjs` and `scripts/check-built-site.mjs`.
- SEO and identity contract: one canonical, one unique title and description per indexable page, robots meta with `max-image-preview:large` and `max-snippet:-1`, Google and Bing verification tokens, one JSON-LD `@graph` per page (WebSite, Person with `image`/`sameAs`/`owns`/`knowsAbout`, page entity with a narrower type, BreadcrumbList where relevant, CreativeWork for projects, ItemList), a committed 1200x630 JPEG social card per page in `public/og`, `rel="me"` identity links, manifest and icons, `robots.txt` pointing at `sitemap-index.xml`, and a trailing-slash sitemap with 15 URLs. Enforced by `tests/seo-metadata.test.mjs` and `scripts/check-built-site.mjs`.
- Persian parity decision: the Persian site `https://danialrashidi.ir` remains the Persian home and is linked with `lang="fa"` from the header, footer and page copy. There is no `hreflang` cluster because the content sets are not 1:1; revisit only when every page has a true twin. The Persian support page is not mirrored.
- Accessibility target: WCAG 2.2 AA, semantic landmarks, one `h1` per page, skip link, visible focus, keyboard-operable header dialog (`role="dialog"`, `aria-modal`, `aria-expanded`, Escape and click-away), `aria-pressed` theme toggle, light and dark themes, reduced-motion reset. Lab evidence: Lighthouse accessibility 100 on the audited routes of 2026-11-23. Manual screen-reader and cross-browser passes remain `UNPROVEN`.
- Performance budget (lab, before RUM): LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 as targets at the 75th percentile. Build budget: 16 pages, dist under 5MB including 15 social cards and 99 image variants, all HTML 459K, zero external JS chunks, 103K fonts. Artifact limits enforced: total HTML under 700K, no image over 300K, dist under 8MB.
- Browser and device matrix: evergreen Chromium, Firefox and Safari; keyboard, touch and pointer; viewports 320, 375, 768 and 1280; no IE. Recorded lab evidence is Chromium headless, so cross-browser rendering is `UNPROVEN`.
- Visual contract: `docs/DESIGN.md` owns tokens, typography, geometry, components, motion, content voice and screen acceptance. There is no second design system: no Tailwind, no CSS-in-JS, no UI framework, no glassmorphism or particle effects.
- Canonical release gate: `bash scripts/ci-install.sh` (`npm ci`), then `bash scripts/verify.sh`. The gate runs conflict-marker and whitespace checks, the vendored workflow check (`scripts/verify-workflow.mjs`), script syntax, domain-skill frontmatter, `npm run format:check` (Biome), `npm test` (`node --test tests/projects.test.mjs tests/seo-metadata.test.mjs`), `npm run ci` (`npm run check` plus `npm run build`, 16 pages), and `node scripts/check-built-site.mjs`. `.github/workflows/quality.yml` runs the same gate on pull requests and `main`. `.github/workflows/deploy.yml` runs `npm run check`, `npm run build`, uploads `dist/` and deploys with `actions/deploy-pages`. Rollback is `git revert` plus redeploy; `dist/` is ephemeral.
- Generated assets: `public/og/**/*.jpg` is produced by `npm run og` (local Chrome needed for rendering) and `public/icons/*.png`, `public/apple-touch-icon.png` by `npm run icons`. Both are committed, are not rebuilt by CI, and must be regenerated when page copy or screenshots change. `public/fonts/*.woff2` and the OFL license files are committed.
- Structural checks that are mechanically enforced: `scripts/verify-workflow.mjs` (workflow pin, exact seven-skill set, sha256); `tests/projects.test.mjs` (9 projects, 3/6 split, unique order, schema-shaped frontmatter, body length and no em dash, cover/asset 1:1, three travels with both calendars and real photos, shared helper export surface, route shape, no ClientRouter or client:load, asset provenance); `tests/seo-metadata.test.mjs` (layout SEO markers, title budgets, canonical path arguments, config invariants, robots.txt, trailing-slash internal URLs, social card files, no em dashes in site copy, built-artifact gate presence); `scripts/check-built-site.mjs` (artifact-level canonical/sitemap/trailing-slash agreement, titles/descriptions/robots/lang/h1, OG files, JSON-LD graph, internal links, image files with alt and dimensions, zero JS chunks, external CSS, no oversized image, dist budget); `biome.json` format and lint; `tsconfig.json` strict plus `noUncheckedIndexedAccess`.
- Failure evidence: keep it concise and attributable. Use `npm run check` diagnostics, the `npm run build` log, `npm test` output, the Biome report, `node scripts/check-built-site.mjs` failures, and a clean browser console. Secrets never appear in logs, fixtures or screenshots (see [SECURITY.md](../SECURITY.md)).
- Regression test sensitivity: a new regression test must demonstrably fail on pre-fix behavior (or a narrow focused mutation of the fixed line) and pass after the fix. Line coverage alone is insufficient.
- Flaky test handling: flaky or intermittent paths are defects, not permission to weaken the gate. Isolate or quarantine with an explicit reason and tracking issue, reproduce with a fixed seed, and do not add automatic retries to `scripts/verify.sh`.

## Recorded verification evidence (2026-11-23)

Observed on the working tree before the documentation pass. Record these as evidence, not as new claims; rerun them on the final tree before delivery.

| Check | Command | Result |
| --- | --- | --- |
| Type and content check | `npm run check` | 0 errors, 0 warnings, 0 hints (33 files) |
| Tests | `npm test` | 18 tests pass, 0 fail |
| Build | `npm run build` | 15 pages |
| Built artifact | `node scripts/check-built-site.mjs` | PASS for 14 pages, 114 images, 4.5MB total |
| Canonical gate | `bash scripts/verify.sh` | all required checks pass |
| Lighthouse desktop home | local preview, Chrome headless | Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 0.4 s, CLS 0.001, TBT 0 ms |
| Lighthouse mobile home | local preview, Chrome headless, mobile emulation | Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2.0 s, CLS 0.001, TBT 0 ms |
| Lighthouse audited routes | `/work/`, `/work/noveno/`, `/about/`, `/contact/` | accessibility 100 and SEO 100 with no failing audits |
| Field data / RUM | none shipped | `UNPROVEN`, lab evidence only |

The review environment was a local preview server with Lighthouse in Chrome headless. No production, field, screen-reader or cross-browser measurement is part of this bundle.

## Recorded verification evidence (2026-11-27)

Working tree for the Kidotalks addition, the Fast English client classification, the Bing verification meta tag and the home hero portrait.

| Check | Command | Result |
| --- | --- | --- |
| Type and content check | `npm run check` | 0 errors, 0 warnings, 0 hints (33 files) |
| Tests | `npm test` | 18 tests pass, 0 fail |
| Build | `npm run build` | 16 pages |
| Built artifact | `node scripts/check-built-site.mjs` | PASS for 15 pages, 127 images, 4.95MB total |
| Canonical gate | `bash scripts/verify.sh` | all required checks pass; exit 0 |
| Bing verification | built-artifact check | `msvalidate.01` token present on every indexable page |
| Rendered pages | local preview, Chrome headless | `/`, `/work/` and `/work/kidotalks/` rendered at 1440 and 375 and inspected; no missing images or visible clipping in the captured viewports |

Lighthouse was not rerun for this content change. The 2026-11-23 lab numbers above are the baseline and are not claimed for the new Kidotalks route or the new hero image. Dark theme, Firefox, Safari, assistive technology and field data remain `UNPROVEN`.

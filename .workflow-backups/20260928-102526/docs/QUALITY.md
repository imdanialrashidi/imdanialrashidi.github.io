# Quality Contract — Danial Rashidi Personal Site

Evaluator-facing quality bar for the Astro static portfolio at `https://imdanialrashidi.github.io`. Updated 2026-08-27 from repository evidence.

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

A new or materially changed test is retained only when it identifies:

1. an observable contract or invariant;
2. a plausible failure it can detect;
3. a gap not already covered by an existing test, type, schema, or deterministic check;
4. the cheapest faithful layer;
5. an oracle independent from the implementation under test; and
6. red-before-green, a controlled focused mutation, or equivalent defect-sensitivity evidence when practical.

If no distinct failure model or evidence gap exists, extend an existing case or add no test. `No new test` is an acceptable professional outcome for behavior-neutral changes or behavior already proved by the suite. Coverage, assertion count, and test count are diagnostic signals—not acceptance goals.

Select one representative per equivalence class and exact material boundaries. Use decision tables, pairwise cases, or properties for meaningful interactions instead of Cartesian enumeration. Prefer the lowest-cost layer that preserves the real contract; use full end-to-end tests only for failures lower layers cannot represent.

Do not compute expected values with the implementation's own logic, mock the subject/authority, verify private calls unless contractual, test framework or third-party behavior, use broad incidental snapshots, blind-update snapshots, sleep/retry away nondeterminism, or duplicate cases that add no distinct behavioral signal. Mocks are reserved for owned boundaries that are expensive, nondeterministic, or unsafe. Browser tests use user-visible behavior and accessible roles/labels, keep independent state, and exercise only the journey that requires a browser.

## Security and data integrity

For trust-boundary changes, require the `risk-review` workflow.

At minimum:

- authorization and ownership are enforced server-side;
- client-provided roles, prices, payment/subscription states, ownership, and permissions are never authoritative;
- secrets and sensitive data do not enter source, logs, screenshots, fixtures, prompts, or public artifacts;
- money/callback/state-transition operations are verified, idempotent, replay-aware, and auditable where applicable;
- schema/data changes have compatibility, rollback/recovery, and failure-path reasoning.

## User-facing quality

For rendered interfaces:

- exercise the critical journey in the real browser when browser behavior matters;
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

### Visual excellence

For a new interface, redesign, launch surface, or explicitly high-aesthetic task, load `frontend-design` and evaluate the rendered result using its visual-quality rubric.

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

## Maintainability and architecture

- Prefer existing project patterns and stable framework/platform primitives.
- Keep public interfaces small and backward-compatible unless a breaking change is accepted.
- Keep business rules separable from presentation/transport when the existing architecture supports it.
- New abstractions should solve more than one real current use case or remove a demonstrated risk/duplication.
- New dependencies require a concrete benefit over existing/platform capabilities.
- Architecture invariants that matter repeatedly should be enforced mechanically with types, lint rules, structural tests, schemas, or CI rather than prose alone.

## Evidence hierarchy

Prefer stronger evidence when practical:

1. deterministic automated test of the accepted behavior;
2. real browser/API/database exercise of the relevant journey;
3. type/lint/structural/static analysis for invariant classes;
4. reproducible measurement for performance/reliability claims;
5. focused independent-evaluator inspection for aspects that cannot be automated economically.

A reviewer or subagent opinion alone is not proof.

## Evaluator rubric

An evaluator should assess the accepted contract, not invent adjacent scope.

For each acceptance criterion return one of:

- **PASS** — implementation and evidence satisfy the criterion;
- **FAIL** — evidence demonstrates incorrect/incomplete behavior;
- **UNPROVEN** — implementation may exist but adequate evidence is missing;
- **BLOCKED** — a genuine prerequisite prevents verification.

Then inspect cross-cutting regression risk only where the diff makes it relevant.

The overall task cannot be called complete while a required criterion is `FAIL` or `UNPROVEN`, or while a required independent review has an unresolved BLOCKER/MAJOR finding.

## Project-specific quality invariants

Confirmed from `package.json`, `astro.config.mjs`, `src/styles/tokens.css`, `src/content.config.ts`, `src/lib/projects.ts`, `tests/projects.test.mjs`, and CI:

- Architecture direction: `src/data/site.ts` (single source for site/social/nav/constants) → `src/content.config.ts` (zod schemas, `glob` loaders for `projects`/`profile`/`now`) → `src/lib/projects.ts` (pure helpers: `isDraft`, `statusLabelFor`, `hrefFor`, `kickerFor`, `variantFor`, `imageFor`, `cardPropsFor`, `getDisplayProjects`/`getFeaturedProjects`/`getClientProjects`) → `src/pages/**` + `src/components/**` + `src/layouts/Layout.astro`. Pages/components import from `lib`/`data`, never the reverse; `content.config.ts` owns validation.
- Content honesty: No invented metrics/screenshots/testimonials. `hasVisual` defaults `false` (abstract placeholder when no real preview); real hero screenshots in `src/assets/work/*` with provenance `src/assets/work/SOURCES.md`; statuses `draft`/`in_progress`/`published`/`building` filtered via `isDraft` (draft excluded from display) — enforced by `tests/projects.test.mjs`.
- Security boundary: Author → Git → CI (`npm run check` → `npm run build`) → Pages (`actions/deploy-pages`). No server, no DB, no auth. `caseStudy` links validated by zod refine `/^(\/|https?:\/\/)/` and not `javascript:` (schema level + test). `localStorage` theme only; no cookie; external links `rel="noopener noreferrer"` / `rel="me"` where needed.
- Accessibility target: WCAG 2.2 AA enforced — text ≥4.5:1, large/UI ≥3:1 per `src/styles/tokens.css` table in `docs/DESIGN.md`; reflow at 320 CSS px verified; 200% zoom usable; visible `:focus-visible` ring `rgba(15,76,255,0.4)`; skip-link; header `role=dialog aria-modal` with `aria-expanded`, Escape + click-away, `ThemeToggle` `aria-pressed`, touch 36–44 px.
- Performance budget (lab, before RUM): LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1 as targets at 75th percentile. Enforce via lab budgets: CSS 23K foundation → ~90K inlined shipped (`build.inlineStylesheets: "always"`, `lightningcss`), fonts 139K (`public/fonts/Geist*`), JS 0 external + ~2K inline, portrait `Assets/Danial_photo.webp` 85K → 4 `dist/_astro/Danial_photo.*.webp` variants, OG 30.8K, `Astro` static with `astro:assets` widths `[320,480,640]`.
- Browser/device matrix: Evergreen Chromium/Firefox/Safari, keyboard + touch + pointer, viewports 320/375/780/1280 (verified no overflow/horizontal scroll), no IE. `font-display: swap`, preload Sans only.
- Visual contract: `docs/DESIGN.md` tokens/typography/geometry/components are authoritative; no second design system, no Tailwind, no glassmorphism/particles per rejected complexity.
- Canonical release gate: `bash scripts/ci-install.sh` (npm ci), then `npm run check` (`astro check` strict + content zod) and `npm run build` (`node scripts/generate-og.mjs && astro build`) must pass; PRs additionally require `npm run format:check` (`biome check`) and `bash scripts/verify.sh` (harness doctor + ci fallback). Deploy gate is `deploy.yml` on `main` push (`npm run check` → `npm run build` → `actions/upload-pages-artifact` `dist/` → `actions/deploy-pages`). Previous `main` always deployable (`git revert` rollback, `dist/` ephemeral).
- Structural checks that are mechanically enforced: `tests/projects.test.mjs` (pure helper parity, `javascript:` block, draft filtering, work-index count, shared `cardPropsFor` usage, `src/lib/projects.ts` export surface), `biome.json` lint/format, `tsconfig.json` strict (`astro/tsconfigs/strict`, `noUncheckedIndexedAccess`), content schema at build time via `astro check`.
- Failure evidence: Concise — `npm run check` diagnostics, `npm run build` log, `node --test tests/projects.test.mjs` output, Biome `format:check` report, browser console (must be clean, preload warning for Mono removed), and `dist/` existence for build proofs. Secrets never appear in logs/fixtures/screenshots (see `SECURITY.md`).
- Regression test sensitivity: A new regression test must demonstrably fail on pre-fix behavior (or a narrow focused mutation of the fixed line) and pass after the fix — e.g., `tests/projects.test.mjs` frontmatter `javascript:` caseStudy mutant or draft-filter inversion must fail before fix and pass after; line coverage alone is insufficient.
- Flaky test handling: Flaky or intermittent paths are defects, not gate-weakening permission — isolate (quarantine suite with explicit `skip` reason and tracking issue), reproduce with fixed seed, quarantine without `retry` normalization; weakening `verify.sh` or adding automatic retries is prohibited until root cause is fixed.

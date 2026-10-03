# Product Roadmap — Danial Rashidi Personal Site

Execution state for the shipped static portfolio at `https://imdanialrashidi.github.io`. Updated 2026-08-27 from repository evidence at `main`. Task-level multi-session state lives in `docs/exec-plans/active/` when continuity needs it.

## Outcome and boundaries
- Product outcome: A fast, honest, static credibility hub answering in ~15 seconds who Danial is, what he builds (Web · AI · Automation · Product Engineering, Building Noveno), and how to reach him, with verifiable project profiles and no invented proof.
- Measurable success: Visitor reaches `/work` or `/contact` in one click from hero, can state focus without confusion, and site meets lab budgets (LCP ≤2.5 s, CLS ≤0.1, WCAG 2.2 AA) at 320/375/1280. Build gates `npm run check && npm run build` pass locally and on Pages deploy.
- Explicit non-goals: `/writing` blog/notes, CMS/DB/auth/newsletter, analytics/RUM v1, backend contact form, framework islands, Tailwind/CSS-in-JS, heavy motion/WebGL (see `docs/PRODUCT.md` Non-goals and `docs/ARCHITECTURE.md` rejected complexity).
- Deadline / capital / compliance constraints: No calendar deadline. Must remain static-only (GitHub Pages, `output: static`, `trailingSlash: never`), Node ≥22.19, zero secrets, `APP_ENV` placeholder only, Geist vendored under SIL OFL.
- Current stage: 7. Staged production — deployed via `actions/deploy-pages` on `main` pushes (build 1.7s at foundation, verified via `deploy.yml`), now in iterative polish / learning-loop improvements (plans 011+ in `plans/`, current polishing tracks in `docs/exec-plans/active/` if present).

## Evidence ledger
| Claim or assumption | Status | Evidence | Next test / decision |
|---|---|---|---|
| Static site builds and deploys on Pages | confirmed | `astro.config.mjs` `site: https://imdanialrashidi.github.io`, `output: static`, `public/.nojekyll`; `scripts/generate-og.mjs && astro build` → `dist/` (HTML + hashed `_astro/*.webp` + fonts + `sitemap-*.xml` + `og-default.png`); `.github/workflows/deploy.yml` live, gated on `npm run check` | Keep `npm run ci` passing on every PR |
| Content stays honest, no invented proof | confirmed | `src/content.config.ts` zod schema + `hasVisual` default false, `tests/projects.test.mjs` frontmatter/`javascript:` checks, `src/assets/work/SOURCES.md` provenance, 6 `src/content/projects/*.md` with explicit Limitations/Sources | Enforce via `tests/projects.test.mjs` structural test on each content change |
| Six projects correctly grouped and routed | confirmed | `src/lib/projects.ts` (`isDraft`, `getFeaturedProjects`, `getClientProjects`, `cardPropsFor`), `src/pages/work/index.astro`, individual `src/pages/work/*.astro` | Add content, re-run `npm run check` + `node --test tests/projects.test.mjs` |
| Editorial design + tokens hold contrast/AA | confirmed | `src/styles/tokens.css`, `docs/DESIGN.md` color table (AA contrasts), reduced-motion reset, sticky header + dialog `aria-modal` | Browser QA at 320/375/1280 + Lighthouse preview before visual change ships |
| Honest “no analytics, no form” stance is better than fake metrics | assumed | `docs/DESIGN.md` + `src/pages/contact.astro` copy (“No form · No tracker · Direct”), no analytics dep in `package.json` | Test via inbound email intent vs. prior scattered links when analytics added (deferred) |
| RUM/field performance meets `good` thresholds | unmeasured | No RUM shipped; lab budgets only (`npm run build` + preview + Lighthouse manual) | Decide provider/budget when traffic justifies (see Open product decisions) |

## Stage gates
### 0. Discovery proof
- Scope: Target user (hiring manager/recruiter/peer), painful job (15-second orientation), current alternative (scattered socials), riskiest assumption (honest > polished metrics).
- Exit evidence: `docs/PRODUCT.md` users/problem/MVP outcome filled with confirmed facts (done 2026-08-27). ✅ complete
- Next smallest experiment: Ship 2 featured + 4 client profiles with mailto CTA and measure funnel.

### 1. Experience direction
- Scope: Critical journey (hero → work → contact), IA (Home, Work, About, Now, Contact, 404), brand character (Calm & precise), visual thesis (Editorial × Engineering, monochrome + electric blue).
- Exit evidence: Accepted `docs/DESIGN.md` with visual thesis, tokens, geometry, components, screen acceptance. ✅ complete
- Decision owner: Danial Rashidi (author).

### 2. Walking skeleton
- Scope: One deployable end-to-end path through real boundaries with observability — typecheck + build + Pages deploy.
- Exit evidence: Canonical `bash scripts/ci-install.sh` → `npm run check` → `npm run build` → `dist/` works; Pages artifact deploy via `actions/deploy-pages` verified. ✅ complete
- Verification: `npm run ci` (check && build) locally; `deploy.yml` on `main`.

### 3. Vertical MVP
- Scope: Smallest useful end-to-end behavior that tests riskiest assumption — portfolio index + contact with real data.
- Exit evidence: `src/pages/index.astro` hero with 3 curated projects, `src/pages/work/index.astro` full index, `src/pages/contact.astro` mailto + outbound links, `src/pages/about.astro`/`now.astro`/`404.astro` functional with real data/state, negative paths (404 recovery, empty honest placeholders). ✅ complete
- Non-goals: Analytics, CMS, backend form (deferred).

### 4. Internal alpha
- Scope: Team use (single author) with realistic data and controlled failure testing.
- Exit evidence: No release-blocking correctness/security/accessibility issues; support/recovery via `git revert` + redeploy exercised logically; `tests/projects.test.mjs` + `npm run check` enforce invariants. ✅ complete
- Feedback sample / owner: Author self-review + harness tests (89 tests at template baseline).

### 5. External beta
- Scope: Bounded cohort (public GitHub Pages visitors), reversible static rollout, support via email.
- Exit evidence: Activation (work/contact clicks) observable via future analytics; guardrails `npm run check && npm run build` + `npm run format:check` on PR (`quality.yml`). Field performance unmeasured (RUM deferred). Status: shipped, guardrails active, RUM pending.
- Rollback trigger: Build or Pages deploy failure → `git revert` on `main` and redeploy previous green commit; `dist/` ephemeral.

### 6. Release candidate
- Scope: Frozen release boundary — compatibility, data, security, visual, performance hardening (plans 001–019 + polish tracks).
- Exit evidence: `/ship` equivalent is `bash scripts/verify.sh` (harness doctor + `npm run ci` + format:check + tests) passing; no unresolved BLOCKER/MAJOR per `docs/QUALITY.md`. ✅ enforced via `quality.yml` on PR and `main`.
- Sign-off owners: Danial Rashidi.

### 7. Staged production
- Scope: Progressive exposure with telemetry and stop conditions — Pages `main` deploy on push, `actions/deploy-pages` with concurrency `group: pages` and 10m timeout.
- Exit evidence: Health window passes at each stage (deploy job green, Pages URL live). Incident/support ownership is active via email; previous `main` remains deployable.
- Stages and stop conditions: Single stage (static). Stop on `npm run check` or `npm run build` failure in `deploy.yml`; in `quality.yml` stop on `format:check` or `verify.sh` failure. Manual rollback via revert.

### 8. Learning loop
- Scope: Product outcomes, failures, support signals, agent/harness evals.
- Exit evidence: Validated learning updates `docs/PRODUCT.md`, roadmap priorities, regression tests (`tests/projects.test.mjs`), or `evals/cases.json` / `docs/EVALUATION.md`. Review cadence: per shipped slice / at each polish plan completion.

## Critical path and risks
| Risk / dependency | Control or experiment | Owner | Decision date / trigger |
|---|---|---|---|
| Dependabot-invented metrics would break trust | Keep `hasVisual` defaults false, enforce `tests/projects.test.mjs` frontmatter safety + `src/assets/work/SOURCES.md` provenance, CI blocks invented visuals | Author | Ongoing — block on PR |
| GitHub Pages outage or deploy misconfig (`.nojekyll`, `site.url`) | `deploy.yml` pinned actions, `site: https://imdanialrashidi.github.io` + `trailingSlash: never`, `.nojekyll` in `public/` and repo root, `dist/` artifact verified | Author | On any domain/CNAME change |
| Font licensing or vendored font drift | Geist/Geist Mono vendored to `public/fonts` (69K+70K), `font-display: swap`, single preload Sans, removed 7.9M npm dep | Author | If subsetting or weight needed |
| Performance regression (inlined CSS, image variants, JS budget) | Budgets in `docs/DESIGN.md` Quality budgets + `docs/QUALITY.md`; `build.inlineStylesheets: "always"` and `lightningcss`; `astro:assets` widths `[320,480,640]`; keep JS ~2K inline | Author | Before any heavy asset or motion addition |
| Content schema drift breaks build | `astro check` strict + `tests/projects.test.mjs` structural test; CI gates on `npm run check` before build | Author | On `src/content.config.ts` change |

## Next bounded slice
- Goal: Keep credibility hub current and measurable without adding backend/cost — add optional RUM budget or writing cadence only when evidence justifies.
- Acceptance proof: Any new content passes `npm run check && node --test tests/projects.test.mjs && npm run build` and `npm run format:check`; visual changes include desktop/mobile (1280/375) + reduced-motion + contrast proof per `docs/DESIGN.md` Screen acceptance; no invented proof.
- Recovery / rollback: `git revert` on `main` + Pages redeploy; previous commit remains deployable; `dist/` rebuilt deterministically.

## Deferred decisions
- RUM/analytics provider and script budget (Plausible/Umami candidates) — keep “No tracker” promise until deliberate decision.
- Full long-form case-study body for Fast English / Noveno once verifiable assets exist.
- Notes/blog (`/writing`) and associated collection/CMS choice.
- Custom domain (CNAME) and canonical migration.
- Subsetting vendored Geist fonts if character budget tightens.

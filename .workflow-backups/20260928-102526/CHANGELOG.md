# Changelog

All notable workflow changes are documented here. This project follows the spirit of Keep a Changelog; versioning begins when the first release is tagged.

## Unreleased

### Added

- Behavioral coverage for autonomous/strict guard modes and launcher trust overrides.
- Product design contract, distinctive frontend-design skill, visual hard gates, and scored craft rubric.
- Idea-to-production prompts: discover, design, spec, ADR, build UI, design review, release plan, and incident response.
- Evidence-gated product roadmap template.
- Safety-guard behavior tests and a contained Docker launcher.
- Security reporting and dependency-review policy.
- `test-design` and `/test` workflows with red/pre-fix defect-sensitivity guidance.
- Deterministic affected-file verification routing with a conservative full-gate fallback.
- Workflow eval schema v2 with executable assertions, trace metrics, baseline comparison, and a real code/test repair fixture.
- Primary-source research and audit record in `docs/RESEARCH.md`.
- Owner-controlled Git/GitHub policy with guard, launcher, prompt, and deterministic-eval enforcement.
- Materialized-file filtering and a Git-independent pre-fix fixture for disposable workflow evaluations.

### Changed

- Made `./p` trust the checked-out project and grant full-workspace implementation access by default, while independently denying all Git/GitHub mutation until the owner authorizes an exact action; the optional Docker launcher selects strict repository scope.
- Strengthened the safety guard around secrets, destructive host actions, Git metadata/commands, publication/deployment/production mutation, and browser file exfiltration while preserving read-only Git inspection.
- Replaced archived `pi-context7` with maintained `pi-doc-search`.
- Removed delegated image-analysis extensions, model configuration, tools, and workflow guidance; browser QA now relies on browser-native evidence and saved screenshots as artifacts.
- Removed the template's forced model/provider/thinking selection and unmeasured compaction/retry/timeout overrides so the operator's active Pi model and official defaults apply.
- Pinned Pi installation guidance and GitHub Actions by immutable revision.
- Raised browser QA, accessibility, responsive, and Core Web Vitals requirements for visual work.
- Made the canonical full verification gate validate the template before product source is bootstrapped.
- Reduced duplicate always-loaded policy by 30.5%, removed the duplicate `docs/PI_WORKFLOW.md`, and tightened the combined context-size ratchet.
- Reduced the launcher from 22 to 19 active tool schemas and made subagents conditional with a universal self-review fallback.
- Reduced routine eval default trials from three to one while retaining explicit repeated trials and stronger efficiency thresholds for promotion comparisons.
- Updated reviewed pins to Pi `0.84.2`, `pi-mcp-adapter@2.26.1`, `@juicesharp/rpiv-todo@2.6.2`, and `@bytetrue/pi-web-search@0.2.1` with exact registry integrity records.

### Added — product site (slice 1–4, plans 001–010, commit dbda97e)

- Astro 7.2.4 + TypeScript 5.9 (strict) static site — 8 routes (/, /work, /work/fast-english, /work/noveno, /about, /now, /contact, 404) with `src/layouts/Layout.astro` (canonical, OG/Twitter, JSON-LD Person, FOUC script) and `src/data/site.ts` as single source for site/social/nav.
- Content layer — `src/content.config.ts` collections (`projects` via `astro/loaders` + zod, `profile`/`now` stubs) with `src/content/projects/{fast-english,noveno}.md`; typed frontmatter for card + case-study contracts.
- Design system — semantic tokens `src/styles/tokens.css` + `global.css`, Geist/Geist Mono variable woff2 vendored to `public/fonts` (69K+70K, preload Sans), editorial × engineering aesthetic per `docs/DESIGN.md` (light-first + polished dark, `backdrop-filter` header, `clamp()` rhythm).
- Components/pages — `Header` (sticky + mobile `role=dialog` with focus trap), `Footer`, `ThemeToggle` (localStorage + prefers-color-scheme), `ProjectFeature`/`ProjectMedia`, `case-study/*` blocks; portrait via `astro:assets <Image>` on Home + About.
- Social preview — `public/og-default.png` (1200×630) via `scripts/generate-og.mjs` + OG/Twitter meta in Layout (plan 005).

### Added — deployment & CI (plans 001–002, 007, 014)

- `bash scripts/ci-install.sh` + `npm ci` install lane (plan 001).
- `.github/workflows/deploy.yml` — `actions/deploy-pages` to GitHub Pages (`contents: read, pages: write, id-token: write`, `node 22.23.2`) with typecheck gate `npm run check` before build (plan 014).
- `.github/workflows/quality.yml` product verification (`bash scripts/verify.sh` + `verify-package-integrity --online`) with lint/format gate (plan 018).

### Changed

- `.gitignore` + `README.md` repo hygiene, `AGENTS.md`/`docs/` map, `docs/TOOLING_SETUP.md` Pi pin source (plan 003).
- `src/content.config.ts` `links.caseStudy` hardened to block `javascript:` and enforce `/(https?)` (plan 012); `src/lib/projects.ts` single source for card mapping, draft filtering, and first `node:test` coverage (`tests/projects.test.mjs`).
- `src/pages/about.astro` LCP image `fetchpriority="high"`, `src/pages/index.astro` below-fold portrait `loading="lazy"`, `astro.config.mjs` `inlineStylesheets: "always"` for first-paint (plan 013).
- `scripts/generate-og.mjs` anchored to `import.meta.dirname` with repo-root guard and wired into `npm run build` (plan 015).
- `src/components/Footer.astro` explicit year, `ProjectMedia`/`CaseFigure` placeholders `aria-hidden="true"`, `ThemeToggle` `is:inline` pressed state, `.pi/models.env` guard comment (plan 019).
- `CONTRIBUTING.md` Pi pin pointer fixed to `docs/TOOLING_SETUP.md` (plan 016); `docs/DESIGN.md` budgets corrected (portrait rendered, CSS inlined), `docs/ARCHITECTURE.md` topology updated to shipped `deploy-pages` (plan 016).
- `biome.json` + `.editorconfig` lint/format baseline, `.github/workflows/quality.yml` `Lint and format check` (plan 018); `.pi/package-integrity.json` extended to 14 entries (8 harness + 5 product + Biome) with `verify-package-integrity` allowing product prefixes (plan 017).

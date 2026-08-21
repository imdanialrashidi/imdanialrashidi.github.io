# imdanialrashidi.github.io

Personal credibility site for Danial Rashidi — Software & Product Builder.
Static [Astro](https://astro.build) site deployed to GitHub Pages at
<https://imdanialrashidi.github.io>.

## Requirements

- Node.js ≥ 22.19.0 (CI pins 22.23.2)

## Quick start

    npm ci          # or: bash scripts/ci-install.sh
    npm run dev     # dev server
    npm run build   # static build → dist/
    npm run preview # serve dist/ on :4321

## Verification

    npm run check           # astro check (types + content schema)
    npm run build           # must succeed
    bash scripts/verify.sh  # full gate: harness doctor + tests + check + build

This repository also carries an agent-harness layer (`.pi/`, `scripts/`,
`tests/`, `evals/`) with its own operating rules — see `AGENTS.md`,
`CONTRIBUTING.md`, and `SECURITY.md` before touching workflow files.

## Site structure

- `src/pages/` — routes: `/`, `/work`, `/work/fast-english`, `/work/noveno`,
  `/about`, `/now`, `/contact`, 404
- `src/components/` — header/footer/theme toggle, project cards,
  case-study blocks (`case-study/`)
- `src/data/site.ts` — single source for site title, description, social
  links, navigation
- `src/content/projects/*.md` — typed project collection (schema in
  `src/content.config.ts`)
- `src/styles/tokens.css` — semantic design tokens (light/dark);
  `global.css` — reset + utilities
- `public/fonts/` — self-hosted Geist / Geist Mono variable woff2

## Deployment

GitHub Pages. See `docs/exec-plans/active/premium-personal-brand.md` for the
active rollout plan and `docs/ARCHITECTURE.md` for deployment decisions.

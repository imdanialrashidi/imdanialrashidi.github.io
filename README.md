# imdanialrashidi.github.io

English personal credibility site for Danial Rashidi, Software & Product Builder: nine case
studies, three travel notes, and about, now and contact pages. Static [Astro](https://astro.build)
site deployed to GitHub Pages at <https://imdanialrashidi.github.io>. No backend, analytics or
cookies.

The Persian sibling site at <https://danialrashidi.ir> remains the Persian home.

## Requirements

- Node.js >= 22.19.0 (CI pins 22.23.2)
- A local Chrome installation only for `npm run og` (social card rendering)

## Quick start

    npm ci          # or: bash scripts/ci-install.sh
    npm run dev     # dev server
    npm run build   # static build to dist/ (16 pages)
    npm run preview # serve dist/ on :4321

## Verification

    npm test                # 18 tests: content contract and SEO metadata
    npm run check           # astro check: types and content schema
    npm run format:check    # Biome format and lint
    bash scripts/verify.sh  # canonical gate: checks above plus build and artifact check

`node scripts/check-built-site.mjs` runs against `dist/` after `npm run build` and is part of
`scripts/verify.sh`. It validates canonical and sitemap agreement, titles and descriptions,
JSON-LD, internal links, image files and the asset budgets.

## Routes and content

- 15 indexable routes plus 404: `/`, `/work/`, nine `/work/<slug>/` case studies, `/travels/`,
  `/about/`, `/now/` and `/contact/`. Every URL uses the trailing-slash form.
- `src/content/projects/*.md`: nine English case studies, three own products and six client
  builds. Fast English and Kidotalks are client work. Schema in `src/content.config.ts`.
- `src/content/travels/*.md`: three travel notes with real photographs.
- `src/data/site.ts`: site identity, social links, navigation and product links.
- `src/assets/SOURCES.md`: provenance for every screenshot, photograph and font.
- All nine projects have real captures. A future project without a public screen would render the
  typographic plate component instead of an invented interface.

## Site structure

    src/pages/       route entry points, including work/[slug].astro
    src/components/  header, footer, cards, shots, section primitives
    src/layouts/     document shell, SEO head and JSON-LD
    src/lib/         work, travels and SEO helpers
    src/styles/      tokens.css and global.css
    public/fonts/    vendored Instrument Serif, Geist and Geist Mono woff2
    public/og/       committed 1200x630 JPEG social cards
    scripts/         build, verification, generation and CI helpers
    tests/           node:test contract tests

## Generated assets

`public/og/**/*.jpg`, `public/icons/*.png` and `public/apple-touch-icon.png` are committed.
Regenerate the cards when page copy or screenshots change, and the icons when the brand mark
changes:

    npm run og      # renders social cards; needs a local Chrome
    npm run icons   # draws the app icons

`dist/` and `.astro/` are build output and are not committed.

## Agent workflow

The repository uses DeepSeek Harness with [dsh-workflow](https://github.com/imdanialrashidi/dsh-workflow)
0.2. Seven skills live in `.dsh/skills/`, pinned by commit and sha256 in `.dsh/workflow.json` and
checked by `scripts/verify-workflow.mjs`. Read `AGENTS.md` first, `docs/WORKFLOW.md` for the pin and
update procedure, `docs/QUALITY.md` for the evidence bar, and `docs/GIT_POLICY.md` before any
publication. Tiny low-risk corrections use `/quick-fix`.

## Deployment

GitHub Pages from `main` through `.github/workflows/deploy.yml`. See `docs/ARCHITECTURE.md` for the
system and `docs/exec-plans/active/english-parity-rebuild.md` for the current durable state.

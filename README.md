# Danial Rashidi Portfolio

Ultra-light multi-page portfolio built with Astro SSG, Tailwind CSS, MDX content collections, and Astro View Transitions.

## Stack

- Astro (SSG)
- Tailwind CSS
- Astro Content Collections + MDX
- Minimal JS (no client-side React hydration in v1)

## Local Run

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

## Content

- Projects: `src/content/projects/*`
- Blog: `src/content/blog/*`

## Routes

- Home: `/`
- Work: `/work`
- Blog: `/blog`
- Contact: `/contact`
- Legacy log aliases: `/log/*`

## GitHub Pages Deploy

1. Set production values (optional via env):
   - `PUBLIC_SITE_URL=https://YOUR_GH_USERNAME.github.io`
   - `PUBLIC_BASE_PATH=/YOUR_REPO`
   - Local `npm run dev` now uses `/` automatically.
2. Ensure repository default branch is `main` (or update workflow trigger).
3. Push to GitHub.
4. In repo settings, enable Pages with **GitHub Actions** as source.
5. Workflow at `.github/workflows/deploy.yml` will build and deploy automatically.

## Notes

- Theme tokens live in `src/styles/global.css`.
- Add/edit projects and blog entries with frontmatter matching `src/content/config.ts`.

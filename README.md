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

1. For your main GitHub Pages URL `https://imdanialrashidi.github.io`, repository name must be exactly:
   - `imdanialrashidi.github.io`
2. Push this code to that repository (default branch: `main`).
3. In repository settings, enable Pages with **GitHub Actions** as source.
4. Workflow at `.github/workflows/deploy.yml` will build and deploy automatically.

If you deploy from a repository named `danialrashidi`, the URL will be:
- `https://imdanialrashidi.github.io/danialrashidi`

## Notes

- Theme tokens live in `src/styles/global.css`.
- Add/edit projects and blog entries with frontmatter matching `src/content/config.ts`.

import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// Static GitHub Pages build.
// trailingSlash: "always" matches Pages directory serving exactly:
// /work/ is served from work/index.html with no redirect. Canonical URLs,
// internal links and sitemap entries all use the same form.
export default defineConfig({
  site: "https://imdanialrashidi.github.io",
  base: "/",
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !page.endsWith("/404/") && !page.endsWith("/404"),
    }),
  ],
  build: {
    // Global CSS ships as one hashed, cacheable file instead of being inlined
    // into every page.
    inlineStylesheets: "auto",
  },
  vite: {
    css: {
      transformer: "lightningcss",
    },
  },
});

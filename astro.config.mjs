import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://imdanialrashidi.github.io",
  base: "/",
  output: "static",
  integrations: [sitemap()],
  trailingSlash: "never",
  build: {
    inlineStylesheets: "auto",
  },
  vite: {
    css: {
      transformer: "lightningcss",
    },
  },
});

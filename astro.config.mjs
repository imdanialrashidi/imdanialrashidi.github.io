import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

const site = process.env.PUBLIC_SITE_URL || 'https://YOUR_GH_USERNAME.github.io';
const baseFromEnv = process.env.PUBLIC_BASE_PATH || '/YOUR_REPO';
const normalizedBase = baseFromEnv === '/' ? '/' : `/${baseFromEnv.replace(/^\/+|\/+$/g, '')}`;
const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
  site,
  base: isDev ? '/' : normalizedBase,
  integrations: [mdx(), tailwind()],
  prefetch: false,
  compressHTML: true,
  trailingSlash: 'never'
});

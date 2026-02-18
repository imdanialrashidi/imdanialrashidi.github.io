import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://imdanialrashidi.github.io',
  base: '/',
  integrations: [mdx(), tailwind()],
  prefetch: false,
  compressHTML: true,
  trailingSlash: 'never'
});

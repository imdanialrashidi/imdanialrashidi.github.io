import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const toIsoDate = (date: Date) => date.toISOString();

export const GET: APIRoute = async () => {
  const site = import.meta.env.SITE;

  if (!site) {
    return new Response('SITE is not configured', { status: 500 });
  }

  const projects = await getCollection('projects');
  const posts = await getCollection('blog');

  const staticPaths = ['/', '/work', '/blog', '/contact', '/log'];
  const staticUrls = staticPaths.map((path) => ({
    loc: new URL(path, site).toString(),
    lastmod: new Date().toISOString()
  }));

  const projectUrls = projects.map((item) => ({
    loc: new URL(`/work/${item.slug}`, site).toString(),
    lastmod: toIsoDate(item.data.date)
  }));

  const blogUrls = posts.flatMap((item) => [
    {
      loc: new URL(`/blog/${item.slug}`, site).toString(),
      lastmod: toIsoDate(item.data.date)
    },
    {
      loc: new URL(`/log/${item.slug}`, site).toString(),
      lastmod: toIsoDate(item.data.date)
    }
  ]);

  const urls = [...staticUrls, ...projectUrls, ...blogUrls];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((item) => `  <url>\n    <loc>${item.loc}</loc>\n    <lastmod>${item.lastmod}</lastmod>\n  </url>`)
    .join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};

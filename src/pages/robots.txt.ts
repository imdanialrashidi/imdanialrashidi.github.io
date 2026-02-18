import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const site = import.meta.env.SITE;
  const sitemap = site ? new URL('sitemap.xml', site).toString() : '';

  const body = `User-agent: *\nAllow: /\n${sitemap ? `Sitemap: ${sitemap}` : ''}\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};

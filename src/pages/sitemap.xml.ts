import { getCollection } from 'astro:content';
import { categoryNavigation } from '@config/navigation';
import { siteConfig } from '@config/site';
import { getAllProducts, productCategories } from '@data/products';
import { brandProfiles } from '@data/support';

export const prerender = true;

interface SitemapEntry {
  path: string;
  changefreq: 'daily' | 'weekly' | 'monthly';
  priority: number;
}

const escapeXml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export async function GET() {
  const origin = (siteConfig.siteUrl || 'https://shop.mobdeals.co.ke').replace(/\/$/, '');
  const guides = (await getCollection('guides')).filter((guide) => !guide.data.draft);
  const categoryFilters = categoryNavigation.flatMap((category) =>
    (category.links ?? [])
      .filter((link) => link.href.split('/').filter(Boolean).length > 2)
      .map((link) => link.href)
  );

  const entries: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: 1 },
    { path: '/shop', changefreq: 'daily', priority: 0.9 },
    { path: '/brands', changefreq: 'weekly', priority: 0.7 },
    { path: '/business', changefreq: 'monthly', priority: 0.7 },
    { path: '/contact', changefreq: 'monthly', priority: 0.6 },
    { path: '/delivery', changefreq: 'monthly', priority: 0.5 },
    { path: '/store', changefreq: 'monthly', priority: 0.6 },
    { path: '/warranty', changefreq: 'monthly', priority: 0.5 },
    { path: '/blog', changefreq: 'weekly', priority: 0.6 },
    ...productCategories.map((category): SitemapEntry => ({
      path: `/category/${category.slug}`,
      changefreq: 'daily',
      priority: 0.8
    })),
    ...categoryFilters.map((path): SitemapEntry => ({ path, changefreq: 'daily', priority: 0.65 })),
    ...brandProfiles.map((brand): SitemapEntry => ({
      path: `/brands/${brand.slug}`,
      changefreq: 'weekly',
      priority: 0.65
    })),
    ...getAllProducts().map((product): SitemapEntry => ({
      path: `/products/${product.slug}`,
      changefreq: 'daily',
      priority: 0.8
    })),
    ...guides.map((guide): SitemapEntry => ({
      path: `/blog/${guide.id}`,
      changefreq: 'monthly',
      priority: 0.55
    }))
  ];

  const uniqueEntries = Array.from(new Map(entries.map((entry) => [entry.path, entry])).values());
  const urls = uniqueEntries.map((entry) => {
    const location = new URL(entry.path, `${origin}/`).toString();
    return `  <url>\n    <loc>${escapeXml(location)}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(2)}</priority>\n  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

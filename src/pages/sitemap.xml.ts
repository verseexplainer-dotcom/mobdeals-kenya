import { getCollection } from 'astro:content';
import { categoryNavigation } from '@config/navigation';
import { siteConfig } from '@config/site';
import { getAllProducts, getProductsByCategory, productCategories } from '@data/products';
import { productMatchesCatalogFilter } from '@lib/products';
import { brandProfiles } from '@data/support';

export const prerender = true;

const escapeXml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export async function GET() {
  const origin = (siteConfig.siteUrl || 'https://shop.mobdeals.co.ke').replace(/\/$/, '');
  const guides = (await getCollection('guides')).filter((guide) => !guide.data.draft);
  const categoryFilters = categoryNavigation.flatMap((category) => {
    const parentSlug = category.href.split('/').filter(Boolean).at(-1);

    if (!parentSlug) {
      return [];
    }

    const categoryProducts = getProductsByCategory(parentSlug);

    return (category.links ?? [])
      .filter((link) => link.href.split('/').filter(Boolean).length > 2)
      .filter((link) => {
        const filter = link.href.split('/').filter(Boolean).at(-1);
        return Boolean(filter && categoryProducts.some((product) => productMatchesCatalogFilter(product, filter)));
      })
      .map((link) => link.href);
  });

  const entries = [
    '/',
    '/shop',
    '/brands',
    '/business',
    '/contact',
    '/delivery',
    '/store',
    '/warranty',
    '/blog',
    ...productCategories.map((category) => `/category/${category.slug}`),
    ...categoryFilters,
    ...brandProfiles.map((brand) => `/brands/${brand.slug}`),
    ...getAllProducts().map((product) => `/products/${product.slug}`),
    ...guides.map((guide) => `/blog/${guide.id}`)
  ];

  const uniqueEntries = Array.from(new Set(entries));
  const urls = uniqueEntries.map((path) => {
    const location = new URL(path, `${origin}/`).toString();
    return `  <url>\n    <loc>${escapeXml(location)}</loc>\n  </url>`;
  });

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

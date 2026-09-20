import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';

async function files(root) {
  const entries = await readdir(root, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => entry.isDirectory()
    ? files(`${root}/${entry.name}`) : [`${root}/${entry.name}`]))).flat();
}
for (const [root, origin] of [['dist', 'https://shop.mobdeals.co.ke'], ['dist-marketing', 'https://mobdeals.co.ke']]) {
  const paths = await files(root);
  const htmlPaths = paths.filter((path) => path.endsWith('.html'));
  for (const path of htmlPaths) {
    const html = await readFile(path, 'utf8');
    if (!path.endsWith('/404.html') && !path.endsWith('/404/index.html')) {
      const canonical = html.match(/<link rel="canonical" href="([^"]+)"/);
      assert(canonical, `Missing canonical: ${path}`);
      assert.equal(new URL(canonical[1]).origin, origin, `Wrong canonical: ${path}`);
    }
    for (const match of html.matchAll(/(?:src|poster)="(\/images\/[^"?]+)"/g)) {
      assert(paths.includes(`${root}${match[1]}`), `Missing local image ${match[1]} in ${path}`);
    }
    for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)) {
      const schema = JSON.parse(match[1]);
      if (schema['@type'] === 'Product') {
        assert.equal(new URL(schema.offers.url).origin, 'https://shop.mobdeals.co.ke');
        assert(!schema.image?.some((src) => src.includes('/images/home/category-')), 'Representative image must not be presented as exact in Product schema');
      }
    }
  }
  for (const path of paths.filter((path) => /\.(html|js|json)$/.test(path))) {
    const text = await readFile(path, 'utf8');
    assert(!text.includes('SUPABASE_SERVICE_ROLE_KEY'), `Privileged credential reference in ${path}`);
    assert(!text.includes('sb_secret_'), `Secret key in ${path}`);
    for (const token of text.matchAll(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g)) {
      const payload = JSON.parse(Buffer.from(token[0].split('.')[1], 'base64url').toString());
      assert.notEqual(payload.role, 'service_role', `Privileged JWT in ${path}`);
    }
  }
  const sitemap = await readFile(`${root}/sitemap.xml`, 'utf8');
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert(urls.length > 0);
  assert(urls.every((url) => new URL(url).origin === origin), `Mixed sitemap domains in ${root}`);
  assert((await readFile(`${root}/robots.txt`, 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
  if (root === 'dist-marketing') {
    assert.equal(urls.length, 1, 'Marketing sitemap must contain only the homepage');
    assert.equal(htmlPaths.length, 2, 'Marketing build must contain only homepage and 404');
    const html = await readFile(`${root}/index.html`, 'utf8');
    assert(html.includes('href="https://shop.mobdeals.co.ke"'));
    assert(html.includes('href="https://shop.mobdeals.co.ke/products/'));
    assert((await readFile(`${root}/_redirects`, 'utf8')).includes('https://www.mobdeals.co.ke/* https://mobdeals.co.ke/:splat 301'));
  }
  console.log(`${root}: ${htmlPaths.length} pages verified; canonical, sitemap, local media and credential checks passed.`);
}

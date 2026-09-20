# Marketing and storefront builds

The shop remains a static Astro site on Cloudflare Pages. The separate marketing
project shares brand details, homepage media and four product selections at build
time. It does not publish catalogue routes or send the full catalogue to the browser.

| Site | Source | Build | Output | Pages project |
| --- | --- | --- | --- | --- |
| `shop.mobdeals.co.ke` | `src/` | `npm run build` | `dist` | `mobdeals-kenya` |
| `mobdeals.co.ke` | `marketing/src/` | `npm run build:marketing` | `dist-marketing` | `mobdeals-marketing` |

Both use production branch `main`. The marketing build uses
`astro.marketing.config.mjs`, its own Astro root/types and routing files. Run
`npm run dev:marketing` for port 4322. `scripts/prepare-marketing.mjs` copies shared
brand/home assets into ignored `.marketing/public` before development/build.

## Verification

```sh
npm run check
npm run check:marketing
npm run lint
npm run build
npm run build:marketing
npm run verify:sites
```

The output audit checks canonical origins, Product schema URLs, local image
existence, sitemap domains, marketing route count and privileged credential leaks.

## Media

Exact product images remain in Supabase `product-images`. Regenerate the product
module with `python3 scripts/import_mobdeals_products.py`; do not hand-edit it.
The importer excludes explicitly approximate model matches from exact imagery.
Run `python3 scripts/sync_supabase_products.py --workers 2` to verify storage.
The September 20 check resolved all 184 referenced objects; no upload was needed.

The shared ProductImage component uses labelled representative category imagery
for absent or broken photos. If the fallback itself fails, it shows a text message.
Representative images never enter Product JSON-LD as exact product images.

Home assets live in `public/images/home/`. Until Higgsfield generation is available,
the category assets are derived from the approved local product reference drop;
the hero uses the existing homepage media. `provenance.json` records their sources.
No newly generated Higgsfield asset or film has been accepted yet: the image
request returned `job_minimum_basic_plan_required` on the selected free workspace.

Import reviewed Higgsfield outputs with:

```sh
node scripts/import-home-media.mjs hero student SOURCE
node scripts/import-home-media.mjs hero office SOURCE
node scripts/import-home-media.mjs hero workstation SOURCE
node scripts/import-home-media.mjs category laptops SOURCE
```

Category names: `laptops`, `tablets`, `monitors`, `printers`, `projectors`, `software`,
`ups`. The importer writes optimized desktop/mobile hero crops or 400/800 pixel
category variants and updates provenance. Review every crop before release.
Promotional imagery is representative; it must not contain generated text, prices,
logos or watermarks. Exact model assets require approved matching references.

The marketing film component accepts one continuous local MP4 at
`/images/home/mobdeals-scroll.mp4`, registered as `film-mobdeals-scroll` in provenance.
Without that registration, the poster alone is rendered. With a film, scroll
position controls time. Reduced-motion and data-saving preferences suppress video
loading; a pause control and video-error fallback retain the poster. Actual film
decoding and scrubbing must be checked once a generated film is available.

## Domain connection and deployment

The existing storefront Pages project already has `shop.mobdeals.co.ke` attached.
The marketing Pages project is separate. Connect `mobdeals.co.ke` and
`www.mobdeals.co.ke` through that project's Custom domains settings after reviewing
the preview and completing the assets. Inspect existing apex DNS before switching
it. Keep mail records and unrelated records intact.

Marketing `_redirects` sends `www` to the apex and legacy product/category routes
to the shop. The apex sitemap contains one URL. All product canonical tags, Product
schema and shop sitemap entries use the shop origin even if an old
`PUBLIC_SITE_URL` environment value is present.

For Cloudflare's current CLI, use `--force` on Pages commands if Wrangler attempts
to delegate to Workers. This selects the existing Pages architecture; it is not a
request to migrate to Workers. Preview deploys should use a branch such as
`visual-refresh`. Production commands:

```sh
npm run cf:deploy
npm run cf:deploy:marketing
```

Only the public Supabase URL and anon key belong in frontend build variables. The
marketing build needs the public URL to resolve its selected product images; it
does not need a service-role key. Privileged uploads use the existing local script.

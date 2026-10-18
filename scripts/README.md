# Scripts

Project automation scripts belong here. Keep scripts repeatable and safe for local development.

## Cloudflare Pages build variables

Check the public build variables for both existing Pages projects:

```sh
python3 scripts/configure_cloudflare_pages.py
```

Apply reviewed differences, then rebuild the affected deployments:

```sh
python3 scripts/configure_cloudflare_pages.py --apply
```

The script reads local `.env` files or shell variables. It only publishes the
public site origin, Supabase URL/anon key, and GA4/Clarity settings; it never
publishes the Cloudflare token or Supabase service-role key. Production uses the
configured analytics IDs. Preview GA4 and Clarity IDs are explicitly empty to
keep test traffic out of production reports. Existing unrelated public variables
are preserved. Use `--project mobdeals-marketing` or `--project mobdeals-kenya`
to limit the operation. The script verifies each update and does not deploy.
It requires `CLOUDFLARE_ACCOUNT_ID`, a `CLOUDFLARE_API_TOKEN` with Pages Write
access, `PUBLIC_SUPABASE_URL`, and `PUBLIC_SUPABASE_ANON_KEY`. Keep the Cloudflare
credentials local; the `PUBLIC_` variables are the only new build settings sent.

## Product Catalog Import

The current catalog source is `product drop/products_for_supabase.csv`. Product images live in the categorized folders beside that CSV. The entire `product drop/` directory remains ignored because it is a local import package rather than a deployment artifact.

Generate the storefront catalog, mapping report, and Supabase upload manifest:

```sh
python3 scripts/import_mobdeals_products.py
```

The importer:

- Validates all 241 product rows, prices, SKUs, descriptions, and product schema JSON.
- Groups numbered WebP files as gallery images.
- Preserves source category folders in Storage keys such as `laptop/hp-victus-15-fa2787nr-laptop/01.webp`.
- Uses the mapped image folder as the storefront category when the supplied sheet category is inconsistent.
- Generates `src/data/products.ts` as the project catalog used by Astro.
- Adds reviewed second images from `scripts/additional-product-images.json` to the generated catalog, mapping, and upload manifest.
- Writes review artifacts under `output/logs/`, including the exact source-to-product image mapping.

Optional flags:

- `--expected-count`: require an exact product-row count. Defaults to `241`.
- `--images`: override the categorized image root. Defaults to `product drop/`.
- `--output`: override the generated TypeScript module path. Defaults to `src/data/products.ts`.
- `--mapping`, `--manifest`, and `--report`: override generated review artifact paths.

The importer refuses missing or unsafe product data and low-confidence image matches. Explicit approximate mappings remain visible in `output/logs/product-drop-import-report.json`.

## Flat Product Batch Import

For a flat image folder with a `products_for_supabase.csv` and `_rename_mapping.csv`, merge the batch with the current store catalog:

```sh
python3 scripts/import_product_batch.py
```

This prepares the merged storefront catalog, a deduplicated CSV, the image mapping, and an upload manifest under `output/logs/`. It matches images by the source IDs in the sheet, collapses exact duplicate batch rows, and retains existing Supabase images after the new primary image for matched products. Review the generated `product-batch-import-report.json` before applying.

Upload the mapped images, upsert categories/products/galleries to Supabase, and deactivate replaced duplicate listings:

```sh
python3 scripts/import_product_batch.py --apply
```

The command reads `PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from the environment or local `.env` files. It never writes privileged credentials into frontend code.

## Supabase Media Sync

Check whether every image used by the generated catalog exists in the public `product-images` bucket:

```sh
python3 scripts/sync_supabase_products.py
```

Upload missing images and rerun the all-or-nothing storage gate:

```sh
SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/sync_supabase_products.py --upload
```

The service role key is required only for uploads and must never be committed or exposed to Astro client code. The sync does not delete old bucket objects; unused previous images can be pruned separately after the replacement catalog is verified in production.

## Supabase Catalog Sync

After applying `supabase/migrations/`, validate and upsert the reviewed sheet rows and image mapping:

```sh
python3 scripts/sync_supabase_catalog.py
python3 scripts/sync_supabase_catalog.py --apply
```

The sync is idempotent on category slug, product slug, and product image position. It writes the
matched primary image to `products.image_url` and ordered galleries to `product_images`.

## Image-Only Template

Generate a review CSV containing every image group in the drop, including groups that have no row in the supplied product sheet:

```sh
python3 scripts/generate_product_catalog_template.py
```

This writes `output/spreadsheet/new_product_catalog_template.csv` and is useful for identifying unused images or preparing future catalog rows.

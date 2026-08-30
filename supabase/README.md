# Supabase

MobDeals Kenya uses Supabase Storage for public product media. Do not commit service role keys or other secrets.

## Product Media

The public bucket is `product-images`, matching `siteConfig.storageBucket`.

The current source package is:

- Product data: `product drop/products_for_supabase.csv`
- Product media: categorized WebP folders under `product drop/`
- Generated storefront catalog: `src/data/products.ts`

Numbered source files are gallery images for the same base product. Generated object keys preserve the source category folder and use this structure:

```text
{source-category}/{image-group-slug}/01.webp
{source-category}/{image-group-slug}/02.webp
{source-category}/{image-group-slug}/03.webp
```

Examples:

- `laptop/hp-victus-15-fa2787nr-laptop/01.webp`
- `printer/epson-l3250-printer/01.webp`
- `tablet/lenovo-x1-tab-core-m5-tablet/01.webp`

Run the catalog importer before syncing media:

```sh
python3 scripts/import_mobdeals_products.py
python3 scripts/sync_supabase_products.py
```

To upload missing objects, provide `SUPABASE_SERVICE_ROLE_KEY` only in the server-side shell:

```sh
SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/sync_supabase_products.py --upload
```

The media sync performs an all-or-nothing existence gate for every image referenced by the generated catalog. It never deletes old Storage objects automatically.

Frontend environment variables:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Use public buckets only for shopper-visible media. Never place private documents, supplier records, customer data, or operational secrets in this bucket.

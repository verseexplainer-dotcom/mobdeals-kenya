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

## Catalog Database

The versioned database schema lives in `supabase/migrations/`. It provides:

- `product_categories` for shopper-facing catalog navigation;
- `products` for the complete reviewed sheet data and primary image URL;
- `product_images` for ordered product galleries;
- public read-only RLS policies for active, available products;
- service-role-only writes through the server-side sync script.

Link the correct hosted project and apply pending migrations:

```sh
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Validate the catalog payload without writing it, then perform the idempotent upsert:

```sh
python3 scripts/sync_supabase_catalog.py
python3 scripts/sync_supabase_catalog.py --apply
```

The database sync uses the reviewed `product-drop-image-mapping.csv` output, stores the primary
public URL in `products.image_url`, and stores every ordered gallery URL in `product_images`.
It never puts the service role key into browser code or Cloudflare Pages.

To upload missing objects, provide `SUPABASE_SERVICE_ROLE_KEY` only in the server-side shell:

```sh
SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/sync_supabase_products.py --upload
```

The media sync performs an all-or-nothing existence gate for every image referenced by the generated catalog. It never deletes old Storage objects automatically.

Frontend environment variables:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Use public buckets only for shopper-visible media. Never place private documents, supplier records, customer data, or operational secrets in this bucket.

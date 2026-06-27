# Supabase

Supabase project notes, storage bucket conventions, and local metadata belong here. MobDeals Kenya uses Supabase free tier for product media and lightweight browser-readable data.

Do not commit service role keys or secrets.

## Product Media Workflow

Product media uses a public Supabase Storage bucket named `products`, matching `siteConfig.storageBucket`.

Use public buckets only for assets intended to be visible to shoppers. Do not place private documents, supplier records, customer data, or operational secrets in public buckets.

Recommended object paths:

- `{category}/{product-slug}/main.webp`
- `{category}/{product-slug}/gallery-01.webp`
- `{category}/{product-slug}/gallery-02.webp`

Examples:

- `laptops/hp-elitebook-840-g7-core-i5/main.webp`
- `smartphones/iphone-13-128gb-refurbished/gallery-01.webp`

Frontend environment variables:

- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

Use `createSupabasePublicAssetUrl` from `src/lib/supabase` when building public media URLs from a bucket path. Product seed data may also store complete public image URLs directly.

Service role keys must remain server-only and must not be exposed to Astro client code.

# Supabase

Supabase project notes, storage bucket conventions, and local metadata belong here.

Do not commit service role keys or secrets.

## Product Media Workflow

Product media uses a public Supabase Storage bucket named `products`, matching `siteConfig.storageBucket`.

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

begin;

-- The original empty products table only accepted a flat legacy filename.
-- Catalog media now uses normalized bucket paths such as
-- `laptop/product-slug/01.webp`.
alter table public.products
  drop constraint if exists products_image_key_check,
  drop constraint if exists products_image_url_check;

alter table public.products
  add constraint products_image_key_check
    check (
      image_key ~ '^[a-z0-9][a-z0-9._/-]*$'
      and image_key !~ '(^|/)\.\.(/|$)'
    ),
  add constraint products_image_url_check
    check (
      image_url ~ '^https://[^/]+\.supabase\.co/storage/v1/object/public/product-images/[a-z0-9][a-z0-9._/%-]*$'
    );

commit;

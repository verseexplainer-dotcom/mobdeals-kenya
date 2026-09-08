begin;

-- Multiple priced/specification variants can legitimately share the same
-- photographed model. Gallery uniqueness is enforced per product instead.
alter table public.products
  drop constraint if exists products_image_key_key,
  drop constraint if exists products_image_url_key;

create index if not exists products_image_key_idx on public.products (image_key);

commit;

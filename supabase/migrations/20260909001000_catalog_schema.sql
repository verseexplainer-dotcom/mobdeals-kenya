begin;

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.product_categories (
  slug text primary key,
  label text not null,
  eyebrow text,
  description text not null,
  seo_title text not null,
  seo_description text not null,
  sort_order smallint not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.product_categories (
  slug,
  label,
  eyebrow,
  description,
  seo_title,
  seo_description,
  sort_order
)
values
  ('laptops', 'Laptops', 'Work, study, and creator machines', 'Current HP, Dell, Lenovo, Microsoft, and Apple laptops with sheet-backed prices, specifications, condition, and warranty details.', 'Laptops in Nairobi', 'Shop current MobDeals laptops in Nairobi with visible prices, specifications, condition, warranty, and delivery support across Kenya.', 10),
  ('tablets', 'Tablets', 'Portable touch devices', 'Portable tablets and detachable devices for mobile work, study, browsing, and communication.', 'Tablets in Nairobi', 'Browse MobDeals tablets in Nairobi with current prices, specifications, warranty details, and Kenya delivery support.', 20),
  ('monitors', 'Monitors', 'Display upgrades', 'Current monitor options for office desks, home workstations, and display replacement needs.', 'Computer Monitors in Nairobi', 'Browse MobDeals computer monitors in Nairobi with current prices and delivery support across Kenya.', 30),
  ('printers', 'Printers', 'Office and home printing', 'Current Epson, HP, and Kyocera printers for home, school, office, and production workflows.', 'Printers in Nairobi', 'Shop current MobDeals printers in Nairobi with prices, specifications, warranty details, and Kenya delivery support.', 40),
  ('projectors', 'Projectors', 'Presentation displays', 'Projectors for classrooms, offices, events, and presentation setups with source-sheet specifications.', 'Projectors in Nairobi', 'Shop MobDeals projectors in Nairobi with current prices, verified specifications, and delivery support across Kenya.', 50),
  ('software', 'Software', 'Security and productivity', 'Current software licences and security products with device coverage and warranty details.', 'Software Licences in Nairobi', 'Shop software licences from MobDeals in Nairobi with current prices and support across Kenya.', 60),
  ('ups', 'UPS & Power', 'Backup power and connectivity', 'UPS, backup power, and related connectivity products from the current MobDeals catalog.', 'UPS and Backup Power in Nairobi', 'Shop UPS and backup power products from MobDeals in Nairobi with current prices and Kenya delivery support.', 70)
on conflict (slug) do update set
  label = excluded.label,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

create table if not exists public.products (
  id uuid primary key default extensions.gen_random_uuid(),
  source_row integer not null,
  slug text not null,
  product_name text not null,
  brand text not null,
  category text not null,
  condition text not null,
  price_kes integer not null check (price_kes > 0),
  ram text,
  storage text,
  generation text,
  seo_title text not null,
  short_description text not null,
  long_description text not null,
  json_ld jsonb not null,
  image_key text not null,
  image_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists title text,
  add column if not exists compare_at_price integer,
  add column if not exists short_specs text,
  add column if not exists description_html text,
  add column if not exists meta_description text,
  add column if not exists focus_keyword text,
  add column if not exists search_keywords text,
  add column if not exists warranty text,
  add column if not exists stock_status text,
  add column if not exists sku text,
  add column if not exists availability text,
  add column if not exists is_available boolean not null default true,
  add column if not exists tags text[] not null default '{}',
  add column if not exists featured boolean not null default false,
  add column if not exists source_id text,
  add column if not exists source_kind text,
  add column if not exists source_sheet text,
  add column if not exists source_section text;

create unique index if not exists products_slug_key on public.products (slug);
create unique index if not exists products_sku_key on public.products (sku) where sku is not null;
create index if not exists products_catalog_filter_idx
  on public.products (is_active, is_available, category, price_kes);
create index if not exists products_brand_idx on public.products (brand);

do $$
begin
  alter table public.products
    add constraint products_category_fkey
    foreign key (category) references public.product_categories (slug)
    on update cascade on delete restrict;
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.product_images (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  position smallint not null check (position > 0),
  storage_key text not null,
  image_url text not null,
  alt_text text not null,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, position),
  unique (product_id, storage_key)
);

create index if not exists product_images_product_position_idx
  on public.product_images (product_id, position);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_product_categories_updated_at on public.product_categories;
create trigger set_product_categories_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists set_product_images_updated_at on public.product_images;
create trigger set_product_images_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Public can view active categories" on public.product_categories;
create policy "Public can view active categories"
on public.product_categories for select
to anon, authenticated
using (is_active);

drop policy if exists "Public can view available products" on public.products;
create policy "Public can view available products"
on public.products for select
to anon, authenticated
using (is_active and is_available);

drop policy if exists "Public can view available product images" on public.product_images;
create policy "Public can view available product images"
on public.product_images for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products
    where products.id = product_images.product_id
      and products.is_active
      and products.is_available
  )
);

grant select on public.product_categories, public.products, public.product_images to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  52428800,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product media" on storage.objects;
create policy "Public can view product media"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

commit;

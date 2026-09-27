begin;

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
  ('desktops', 'Desktop Computers', 'Business and home workstations', 'Desktop computers and all-in-one systems for everyday work, study, and office setups.', 'Desktop Computers in Nairobi', 'Browse desktop computers from MobDeals in Nairobi with current prices, specifications, and Kenya delivery support.', 15),
  ('smartphones', 'Smartphones', 'Mobile devices', 'Smartphones for communication, work, and everyday use with clear prices and condition details.', 'Smartphones in Nairobi', 'Shop smartphones from MobDeals in Nairobi with current prices, condition details, and Kenya delivery support.', 25)
on conflict (slug) do update set
  label = excluded.label,
  eyebrow = excluded.eyebrow,
  description = excluded.description,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = now();

commit;

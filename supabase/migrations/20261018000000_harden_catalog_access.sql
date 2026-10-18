-- Catalog clients are read-only; imports continue to use service_role.
-- This changes permissions/policies only and does not delete catalog data.
begin;

-- Permissive policies combine with OR. The legacy active-only policy weakens
-- the available-products policy when both exist on the hosted database.
drop policy if exists "Public can read active products" on public.products;
drop policy if exists "Public can view available products" on public.products;
create policy "Public can view available products"
on public.products for select
to anon, authenticated
using (is_active and is_available);

-- RLS does not govern TRUNCATE/REFERENCES. Remove the default broad catalog
-- grants as well as relying on the absence of public write policies.
revoke all privileges on table
  public.product_categories, public.products, public.product_images
from public, anon, authenticated;
grant select on table
  public.product_categories, public.products, public.product_images
to anon, authenticated;

-- These helpers are invoked by database triggers, not browser RPC clients.
-- Keep existing owner/service_role privileges and the triggers themselves.
revoke execute on function public.set_updated_at()
from public, anon, authenticated;

-- Supabase's optional auto-RLS event-trigger helper is absent on fresh local
-- replays. Restrict its ACL when it exists without replacing its definition.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end;
$$;

commit;

-- Run in the project Supabase SQL Editor and share the single audit result.
-- Read-only: no data, policies, settings, or migrations are changed.
-- The migration-history table was confirmed to exist on the hosted project.
with
rls as (
select n.nspname as schema_name, c.relname as table_name,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('r', 'p')
  and ((n.nspname = 'public' and c.relname in
        ('products', 'product_images', 'product_categories'))
       or (n.nspname = 'storage' and c.relname = 'objects'))
order by 1, 2
),
policies as (
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename in
       ('products', 'product_images', 'product_categories'))
   or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname
),
grants as (
select grantee, table_schema, table_name, privilege_type
from information_schema.role_table_grants
where grantee in ('anon', 'authenticated', 'service_role', 'PUBLIC')
  and ((table_schema = 'public' and table_name in
        ('products', 'product_images', 'product_categories'))
       or (table_schema = 'storage' and table_name = 'objects'))
order by table_schema, table_name, grantee, privilege_type
),
functions as (
select n.nspname as schema_name, p.proname as function_name,
       pg_get_function_identity_arguments(p.oid) as arguments,
       pg_get_function_result(p.oid) as return_type,
       p.prosecdef as security_definer, p.proacl as explicit_acl,
       has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by function_name, arguments
),
constraints as (
select c.relname as table_name, con.conname as constraint_name,
       pg_get_constraintdef(con.oid) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('products', 'product_images', 'product_categories')
order by table_name, constraint_name
)
select jsonb_build_object(
  'rls', coalesce((select jsonb_agg(to_jsonb(result)) from rls result), '[]'::jsonb),
  'policies', coalesce((select jsonb_agg(to_jsonb(result)) from policies result), '[]'::jsonb),
  'grants', coalesce((select jsonb_agg(to_jsonb(result)) from grants result), '[]'::jsonb),
  'functions', coalesce((select jsonb_agg(to_jsonb(result)) from functions result), '[]'::jsonb),
  'constraints', coalesce((select jsonb_agg(to_jsonb(result)) from constraints result), '[]'::jsonb),
  'migration_versions', coalesce((select jsonb_agg(version order by version) from supabase_migrations.schema_migrations), '[]'::jsonb)
) as audit;

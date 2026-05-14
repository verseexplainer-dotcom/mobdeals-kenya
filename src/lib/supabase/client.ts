import { createClient } from '@supabase/supabase-js';
import { siteConfig } from '@config/site';

/*
  Browser-safe Supabase client.
  Use only public anon credentials here; service role keys must never ship to Astro client code.
*/
export function createSupabaseBrowserClient() {
  if (!siteConfig.supabaseUrl || !siteConfig.supabaseAnonKey) {
    throw new Error('Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY.');
  }

  return createClient(siteConfig.supabaseUrl, siteConfig.supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

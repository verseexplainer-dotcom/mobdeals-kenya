import { siteConfig } from '@config/site';

export interface SupabasePublicAssetOptions {
  bucket?: string;
  path: string;
}

export function createSupabasePublicAssetUrl({ bucket = siteConfig.storageBucket, path }: SupabasePublicAssetOptions): string {
  if (!siteConfig.supabaseUrl) {
    throw new Error('Missing PUBLIC_SUPABASE_URL.');
  }

  const normalizedBase = siteConfig.supabaseUrl.replace(/\/$/, '');
  const normalizedPath = path.replace(/^\/+/, '');

  return `${normalizedBase}/storage/v1/object/public/${bucket}/${normalizedPath}`;
}

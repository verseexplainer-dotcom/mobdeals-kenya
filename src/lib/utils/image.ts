import { siteConfig } from '@config/site';

export interface StorageImageOptions {
  bucket?: string;
  width?: number;
  quality?: number;
}

export function publicImage(path: string): string {
  return path.startsWith('/') ? path : `/${path}`;
}

export function supabaseStorageImage(path: string, options: StorageImageOptions = {}): string {
  const baseUrl = siteConfig.supabaseUrl;
  const bucket = options.bucket ?? siteConfig.storageBucket;

  if (!baseUrl) {
    return '';
  }

  const cleanPath = path.replace(/^\/+/, '');
  const url = new URL(`/storage/v1/object/public/${bucket}/${cleanPath}`, baseUrl);

  if (options.width) {
    url.searchParams.set('width', String(options.width));
  }

  if (options.quality) {
    url.searchParams.set('quality', String(options.quality));
  }

  return url.toString();
}

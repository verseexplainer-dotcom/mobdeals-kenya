import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import storefront from './astro.config.mjs';

export default defineConfig({
  ...storefront,
  root: fileURLToPath(new URL('./marketing/', import.meta.url)),
  site: 'https://mobdeals.co.ke',
  srcDir: fileURLToPath(new URL('./marketing/src/', import.meta.url)),
  publicDir: fileURLToPath(new URL('./.marketing/public/', import.meta.url)),
  outDir: fileURLToPath(new URL('./dist-marketing/', import.meta.url)),
  cacheDir: fileURLToPath(new URL('./marketing/.astro/', import.meta.url)),
  envDir: fileURLToPath(new URL('./', import.meta.url))
});

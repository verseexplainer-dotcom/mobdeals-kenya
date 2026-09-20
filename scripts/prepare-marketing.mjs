import { cp, mkdir } from 'node:fs/promises';

// Both builds share approved brand/home media; routing files stay independent.
const target = new URL('../.marketing/public/', import.meta.url);
await mkdir(target, { recursive: true });
for (const file of ['images', 'favicon.ico', 'favicon-32x32.png', 'favicon-16x16.png', 'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png', 'site.webmanifest', '_headers']) {
  await cp(new URL(`../public/${file}`, import.meta.url), new URL(file, target), { recursive: true });
}
await cp(new URL('../marketing/public/', import.meta.url), target, { recursive: true });

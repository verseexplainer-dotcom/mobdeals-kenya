import { mkdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const [kind, name, source] = process.argv.slice(2);
if (!['hero', 'category'].includes(kind) || !/^[a-z0-9-]+$/.test(name ?? '') || !source) {
  throw new Error('Usage: node scripts/import-home-media.mjs hero|category name source-file-or-https-url');
}
const input = source.startsWith('https:')
  ? Buffer.from(await (await fetch(source).then((response) => {
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);
      return response;
    })).arrayBuffer())
  : await readFile(source);
await mkdir('public/images/home', { recursive: true });
if (kind === 'hero') {
  await sharp(input).rotate().resize(1920, 1080, { fit: 'cover' }).webp({ quality: 84 }).toFile(`public/images/home/${name}-desktop.webp`);
  await sharp(input).rotate().resize(900, 1200, { fit: 'cover', position: 'attention' }).webp({ quality: 82 }).toFile(`public/images/home/${name}-mobile.webp`);
} else {
  for (const width of [400, 800]) {
    const suffix = width === 800 ? '' : '-400';
    await sharp(input).rotate().resize(width, width, { fit: 'contain', background: '#163b3a' }).webp({ quality: 82 }).toFile(`public/images/home/category-${name}${suffix}.webp`);
  }
}
const manifestPath = 'public/images/home/provenance.json';
const manifest = await readFile(manifestPath, 'utf8').then(JSON.parse).catch(() => ({}));
manifest[`${kind}-${name}`] = { source, importedAt: new Date().toISOString(), representative: true };
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Imported ${kind} ${name}`);

import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC_DIR = 'public';
const WIDTHS = [480, 800, 1200];
const SKIP = new Set(['og-image.webp', 'favicon.png']);

const isVariant = (name) => /-\d+w\.webp$/.test(name);

async function run() {
  const files = await readdir(PUBLIC_DIR);
  const sources = files.filter(
    (f) => f.endsWith('.webp') && !SKIP.has(f) && !isVariant(f)
  );

  for (const file of sources) {
    const input = path.join(PUBLIC_DIR, file);
    const base = file.replace(/\.webp$/, '');
    const { width } = await sharp(input).metadata();

    for (const target of WIDTHS) {
      if (target >= width) continue;
      const out = path.join(PUBLIC_DIR, `${base}-${target}w.webp`);
      await sharp(input)
        .resize({ width: target, withoutEnlargement: true })
        .webp({ quality: 78, effort: 6 })
        .toFile(out);
      const { size } = await stat(out);
      console.log(`${out} ${(size / 1024).toFixed(1)} kB`);
    }
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});

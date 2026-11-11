import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { IMAGE_SPEC, RAW_DIR, TARGETS, captureGeometry } from './capture-projects.mjs';

const OUTPUT_DIR = path.join('public', 'projects');
const FORMATS = ['avif', 'webp'];
const EFFORT = 6;
const WEBP_QUALITY = 85;
// First entry is the default; lower values are tried only when a file exceeds its budget.
// At 65 every file was under half its budget, so the spare weight buys detail in photos and maps.
// 55 is the floor: below it fine interface text and satellite texture start to smear.
const AVIF_QUALITIES = [72, 68, 64, 60, 57, 55];
// 960 is the width most visitors download and 1920 the largest, so they carry the weight budget.
const BUDGETS = { 960: 120 * 1024, 1920: 350 * 1024 };

function parseArgs(argv) {
  const options = { only: null, check: false, site: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--only') options.only = argv[++i].split(',');
    else if (argv[i] === '--check') options.check = true;
    else if (argv[i] === '--site') options.site = true;
  }
  return options;
}

// rgb(10 10 15) is --color-ink: the bars around a letterboxed view blend into the site.
const INK = { r: 10, g: 10, b: 15 };

const heightFor = (width) => Math.round((width * IMAGE_SPEC.base.height) / IMAGE_SPEC.base.width);
const outputPath = (id, width, format, name = 'desktop') => path.join(OUTPUT_DIR, id, `${name}-${width}.${format}`);
const videoOutputPath = (id, slug) => path.join(OUTPUT_DIR, id, `${slug}.mp4`);
const rawPath = (id, name = 'desktop') => path.join(RAW_DIR, id, `${name}.png`);
const exists = (file) => stat(file).then(() => true, () => false);

// Names of every set a project ships: the card (desktop) plus its gallery views.
const setNames = (target) => ['desktop', ...(target.views ?? []).map((view) => view.slug)];

async function assertRawSize({ id, input }) {
  const expected = captureGeometry(TARGETS[id]);
  const { width, height } = await sharp(input).metadata();
  if (width !== expected.width || height !== expected.height) {
    throw new Error(`${input} is ${width}x${height}, expected ${expected.width}x${expected.height}. Run pnpm capture again.`);
  }
  // The raw frame must be exactly 16:10 and at least as wide as the base, so nothing is cropped or upscaled.
  if (width * 10 !== height * 16 || width < IMAGE_SPEC.base.width) {
    throw new Error(`${input} must be 16:10 and at least ${IMAGE_SPEC.base.width} px wide (got ${width}x${height}).`);
  }
}

// One resample straight from the raw capture (lanczos3), never from an already reduced copy.
// 4:4:4 chroma keeps thin text and colored borders crisp; 4:2:0 would blur them.
function encode({ input, width, format, quality }) {
  const resized = sharp(input).resize(width, heightFor(width), { kernel: 'lanczos3', fit: 'fill' });
  return format === 'avif'
    ? resized.avif({ quality, effort: EFFORT, chromaSubsampling: '4:4:4' }).toBuffer()
    : resized.webp({ quality, effort: EFFORT, smartSubsample: true }).toBuffer();
}

// Highest AVIF quality whose file fits the width's budget; widths without a budget use the default.
async function encodeAvif({ input, width }) {
  const budget = BUDGETS[width];
  let result = null;
  for (const quality of AVIF_QUALITIES) {
    result = { buffer: await encode({ input, width, format: 'avif', quality }), quality };
    if (!budget || result.buffer.length <= budget) break;
  }
  return result;
}

// A source that is not 16:10 is scaled to fit the base frame and centered on the site background:
// nothing is cropped, and the bars carry no content. page picks a frame of an animated file.
function composeFrame({ input, page = 0, crop }) {
  const { width, height } = IMAGE_SPEC.base;
  const frame = sharp(input, { page });
  // crop selects the region worth showing (a 16:10 one needs no bars at all) before the fit.
  return (crop ? frame.extract(crop) : frame)
    .resize(width, height, { kernel: 'lanczos3', fit: 'contain', background: INK })
    .flatten({ background: INK })
    .png()
    .toBuffer();
}

async function optimizeSet({ id, input, name = 'desktop', composed = false }) {
  if (!composed) await assertRawSize({ id, input });
  await mkdir(path.join(OUTPUT_DIR, id), { recursive: true });
  const rows = [];
  for (const width of IMAGE_SPEC.widths) {
    const avif = await encodeAvif({ input, width });
    const webp = { buffer: await encode({ input, width, format: 'webp', quality: WEBP_QUALITY }), quality: WEBP_QUALITY };
    for (const [format, result] of [['avif', avif], ['webp', webp]]) {
      const file = outputPath(id, width, format, name);
      await writeFile(file, result.buffer);
      rows.push({ file, width, format, bytes: result.buffer.length, quality: result.quality });
    }
  }
  return rows;
}

// Targets with their own docs: one set per view, the cover also as desktop, and the video copied.
async function optimizeExternal(id) {
  const target = TARGETS[id];
  const rows = [];
  for (const view of target.views) {
    const input = await composeFrame({ input: path.join(target.sourceDir, view.file), page: view.page, crop: view.crop });
    rows.push(...(await optimizeSet({ id, input, name: view.slug, composed: true })));
    if (view.slug === target.cover) rows.push(...(await optimizeSet({ id, input, composed: true })));
  }
  if (target.video) await copyFile(path.join(target.sourceDir, target.video.file), videoOutputPath(id, target.video.slug));
  return rows;
}

// Site-level assets built from committed sources: logo widths, manifest icons and the PNG share image.
const LOGO_SOURCE = path.join('public', 'logo-nsma_light.webp');
const LOGO_WIDTHS = [120, 200];
const OG_SOURCE = path.join('public', 'og-image.webp');
const BACKGROUND = { ...INK, alpha: 1 };
// logoRatio is the wordmark width over the canvas width; the maskable icon keeps it inside the 60% safe zone.
const ICONS = [
  { file: 'apple-touch-icon.png', size: 180, logoRatio: 0.7 },
  { file: 'icon-192.png', size: 192, logoRatio: 0.7 },
  { file: 'icon-512.png', size: 512, logoRatio: 0.7 },
  { file: 'icon-512-maskable.png', size: 512, logoRatio: 0.6 },
];
const logoVariantPath = (width) => path.join('public', `logo-nsma_light-${width}w.webp`);
const publicPath = (file) => path.join('public', file);

async function iconBuffer({ size, logoRatio }) {
  const logoWidth = Math.round(size * logoRatio);
  const logo = await sharp(LOGO_SOURCE).trim().resize({ width: logoWidth, kernel: 'lanczos3' }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: BACKGROUND } })
    .composite([{ input: logo, gravity: 'centre' }])
    .flatten({ background: INK })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

async function optimizeSiteAssets() {
  const rows = [];
  const write = async (file, buffer, quality = '-') => {
    await writeFile(file, buffer);
    rows.push({ file, bytes: buffer.length, quality });
  };
  for (const width of LOGO_WIDTHS) {
    const buffer = await sharp(LOGO_SOURCE).resize({ width, kernel: 'lanczos3' }).webp({ quality: WEBP_QUALITY, effort: EFFORT }).toBuffer();
    await write(logoVariantPath(width), buffer, WEBP_QUALITY);
  }
  for (const icon of ICONS) await write(publicPath(icon.file), await iconBuffer(icon));
  const og = await sharp(OG_SOURCE).png({ compressionLevel: 9, palette: true, quality: 90, effort: 10 }).toBuffer();
  await write(publicPath('og-image.png'), og);
  return rows;
}

async function checkSiteAssets() {
  const expected = [
    ...LOGO_WIDTHS.map((width) => ({ file: logoVariantPath(width), width })),
    ...ICONS.map(({ file, size }) => ({ file: publicPath(file), width: size, height: size })),
    { file: publicPath('og-image.png'), width: 1200, height: 630 },
  ];
  const problems = [];
  for (const { file, width, height } of expected) {
    const metadata = await sharp(file).metadata().catch(() => null);
    if (!metadata) problems.push(`missing: ${file}`);
    else if (metadata.width !== width || (height && metadata.height !== height)) {
      problems.push(`wrong size: ${file} is ${metadata.width}x${metadata.height}`);
    }
  }
  return problems;
}

function printTable(rows) {
  const pad = (value, size) => String(value).padEnd(size);
  const nameWidth = Math.max(...rows.map((row) => row.file.length));
  console.log(`${pad('file', nameWidth)}  quality  size`);
  for (const row of rows) {
    console.log(`${pad(row.file, nameWidth)}  ${pad(row.quality, 7)}  ${(row.bytes / 1024).toFixed(1)} KB`);
  }
}

function warnOverBudget(rows) {
  for (const row of rows) {
    const budget = row.format === 'avif' ? BUDGETS[row.width] : undefined;
    if (budget && row.bytes > budget) {
      console.warn(`over budget: ${row.file} ${(row.bytes / 1024).toFixed(1)} KB (limit ${budget / 1024} KB)`);
    }
  }
}

// ProjectImage requests 4 widths x 2 formats per set (the card and each gallery view), all exactly 16:10;
// nothing else may remain except the project's video.
async function checkOutputs(only) {
  const problems = [];
  for (const id of Object.keys(TARGETS)) {
    if (only && !only.includes(id)) continue;
    const expected = new Set();
    for (const name of setNames(TARGETS[id])) {
      for (const width of IMAGE_SPEC.widths) {
        for (const format of FORMATS) {
          const file = outputPath(id, width, format, name);
          expected.add(path.basename(file));
          const metadata = await sharp(file).metadata().catch(() => null);
          if (!metadata) problems.push(`missing: ${file}`);
          else if (metadata.width !== width || metadata.height !== heightFor(width)) {
            problems.push(`wrong size: ${file} is ${metadata.width}x${metadata.height}`);
          }
        }
      }
    }
    const { video } = TARGETS[id];
    if (video) {
      const file = videoOutputPath(id, video.slug);
      expected.add(path.basename(file));
      if (!(await exists(file))) problems.push(`missing: ${file}`);
    }
    const present = await readdir(path.join(OUTPUT_DIR, id)).catch(() => []);
    for (const name of present) if (!expected.has(name)) problems.push(`unexpected: ${path.join(OUTPUT_DIR, id, name)}`);
  }
  return problems;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.check) {
    // --site rebuilds only the logo widths, icons and share image, leaving the project sets untouched.
    const ids = options.site ? [] : Object.keys(TARGETS).filter((id) => !options.only || options.only.includes(id));
    const sets = [];
    const external = [];
    for (const id of ids) {
      if (TARGETS[id].external) {
        if (await exists(TARGETS[id].sourceDir)) external.push(id);
      } else {
        for (const name of setNames(TARGETS[id])) if (await exists(rawPath(id, name))) sets.push({ id, input: rawPath(id, name), name });
      }
    }
    // .captures is not versioned, so a fresh checkout has no raw frames: validate the committed files only.
    if (sets.length + external.length === 0 && options.only && !options.site) throw new Error(`No raw captures or project docs for ${options.only.join(', ')}. Run pnpm capture first.`);
    if (sets.length + external.length === 0 && !options.site) console.log(`No raw captures in ${RAW_DIR}; skipping encode. Run pnpm capture to refresh them.`);
    const rows = [];
    for (const set of sets) rows.push(...(await optimizeSet(set)));
    for (const id of external) rows.push(...(await optimizeExternal(id)));
    if (!options.only || options.site) rows.push(...(await optimizeSiteAssets()));
    if (rows.length > 0) printTable(rows);
    warnOverBudget(rows);
  }

  const problems = [...(await checkOutputs(options.only)), ...(options.only && !options.site ? [] : await checkSiteAssets())];
  if (problems.length > 0) {
    console.error(`${problems.length} problems:\n${problems.join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log('All expected files exist, with the right size and nothing else.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

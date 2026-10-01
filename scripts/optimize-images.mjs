import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { IMAGE_SPECS, RAW_DIR, TARGETS } from './capture-projects.mjs';

const OUTPUT_DIR = path.join('public', 'projects');
const WEBP_QUALITY = 78;
const EFFORT = 6;
// First entry is the default; lower values are tried only if the budget is exceeded.
const AVIF_QUALITIES = [50, 45, 40];
// desktop-800.avif is the size most visitors download, so it carries the weight budget.
const BUDGET = { kind: 'desktop', width: 800, bytes: 60 * 1024 };
const FORMATS = ['avif', 'webp'];

function parseArgs(argv) {
  const options = { only: null, check: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--only') options.only = argv[++i].split(',');
    else if (argv[i] === '--check') options.check = true;
  }
  return options;
}

const heightFor = (spec, width) => Math.round((width * spec.base.height) / spec.base.width);
const outputPath = (id, kind, width, format) => path.join(OUTPUT_DIR, id, `${kind}-${width}.${format}`);

async function listRawSets(only) {
  const entries = await readdir(RAW_DIR, { withFileTypes: true }).catch(() => []);
  const sets = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || (only && !only.includes(entry.name))) continue;
    for (const kind of Object.keys(IMAGE_SPECS)) {
      const input = path.join(RAW_DIR, entry.name, `${kind}.png`);
      if (await stat(input).then(() => true, () => false)) sets.push({ id: entry.name, kind, input });
    }
  }
  return sets;
}

async function assertRawSize({ input, kind }) {
  const spec = IMAGE_SPECS[kind];
  const expected = { width: spec.viewport.width * spec.scale, height: spec.viewport.height * spec.scale };
  const { width, height } = await sharp(input).metadata();
  if (width !== expected.width || height !== expected.height) {
    throw new Error(`${input} is ${width}x${height}, expected ${expected.width}x${expected.height}. Run pnpm capture again.`);
  }
}

async function encode({ input, spec, width, format, quality }) {
  const resized = sharp(input).resize(width, heightFor(spec, width), { fit: 'fill' });
  const encoded =
    format === 'avif'
      ? resized.avif({ quality, effort: EFFORT })
      : resized.webp({ quality, effort: EFFORT });
  return encoded.toBuffer();
}

// Picks the highest AVIF quality that keeps the budgeted variant under its weight limit.
async function chooseAvifQuality({ input, kind }) {
  if (kind !== BUDGET.kind) return AVIF_QUALITIES[0];
  const spec = IMAGE_SPECS[kind];
  for (const quality of AVIF_QUALITIES) {
    const buffer = await encode({ input, spec, width: BUDGET.width, format: 'avif', quality });
    if (buffer.length <= BUDGET.bytes) return quality;
  }
  return AVIF_QUALITIES[AVIF_QUALITIES.length - 1];
}

async function optimizeSet(set) {
  const spec = IMAGE_SPECS[set.kind];
  await assertRawSize(set);
  await mkdir(path.join(OUTPUT_DIR, set.id), { recursive: true });
  const avifQuality = await chooseAvifQuality(set);
  const rows = [];

  for (const width of spec.widths) {
    for (const format of FORMATS) {
      const quality = format === 'avif' ? avifQuality : WEBP_QUALITY;
      const buffer = await encode({ input: set.input, spec, width, format, quality });
      const file = outputPath(set.id, set.kind, width, format);
      await writeFile(file, buffer);
      rows.push({ file, bytes: buffer.length, quality });
    }
  }
  return rows;
}

function printTable(rows) {
  const pad = (value, size) => String(value).padEnd(size);
  const nameWidth = Math.max(...rows.map((row) => row.file.length));
  console.log(`${pad('file', nameWidth)}  quality  size`);
  for (const row of rows) {
    console.log(`${pad(row.file, nameWidth)}  ${pad(row.quality, 7)}  ${(row.bytes / 1024).toFixed(1)} KB`);
  }
}

// Every path ProjectImage requests must exist: 4 widths x 2 formats per project and kind.
async function checkOutputs(only) {
  const missing = [];
  for (const [id, target] of Object.entries(TARGETS)) {
    if (target.skipByDefault && !only?.includes(id)) continue;
    if (only && !only.includes(id)) continue;
    for (const kind of target.kinds) {
      for (const width of IMAGE_SPECS[kind].widths) {
        for (const format of FORMATS) {
          const file = outputPath(id, kind, width, format);
          if (!(await stat(file).then((info) => info.size > 0, () => false))) missing.push(file);
        }
      }
    }
  }
  return missing;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const rows = [];

  if (!options.check) {
    const sets = await listRawSets(options.only);
    if (sets.length === 0) throw new Error(`No raw captures in ${RAW_DIR}. Run pnpm capture first.`);
    for (const set of sets) rows.push(...(await optimizeSet(set)));
    printTable(rows);

    const budgeted = rows.filter((row) => row.file.endsWith(`${BUDGET.kind}-${BUDGET.width}.avif`));
    const over = budgeted.filter((row) => row.bytes > BUDGET.bytes);
    for (const row of over) console.warn(`over budget: ${row.file} ${(row.bytes / 1024).toFixed(1)} KB`);
  }

  const missing = await checkOutputs(options.only);
  if (missing.length > 0) {
    console.error(`Missing ${missing.length} files:\n${missing.join('\n')}`);
    process.exitCode = 1;
    return;
  }
  console.log('All expected files exist.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

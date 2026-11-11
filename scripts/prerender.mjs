// Writes one static page per language from the client build (dist) and the server bundle (dist-ssr):
// dist/index.html in Spanish and dist/en/index.html in English, plus the bilingual sitemap.
// Fails the build when a page is missing something search engines need.
import { execSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = path.join(root, 'dist');
const serverEntry = path.join(root, 'dist-ssr', 'entry-server.js');
const SITE_URL = 'https://nsma.dev';
const PAGES = [
  { language: 'es', file: 'index.html', url: `${SITE_URL}/` },
  // en.html is served at /en: by vercel.json cleanUrls in production and by Vite's HTML fallback in preview.
  { language: 'en', file: 'en.html', url: `${SITE_URL}/en` },
];
const SECTION_IDS = ['home', 'about', 'projects', 'experience', 'approach', 'contact'];

const { render, renderHeadTags } = await import(pathToFileURL(serverEntry).href);

// The main stylesheet is the only request that blocks the first paint. Inlined, the page paints with the HTML alone.
// Lazy sections (Projects) bring their own CSS with their chunk, after the prerendered HTML is already on screen,
// so every stylesheet of the build goes inline. The CSP allows inline styles and the font URLs inside are absolute.
async function inlineStylesheets(html) {
  const link = html.match(/<link rel="stylesheet" crossorigin href="(\/assets\/index-[\w-]+\.css)">/);
  if (!link) throw new Error('index.html no enlaza el CSS principal');
  const assets = path.join(dist, 'assets');
  const files = (await readdir(assets)).filter((file) => file.endsWith('.css'));
  const main = path.basename(link[1]);
  const ordered = [main, ...files.filter((file) => file !== main)];
  const css = (await Promise.all(ordered.map((file) => readFile(path.join(assets, file), 'utf8')))).join('\n');
  if (css.includes('</style')) throw new Error('el CSS contiene </style');
  return html.replace(link[0], () => `<style>${css}</style>`);
}

const template = await inlineStylesheets(await readFile(path.join(dist, 'index.html'), 'utf8'));

for (const marker of ['<!--app-head-->', '<!--app-html-->', '<html lang="es">']) {
  if (!template.includes(marker)) throw new Error(`index.html no contiene ${marker}`);
}

function check(page, html) {
  const problems = [];
  const expect = (condition, message) => condition || problems.push(message);
  expect(html.includes(`<html lang="${page.language}">`), 'lang del documento');
  expect(html.includes(`<link rel="canonical" href="${page.url}" />`), 'canonical');
  for (const lang of ['es', 'en', 'x-default']) expect(html.includes(`hreflang="${lang}"`), `hreflang ${lang}`);
  expect(/<h1[\s>]/.test(html), 'h1');
  for (const id of SECTION_IDS) expect(html.includes(`id="${id}"`), `seccion #${id}`);
  // <!--$!--> is a boundary that failed on the server and <!--$?--> one left pending: the client would render
  // either from scratch. An inline <script> would be blocked by the CSP.
  expect(!html.includes('<!--$!-->'), 'frontera de Suspense fallida');
  expect(!html.includes('<!--$?-->'), 'frontera de Suspense pendiente');
  expect(!/<script(?![^>]*\b(type="module"|type="application\/ld\+json"))[^>]*>/.test(html), 'script inline');
  if (problems.length) throw new Error(`${page.file}: falta ${problems.join(', ')}`);
}

for (const page of PAGES) {
  const appHtml = await render(page.language);
  const html = template
    .replace('<html lang="es">', `<html lang="${page.language}">`)
    .replace('<!--app-head-->', renderHeadTags(page.language))
    .replace('<!--app-html-->', appHtml);
  check(page, html);
  const target = path.join(dist, page.file);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
  console.log(`prerender: ${page.file} (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
}

function lastModified() {
  try {
    return execSync('git log -1 --format=%cs', { encoding: 'utf8' }).trim();
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

const lastmod = lastModified();
const alternates = [
  ...PAGES.map((page) => `    <xhtml:link rel="alternate" hreflang="${page.language}" href="${page.url}"/>`),
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${PAGES[0].url}"/>`,
].join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.map((page) => `  <url>\n    <loc>${page.url}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`).join('\n')}
</urlset>
`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
console.log(`prerender: sitemap.xml (lastmod ${lastmod})`);

await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true });

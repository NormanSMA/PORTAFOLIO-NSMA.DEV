import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ??
  'C:\\Users\\norma\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';

export const RAW_DIR = path.join('.captures', 'raw');

// Only desktop is captured. base and widths must match src/components/atoms/ProjectImage.tsx.
// Every output is exactly 16:10, so no crop is ever applied after the screenshot.
export const IMAGE_SPEC = {
  viewport: { width: 1440, height: 900 },
  scale: 2,
  base: { width: 1920, height: 1200 },
  widths: [480, 960, 1440, 1920],
};

// Raw screenshot size for a target: its own viewport (or the default) times its scale.
export function captureGeometry(target) {
  const viewport = target.viewport ?? IMAGE_SPEC.viewport;
  const scale = target.scale ?? IMAGE_SPEC.scale;
  return { viewport, scale, width: viewport.width * scale, height: viewport.height * scale };
}

// Software WebGL so the 3D globe renders without a GPU in headless mode.
const CHROMIUM_ARGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
];

// Banners and overlays that cover the interface; hidden for every target.
const COMMON_HIDE = [
  '[id*="cookie" i]',
  '[class*="cookie" i]',
  '[id*="consent" i]',
  '[class*="consent" i]',
  '[aria-label*="cookie" i]',
  '#onetrust-consent-sdk',
  '.cc-window',
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Another page of the same site, for a target with several views: waits for the load and the entrance animations.
async function openPath(page, pathname, settleMs = 3500) {
  await page.goto(new URL(pathname, page.url()).href, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await sleep(settleMs);
}

// settleMs: wait after load for live data and entrance animations to finish.
// viewport and scale: optional override; the result must stay 16:10 (default 1440x900 at 2x).
// hide: extra CSS selectors to remove. click: selectors to click once, if present.
// waitFor: selector that must be visible before capturing. prepare: custom steps.
// chromiumArgs: extra browser flags for that target only. hardwareGl: skip the SwiftShader flags.
// skipByDefault: needs a local server, so it is captured only when named with --only.
// external: never captured with the browser. Its images already exist in the project's own docs and
// optimize-images.mjs composes them (see sourceDir, cover, views and video there).
export const TARGETS = {
  // Rasterized from the repo's docs (public repo, fictitious demo data): optimize-images.mjs reads them.
  autofinops: {
    external: true,
    sourceDir: process.env.AUTOFINOPS_DOCS ?? 'C:\\Proyectos\\Personal\\autofinops-rpa-engine\\docs',
    // View that also becomes desktop-*, the ring card. Every view is letterboxed on the site background, never cropped.
    cover: 'metabase',
    // A page of an animated file picks the poster frame; the video is copied as-is next to the posters.
    views: [
      { slug: 'demo', file: 'demo\\autofinops-demo.gif', page: 115 },
      { slug: 'metabase', file: 'screenshots\\metabase-dashboard.png' },
      { slug: 'orchestrator', file: 'screenshots\\orchestrator-queue.png' },
      { slug: 'correo', file: 'screenshots\\correo-reporte.png' },
    ],
    video: { slug: 'demo', file: 'demo\\autofinops-demo.mp4' },
  },
  // Frames of the sc-plataforma demo stack (seeded fictitious data only), taken with that repo's own capture
  // CLI into .captures/raw/tracore. Each view crops the 16:10 region that shows what its caption says.
  tracore: {
    external: true,
    sourceDir: path.join(RAW_DIR, 'tracore'),
    cover: 'avance',
    views: [
      { slug: 'cotizacion', file: 'cotizacion.png', crop: { left: 0, top: 0, width: 1366, height: 854 } },
      { slug: 'avance', file: 'orden.png', crop: { left: 0, top: 0, width: 1366, height: 854 } },
      { slug: 'costos', file: 'trazabilidad.png', crop: { left: 260, top: 1274, width: 1104, height: 690 } },
      { slug: 'bitacora', file: 'trazabilidad.png', crop: { left: 260, top: 2140, width: 1104, height: 690 } },
    ],
  },
  ecopulse: {
    url: 'https://ecopulse.nsma.dev/',
    settleMs: 12000,
    cover: 'globo',
    // Every view reloads the page so the state of the previous one (open panels, 3D mode) never leaks in.
    views: [
      { slug: 'mapa' },
      {
        slug: 'regional',
        prepare: async (page) => {
          await openPath(page, '/', 12000);
          // Both panels closed and the map zoomed in: the clusters open up into single events.
          for (const name of ['Controles', 'Eventos recientes']) {
            await page.getByRole('complementary', { name }).getByRole('button', { name: 'Cerrar' }).click({ timeout: 5000 });
          }
          await page.mouse.move(720, 450);
          await page.mouse.wheel(0, -600);
          await sleep(8000);
        },
      },
      {
        slug: 'atmosfera',
        prepare: async (page) => {
          await openPath(page, '/', 12000);
          await page.getByText('Calidad del aire (PM2,5)').click({ timeout: 5000 });
          await page.getByText('Radar de lluvia').click({ timeout: 5000 });
          await sleep(8000);
        },
      },
      {
        slug: 'globo',
        prepare: async (page) => {
          await openPath(page, '/', 12000);
          await page.getByRole('radio', { name: '3d' }).click({ force: true, timeout: 5000 });
          await sleep(12000);
          // Close the layer panel and zoom out so the whole globe shows beside the events list.
          await page.getByRole('complementary', { name: 'Controles' }).getByRole('button', { name: 'Cerrar' }).click({ timeout: 5000 });
          await page.mouse.move(720, 480);
          await page.mouse.wheel(0, 800);
          await sleep(12000);
        },
      },
    ],
  },
  // The published deployment is gone (404 DEPLOYMENT_NOT_FOUND), so this needs the local demo stack of the turno
  // repo: an isolated Postgres seeded with `pnpm db:demo` (synthetic data) and `next dev -p 3200`. Public pages only,
  // so no account is needed. The panel with the pilot indicators is left out on purpose: its numbers are synthetic.
  turno: {
    url: 'http://localhost:3200/',
    settleMs: 5000,
    skipByDefault: true,
    // The Next.js dev badge sits over the bottom corner of every shot.
    hide: ['nextjs-portal'],
    cover: 'inicio',
    views: [
      { slug: 'inicio' },
      { slug: 'comercio', prepare: (page) => openPath(page, '/c/cafeteria-central', 5000) },
      {
        slug: 'pedido',
        prepare: async (page) => {
          await openPath(page, '/c/cafeteria-central', 5000);
          // One dish in the order shows the bar that leads to the pickup slot.
          await page.getByRole('button', { name: 'Agregar un Almuerzo del día' }).click({ timeout: 5000 });
          await sleep(3000);
        },
      },
      { slug: 'como', prepare: (page) => openPath(page, '/como-funciona', 5000) },
    ],
  },
  iuris: {
    url: 'https://iurisnicaragua.com/',
    settleMs: 4000,
    cover: 'inicio',
    views: [
      { slug: 'inicio' },
      { slug: 'servicios', prepare: (page) => openPath(page, '/servicios') },
      { slug: 'nosotros', prepare: (page) => openPath(page, '/nosotros') },
      { slug: 'ingles', prepare: (page) => openPath(page, '/en') },
    ],
  },
  pantano: {
    url: 'https://hotel-el-pantano.vercel.app/',
    settleMs: 4000,
    cover: 'inicio',
    views: [
      { slug: 'inicio' },
      { slug: 'menu', prepare: (page) => openPath(page, '/menu') },
      { slug: 'habitaciones', prepare: (page) => openPath(page, '/habitaciones') },
      { slug: 'eventos', prepare: (page) => openPath(page, '/eventos') },
    ],
  },
  systech: {
    url: 'https://systech.uam.edu.ni/',
    settleMs: 6000,
    // The site links its Unbounded and IBM Plex fonts over http, which Chromium blocks as mixed
    // content; without these flags the page falls back to a system font and looks unfinished.
    chromiumArgs: ['--allow-running-insecure-content', '--disable-web-security'],
    // The home now shows the 2026 edition; the 2025 one (the delivered work) lives on its own page.
    cover: 'edicion',
    views: [
      { slug: 'inicio' },
      { slug: 'edicion', prepare: (page) => openPath(page, '/systech-2025/', 6000) },
      { slug: 'mapa', prepare: (page) => openPath(page, '/mapa-interactivo/', 8000) },
    ],
    prepare: async (page) => {
      // The hero video loops through scenes; pin it on the audience shot so the capture repeats.
      await page.evaluate(async (time) => {
        const video = document.querySelector('video.elementor-video');
        if (!video) return;
        video.pause();
        await new Promise((resolve) => {
          video.addEventListener('seeked', resolve, { once: true });
          video.currentTime = time;
        });
      }, 25);
      // A paused video needs time to present the sought frame; a shorter wait shows the old one.
      await sleep(1500);
    },
  },
  // Needs the demo server running: `pnpm demo` in the ClaudeHub repo (port 4318, fictional data).
  // Its interface is a 820 px column, so 1440 px leaves it small. 1280x800 is the narrowest 16:10
  // viewport that still shows the whole Activos panel (all sessions and the footnote) at 3x.
  claudehub: {
    url: 'http://127.0.0.1:4318',
    viewport: { width: 1280, height: 800 },
    scale: 3,
    settleMs: 3000,
    colorScheme: 'dark',
    // The update banner and the speech bubble of the mascot cover the first panel.
    click: ['button[aria-label^="Cerrar bocadillo"]', 'button:has-text("Luego")'],
    cover: 'resumen',
    // One view per tab of the app, all with the same demo data.
    views: ['resumen', 'agentes', 'modelos', 'sesiones'].map((slug, index) => ({
      slug,
      prepare: async (page) => {
        await page.getByRole('button', { name: slug[0].toUpperCase() + slug.slice(1), exact: true }).click({ timeout: 5000 });
        await sleep(2500);
      },
    })),
  },
  // Needs `pnpm build && pnpm preview` in this repo (port 4173, or pass --url for another port).
  portfolio: {
    url: 'http://localhost:4173',
    settleMs: 3000,
    // Reduced motion shows the hero in its finished state: aligned nodes with their labels, no cursor or pulse.
    reducedMotion: 'reduce',
    skipByDefault: true,
    cover: 'inicio',
    // Each section scrolled to the top of the viewport, in its finished state.
    views: [
      { slug: 'inicio' },
      ...[
        ['sobre-mi', 'about'],
        ['proyectos', 'projects'],
        ['servicios', 'approach'],
      ].map(([slug, id]) => ({
        slug,
        prepare: async (page) => {
          await page.evaluate((sectionId) => document.getElementById(sectionId)?.scrollIntoView({ block: 'start' }), id);
          await sleep(3500);
        },
      })),
    ],
  },
};

function parseArgs(argv) {
  const options = { only: null, url: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--only') options.only = argv[++i].split(',');
    else if (argv[i] === '--url') options.url = argv[++i];
  }
  return options;
}

async function waitForAssets(page) {
  // Bounded wait: live sites keep polling, so never block on the network forever.
  await page
    .evaluate(async () => {
      const visible = [...document.images].filter((img) => {
        const rect = img.getBoundingClientRect();
        return rect.bottom > 0 && rect.top < window.innerHeight;
      });
      const loaded = visible.map((img) =>
        img.complete
          ? null
          : new Promise((resolve) => {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }),
      );
      await Promise.race([
        Promise.all([document.fonts.ready, ...loaded]),
        new Promise((resolve) => setTimeout(resolve, 10000)),
      ]);
    })
    .catch(() => {});
}

async function clearOverlays(page, target) {
  const css = [...COMMON_HIDE, ...(target.hide ?? [])]
    .map((selector) => `${selector}{display:none !important}`)
    .join('\n');
  await page.addStyleTag({ content: css });
  for (const selector of target.click ?? []) {
    await page.locator(selector).first().click({ timeout: 1500 }).catch(() => {});
  }
}

async function captureOne({ browser, id, target, url }) {
  const { viewport, scale } = captureGeometry(target);
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: scale,
    reducedMotion: target.reducedMotion ?? 'no-preference',
    colorScheme: target.colorScheme ?? 'light',
    locale: 'es-NI',
    bypassCSP: true, // strict CSP on some sites would block the injected overlay-hiding style
  });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
    if (target.waitFor) await page.waitForSelector(target.waitFor, { state: 'visible', timeout: 30000 });
    await sleep(target.settleMs);
    await clearOverlays(page, target);
    if (target.prepare) await target.prepare(page);

    const dir = path.join(RAW_DIR, id);
    await mkdir(dir, { recursive: true });
    // A target with views shoots each one in the same session (so a login happens once); the cover also
    // becomes desktop.png, the ring card. Without views the page is shot as it stands.
    const shots = (target.views ?? [{ slug: 'desktop' }]).map((view) => ({ ...view, file: path.join(dir, `${view.slug}.png`) }));
    for (const view of shots) {
      if (view.prepare) {
        await view.prepare(page);
        await clearOverlays(page, target); // the style tag of the first page does not survive a navigation
      }
      await waitForAssets(page);
      await sleep(500);
      await page.screenshot({ path: view.file, type: 'png' });
      if (view.slug === target.cover) await page.screenshot({ path: path.join(dir, 'desktop.png'), type: 'png' });
      console.log(`ok ${id}/${view.slug} (${viewport.width}x${viewport.height} @${scale}x) -> ${view.file}`);
    }
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ids = options.only ?? Object.keys(TARGETS).filter((id) => !TARGETS[id].skipByDefault && !TARGETS[id].external);
  const unknown = ids.filter((id) => !TARGETS[id]);
  if (unknown.length > 0) throw new Error(`Unknown target: ${unknown.join(', ')}`);
  const external = ids.filter((id) => TARGETS[id].external);
  if (external.length > 0) throw new Error(`${external.join(', ')} come from the project docs: run pnpm images --only ${external.join(',')}.`);

  const failures = [];
  for (const id of ids) {
    const target = TARGETS[id];
    // One browser per target so a flag needed by one site never leaks into the others.
    const browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [...(target.hardwareGl ? [] : CHROMIUM_ARGS), ...(target.chromiumArgs ?? [])],
    });
    try {
      await captureOne({ browser, id, target, url: options.url ?? target.url });
    } catch (error) {
      failures.push(id);
      console.error(`fail ${id}: ${error.message}`);
    } finally {
      await browser.close();
    }
  }
  if (failures.length > 0) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

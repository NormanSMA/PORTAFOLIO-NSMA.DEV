import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ??
  'C:\\Users\\norma\\AppData\\Local\\ms-playwright\\chromium-1234\\chrome-win64\\chrome.exe';

export const RAW_DIR = path.join('.captures', 'raw');

// Widths and base sizes must match src/components/atoms/ProjectImage.tsx.
export const IMAGE_SPECS = {
  desktop: {
    viewport: { width: 1440, height: 900 },
    scale: 2,
    base: { width: 1600, height: 1000 },
    widths: [480, 800, 1200, 1600],
  },
  mobile: {
    viewport: { width: 390, height: 844 },
    scale: 3,
    base: { width: 720, height: 1558 },
    widths: [240, 360, 480, 720],
  },
};

const MOBILE_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36';

// Software WebGL so the 3D map renders without a GPU in headless mode.
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

// settleMs: wait after load for live data and entrance animations to finish.
// hide: extra CSS selectors to remove. click: selectors to click once, if present.
// waitFor: selector that must be visible before capturing. prepare: custom steps per kind.
// skipByDefault: only captured when named with --only.
export const TARGETS = {
  ecopulse: {
    url: 'https://ecopulse-eta-two.vercel.app/',
    kinds: ['desktop', 'mobile'],
    settleMs: 12000,
    prepare: async (page, kind) => {
      await page.getByRole('radio', { name: '3d' }).click({ force: true, timeout: 5000 });
      await sleep(12000);
      if (kind !== 'desktop') return;
      // Close the layer panel and zoom out so the whole globe shows beside the events list.
      await page.getByRole('complementary', { name: 'Controles' }).getByRole('button', { name: 'Cerrar' }).click({ timeout: 5000 });
      await page.mouse.move(720, 480);
      await page.mouse.wheel(0, 800);
      await sleep(12000);
    },
  },
  turno: {
    url: 'https://turno-umber.vercel.app/',
    kinds: ['desktop', 'mobile'],
    settleMs: 4000,
  },
  iuris: {
    url: 'https://iurisnicaragua.com/',
    kinds: ['desktop', 'mobile'],
    settleMs: 4000,
  },
  pantano: {
    url: 'https://hotel-el-pantano.vercel.app/',
    kinds: ['desktop', 'mobile'],
    settleMs: 4000,
  },
  systech: {
    url: 'https://systech.uam.edu.ni/',
    kinds: ['desktop'],
    settleMs: 6000,
  },
  // Needs the demo server running: `pnpm demo` in the ClaudeHub repo (port 4318, fictional data).
  claudehub: {
    url: 'http://127.0.0.1:4318',
    kinds: ['desktop'],
    settleMs: 3000,
    colorScheme: 'dark',
  },
  // Captured after the redesign ships: `pnpm capture --only portfolio --url http://localhost:4173`.
  portfolio: {
    url: 'http://localhost:4173',
    kinds: ['desktop'],
    settleMs: 4000,
    skipByDefault: true,
  },
};

function parseArgs(argv) {
  const options = { only: null, url: null, kind: null };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--only') options.only = argv[++i].split(',');
    else if (argv[i] === '--url') options.url = argv[++i];
    else if (argv[i] === '--kind') options.kind = argv[++i];
  }
  return options;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

async function captureOne({ browser, id, target, kind, url }) {
  const spec = IMAGE_SPECS[kind];
  const context = await browser.newContext({
    viewport: spec.viewport,
    deviceScaleFactor: spec.scale,
    isMobile: kind === 'mobile',
    hasTouch: kind === 'mobile',
    userAgent: kind === 'mobile' ? MOBILE_USER_AGENT : undefined,
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
    if (target.prepare) await target.prepare(page, kind);
    await waitForAssets(page);
    await sleep(500);

    const dir = path.join(RAW_DIR, id);
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${kind}.png`);
    await page.screenshot({ path: file, type: 'png' });
    console.log(`ok ${id}/${kind} -> ${file}`);
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ids = options.only ?? Object.keys(TARGETS).filter((id) => !TARGETS[id].skipByDefault);
  const unknown = ids.filter((id) => !TARGETS[id]);
  if (unknown.length > 0) throw new Error(`Unknown target: ${unknown.join(', ')}`);

  const browser = await chromium.launch({
    executablePath: CHROMIUM_PATH,
    headless: true,
    args: CHROMIUM_ARGS,
  });
  const failures = [];
  try {
    for (const id of ids) {
      const target = TARGETS[id];
      const kinds = options.kind ? [options.kind] : target.kinds;
      for (const kind of kinds) {
        try {
          await captureOne({ browser, id, target, kind, url: options.url ?? target.url });
        } catch (error) {
          failures.push(`${id}/${kind}`);
          console.error(`fail ${id}/${kind}: ${error.message}`);
        }
      }
    }
  } finally {
    await browser.close();
  }
  if (failures.length > 0) process.exitCode = 1;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

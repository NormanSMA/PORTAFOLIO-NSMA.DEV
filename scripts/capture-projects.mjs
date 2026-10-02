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

// Software WebGL so the 3D globe and the portfolio shader render without a GPU in headless mode.
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

// settleMs: wait after load for live data and entrance animations to finish.
// viewport and scale: optional override; the result must stay 16:10 (default 1440x900 at 2x).
// hide: extra CSS selectors to remove. click: selectors to click once, if present.
// waitFor: selector that must be visible before capturing. prepare: custom steps.
// chromiumArgs: extra browser flags for that target only. hardwareGl: skip the SwiftShader flags.
// skipByDefault: needs a local server, so it is captured only when named with --only.
export const TARGETS = {
  ecopulse: {
    url: 'https://ecopulse-eta-two.vercel.app/',
    settleMs: 12000,
    prepare: async (page) => {
      await page.getByRole('radio', { name: '3d' }).click({ force: true, timeout: 5000 });
      await sleep(12000);
      // Close the layer panel and zoom out so the whole globe shows beside the events list.
      await page.getByRole('complementary', { name: 'Controles' }).getByRole('button', { name: 'Cerrar' }).click({ timeout: 5000 });
      await page.mouse.move(720, 480);
      await page.mouse.wheel(0, 800);
      await sleep(12000);
    },
  },
  turno: {
    url: 'https://turno-umber.vercel.app/',
    settleMs: 4000,
  },
  iuris: {
    url: 'https://iurisnicaragua.com/',
    settleMs: 4000,
  },
  pantano: {
    url: 'https://hotel-el-pantano.vercel.app/',
    settleMs: 4000,
  },
  systech: {
    url: 'https://systech.uam.edu.ni/',
    settleMs: 6000,
    // The site links its Unbounded and IBM Plex fonts over http, which Chromium blocks as mixed
    // content; without these flags the page falls back to a system font and looks unfinished.
    chromiumArgs: ['--allow-running-insecure-content', '--disable-web-security'],
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
  },
  // Needs `pnpm build && pnpm preview` in this repo (port 4173, or pass --url for another port).
  portfolio: {
    url: 'http://localhost:4173',
    settleMs: 6000,
    // SwiftShader quantizes the dark glow gradient into visible blocks; the real GPU renders it smooth.
    hardwareGl: true,
    skipByDefault: true,
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
    await waitForAssets(page);
    await sleep(500);

    const dir = path.join(RAW_DIR, id);
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, 'desktop.png');
    await page.screenshot({ path: file, type: 'png' });
    console.log(`ok ${id} (${viewport.width}x${viewport.height} @${scale}x) -> ${file}`);
  } finally {
    await context.close();
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const ids = options.only ?? Object.keys(TARGETS).filter((id) => !TARGETS[id].skipByDefault);
  const unknown = ids.filter((id) => !TARGETS[id]);
  if (unknown.length > 0) throw new Error(`Unknown target: ${unknown.join(', ')}`);

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

import { defineConfig, type Plugin, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

type Res = { setHeader: (name: string, value: string) => void; end: (body?: string) => void };
type Middlewares = { middlewares: { use: (handler: (req: { url?: string }, res: Res, next: () => void) => void) => void } };

// Mirrors the headers of vercel.json so a local preview behaves like production.
// The noindex header stays out: Lighthouse runs against the preview to measure the launched site.
const PREVIEW_HEADERS: Record<string, string> = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-src 'none'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; require-trusted-types-for 'script'; trusted-types default",
  'Cross-Origin-Opener-Policy': 'same-origin',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
};

function securityHeadersPlugin(): Plugin {
  return {
    name: 'preview-security-headers',
    // No return value: Vite would run a returned function as a post middleware.
    configurePreviewServer(server) {
      (server as unknown as Middlewares).middlewares.use((req, res, next) => {
        for (const [name, value] of Object.entries(PREVIEW_HEADERS)) res.setHeader(name, value);
        // Vercel serves the Analytics and Speed Insights scripts; locally an empty script stands in for them.
        if (req.url?.startsWith('/_vercel/')) {
          res.setHeader('Content-Type', 'text/javascript');
          res.end('');
          return;
        }
        next();
      });
    },
  };
}

// The build writes the head of each language in scripts/prerender.mjs. In dev the page gets the Spanish head here.
function devHeadPlugin(): Plugin {
  let server: ViteDevServer;
  return {
    name: 'dev-head',
    apply: 'serve',
    configureServer(devServer) {
      server = devServer;
    },
    async transformIndexHtml(html) {
      const { renderHeadTags } = await server.ssrLoadModule('/src/seo/head.ts');
      return html.replace('<!--app-head-->', renderHeadTags('es'));
    },
  };
}

// KEEP_CONSOLE=1 keeps React's hydration warnings in a production build, to check that both pages hydrate cleanly.
const keepConsole = process.env.KEEP_CONSOLE === '1';

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), securityHeadersPlugin(), devHeadPlugin()],
  server: {
    host: true,
    allowedHosts: ['localhost', '.ngrok-free.dev', '.ngrok.io', '.ngrok-free.app'],
  },
  esbuild: {
    drop: keepConsole ? [] : ['console', 'debugger'],
  },
  ssr: {
    // GSAP and Lenis ship builds that Node cannot import by name, so the server bundle inlines them.
    noExternal: ['gsap', '@gsap/react', 'lenis'],
  },
  build: {
    sourcemap: false,
    minify: keepConsole ? false : 'esbuild',
    rollupOptions: isSsrBuild
      ? undefined
      : {
          output: {
            manualChunks(id: string) {
              // Translations change on their own schedule, so they get a chunk the browser can keep cached.
              if (id.includes('/src/i18n/')) return 'i18n';
              if (!id.includes('node_modules')) return;
              // pnpm nests packages under node_modules/.pnpm/<pkg>@<version>/node_modules/, so keep only the last segment.
              const mod = id.split('node_modules/').pop() || '';
              if (/^(react|react-dom|scheduler)\//.test(mod)) return 'vendor';
              if (/^(gsap|@gsap)\//.test(mod)) return 'ui';
            },
          },
        },
  },
}))

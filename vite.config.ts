import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Small plugin to add security headers during dev/preview server responses.
// This helps when exposing the dev server via ngrok for testing.
function securityHeadersPlugin() {
  type ResWithHeader = { setHeader: (name: string, value: string) => void };

  return {
    name: 'dev-security-headers',
    configureServer(server: { middlewares: { use: (h: unknown) => void } }) {
      server.middlewares.use((_req: unknown, res: ResWithHeader, next: () => void) => {
        try {
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Referrer-Policy', 'no-referrer');
          res.setHeader('Permissions-Policy', 'interest-cohort=()');
          // Note: HSTS should only be sent on HTTPS in production hosting
        } catch {
          /* ignore */
        }
        next();
      });
    },
    configurePreviewServer(server: { middlewares: { use: (h: unknown) => void } }) {
      server.middlewares.use((_req: unknown, res: ResWithHeader, next: () => void) => {
        try {
          res.setHeader('X-Frame-Options', 'DENY');
          res.setHeader('X-Content-Type-Options', 'nosniff');
          res.setHeader('Referrer-Policy', 'no-referrer');
          res.setHeader('Permissions-Policy', 'interest-cohort=()');
        } catch {
          /* ignore */
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
/* eslint-disable @typescript-eslint/no-explicit-any */
export default defineConfig({
  plugins: [react(), (securityHeadersPlugin() as any)],
/* eslint-enable @typescript-eslint/no-explicit-any */
  server: {
    host: true,
    allowedHosts: [
      'localhost',
      '.ngrok-free.dev',
      '.ngrok.io',
      '.ngrok-free.app'
    ]
  }
  ,
  esbuild: {
    drop: ['console', 'debugger'],
  },
  build: {
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Translations change on their own schedule, so they get a chunk the browser can keep cached.
          if (id.includes('/src/i18n/')) return 'i18n';
          if (!id.includes('node_modules')) return;
          // pnpm nests packages under node_modules/.pnpm/<pkg>@<version>/node_modules/, so keep only the last segment.
          const mod = id.split('node_modules/').pop() || '';
          if (/^(react|react-dom|scheduler)\//.test(mod)) return 'vendor';
          if (/^(gsap|@gsap|lenis|lucide-react)\//.test(mod)) return 'ui';
          // Only ever imported dynamically, so it stays out of the initial bundle.
          if (/^ogl\//.test(mod)) return 'webgl';
        },
      },
    },
  }
})

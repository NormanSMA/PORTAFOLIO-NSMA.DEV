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
  build: {
    sourcemap: false,
    // Use esbuild minifier (no extra dependency required) and drop console/debugger.
    minify: 'esbuild'
  }
})

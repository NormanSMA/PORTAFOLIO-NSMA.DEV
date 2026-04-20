import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// Small plugin to add security headers during dev/preview server responses.
// This helps when exposing the dev server via ngrok for testing.
function securityHeadersPlugin(): Plugin {
  return {
    name: 'dev-security-headers',
    configureServer(server) {
      server.middlewares.use((_req, res, next) => {
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
    configurePreviewServer(server) {
      server.middlewares.use((_req, res, next) => {
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
const analyzeBundle = process.env.ANALYZE === 'true' || process.env.BUNDLE_ANALYZE === 'true'

export default defineConfig({
  plugins: [
    react(),
    securityHeadersPlugin(),
    ...(analyzeBundle
      ? [
          visualizer({
            open: true,
            filename: 'dist/stats.html',
            template: 'treemap',
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  server: {
    host: true,
    allowedHosts: ['localhost', '.ngrok-free.dev', '.ngrok.io', '.ngrok-free.app'],
  },
  esbuild: {
    drop: ['console', 'debugger'] as ('console' | 'debugger')[],
  },
  build: {
    sourcemap: analyzeBundle,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})

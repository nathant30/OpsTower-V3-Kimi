import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8000,
    strictPort: true,
    proxy: {
      // Proxy Traksolid API requests to avoid CORS
      '/traksolid-proxy': {
        target: 'https://hk-open.tracksolidpro.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/traksolid-proxy\/?/, '/route/rest'),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('[Vite Proxy] Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('[Vite Proxy] Request:', req.method, req.url, '->', proxyReq.path);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Vite Proxy] Response:', proxyRes.statusCode, req.url);
            // Log response body for debugging
            let body = '';
            proxyRes.on('data', (chunk) => {
              body += chunk;
            });
            proxyRes.on('end', () => {
              console.log('[Vite Proxy] Response body:', body.substring(0, 500));
            });
          });
        },
      },
    },
  },
});

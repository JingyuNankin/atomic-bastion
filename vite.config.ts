import { defineConfig } from 'vite';

export default defineConfig({
  root: 'client',
  base: './',
  publicDir: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    assetsDir: 'assets',
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    fs: {
      allow: ['..'],
    },
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  test: {
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.js'],
  },
});

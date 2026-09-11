/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is configurable so the same build works on GitHub Pages
// (https://<user>.github.io/<repo>/) as well as Netlify/Vercel (root domain).
// Set SAATHISETU_BASE=/SaathiSetu/ before `npm run build` for GitHub Pages.
const base = process.env.SAATHISETU_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 900,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: false,
    include: ['src/tests/**/*.test.{ts,tsx}'],
  },
});

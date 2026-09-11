/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.SAATHISETU_BASE ?? '/';
if (!base.startsWith('/') || !base.endsWith('/')) {
  throw new Error('SAATHISETU_BASE must start and end with a slash');
}

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

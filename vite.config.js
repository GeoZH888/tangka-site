import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base path matters: this site lives behind a Netlify proxy at
// https://david-zhongwen.net/feiyi/tangka/ — assets and routes
// must resolve correctly under that prefix.
//
// Set base via env so local dev (BASE='/') and production
// (BASE='/feiyi/tangka/') stay clean.
const BASE = process.env.VITE_BASE_PATH || '/feiyi/tangka/';

export default defineConfig({
  plugins: [react()],
  base: BASE,
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 800,
  },
});

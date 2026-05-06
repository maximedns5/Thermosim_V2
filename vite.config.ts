import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Thermosim_V2/' : '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  worker: {
    format: 'es',
  },
  build: {
    target: 'esnext',
  },
  optimizeDeps: {
    include: [
      'use-sync-external-store/shim/with-selector',
      'use-sync-external-store/shim',
      'zustand',
      'zustand/middleware/immer',
    ],
  },
});

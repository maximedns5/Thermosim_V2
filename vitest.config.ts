import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/tests/**/*.test.ts'],
    pool: 'forks',
    isolate: false,
    maxWorkers: 1,
    server: {
      deps: {
        // Prevent Module Runner from hanging on heavy 3D/React packages
        // (not imported by engine test files)
        external: [
          'three',
          '@react-three/fiber',
          '@react-three/drei',
          '@react-three/postprocessing',
          'react',
          'react-dom',
          'framer-motion',
        ],
        inline: [/zustand/, /immer/, /comlink/],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'tests/**/*.{test,spec}.{ts,tsx}', '*.{test,spec}.ts'],
    pool: 'threads',
    testTimeout: 30000,
    hookTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/services/**/*.ts', 'src/components/**/*.tsx'],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': '.',
    },
  },
});

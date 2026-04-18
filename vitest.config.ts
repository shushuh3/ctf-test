import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/features/**', 'src/core/rbac/**'],
      exclude: ['**/*.test.{ts,tsx}', '**/ui/**', '**/schemas/**', '**/index.ts'],
      thresholds: {
        lines: 65,
        statements: 65,
        functions: 65,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    clearMocks: true,
    setupFiles: ['test/setup.ts'],
    typecheck: {
      include: ['test/**/*.test-d.ts'],
      tsconfig: 'tsconfig.test.json',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['test/helpers/**'],
    },
  },
});

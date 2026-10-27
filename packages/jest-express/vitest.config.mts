import { defineConfig } from 'vitest/config';

// Only for the type tests (`pnpm test:types`); the runtime suite runs under real Jest.
export default defineConfig({
  test: {
    include: [],
    typecheck: {
      include: ['test/**/*.test-d.ts'],
      tsconfig: 'tsconfig.test.json',
    },
  },
});

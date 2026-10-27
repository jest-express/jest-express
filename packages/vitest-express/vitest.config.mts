import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
    typecheck: {
      include: ['test/**/*.test-d.ts'],
      tsconfig: 'tsconfig.test.json',
    },
  },
});

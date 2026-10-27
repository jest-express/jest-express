import { defineConfig } from 'tsdown';

// ESM only: Vitest throws on `require('vitest')`, so a CommonJS build could never load.
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: 'esm',
  platform: 'node',
  target: 'node22',
  dts: true,
  sourcemap: true,
  clean: true,
});

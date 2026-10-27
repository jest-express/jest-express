import { defineConfig, type UserConfig } from 'tsdown';

const shared: UserConfig = {
  platform: 'node',
  target: 'node22',
  dts: true,
  sourcemap: true,
};

export default defineConfig([
  // ESM: default export plus named exports.
  {
    ...shared,
    entry: { index: 'src/index.ts' },
    format: 'esm',
    clean: true,
  },
  // CJS: `module.exports` is the callable default export (see src/index.cjs.ts).
  {
    ...shared,
    entry: { index: 'src/index.cjs.ts' },
    format: 'cjs',
    clean: false,
  },
]);

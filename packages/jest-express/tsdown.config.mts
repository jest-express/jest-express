import { defineConfig, type UserConfig } from 'tsdown';

const shared: UserConfig = {
  platform: 'node',
  target: 'node22',
  sourcemap: true,
};

export default defineConfig([
  // ESM: default export plus the core's named exports.
  {
    ...shared,
    entry: { index: 'src/index.ts' },
    format: 'esm',
    dts: true,
    clean: true,
  },
  // CJS: `module.exports` is the callable default export (see src/index.cjs.ts).
  {
    ...shared,
    entry: { index: 'src/index.cjs.ts' },
    format: 'cjs',
    dts: false,
    clean: false,
    copy: [{ from: 'src/index.d.cts', to: 'dist' }],
  },
]);

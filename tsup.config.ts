import { defineConfig } from 'tsup';

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  entry: ['src/index.ts', 'src/helper/index.ts'],
  format: ['cjs'],
  outDir: 'dist/cjs',
  target: 'esnext',
  dts: true,
  sourcemap: true,
});

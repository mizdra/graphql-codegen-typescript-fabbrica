import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/helper/index.ts'],
  format: ['cjs'],
  outDir: 'dist/cjs',
  target: 'esnext',
  dts: true,
  sourcemap: true,
});

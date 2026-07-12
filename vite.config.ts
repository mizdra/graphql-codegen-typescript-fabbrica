import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    watch: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e-esm',
          include: ['e2e/01-esm/**/*.e2e.ts'],
          globalSetup: ['./e2e/vitest-setup/esm.ts'],
          // Check type-level assertions (`expectTypeOf`, `@ts-expect-error`) in the test files.
          typecheck: {
            enabled: true,
            include: ['e2e/01-esm/**/*.e2e.ts'],
            tsconfig: './e2e/01-esm/tsconfig.json',
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e-browser',
          include: ['e2e/02-browser/**/*.e2e.ts'],
          globalSetup: ['./e2e/vitest-setup/browser.ts'],
          // Check type-level assertions (`expectTypeOf`, `@ts-expect-error`) in the test files.
          typecheck: {
            enabled: true,
            include: ['e2e/02-browser/**/*.e2e.ts'],
            tsconfig: './e2e/02-browser/tsconfig.json',
          },
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            headless: true,
          },
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e-composite',
          include: ['e2e/composite.e2e.ts'],
          globalSetup: ['./e2e/vitest-setup/composite.ts'],
          // The test runs `npm install`, which can take a while.
          testTimeout: 120_000,
        },
      },
    ],
  },
});

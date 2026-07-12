import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
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
        },
      },
      {
        extends: true,
        test: {
          name: 'e2e-browser',
          include: ['e2e/02-browser/**/*.e2e.ts'],
          globalSetup: ['./e2e/vitest-setup/browser.ts'],
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

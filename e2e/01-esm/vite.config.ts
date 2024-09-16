import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e.ts'],
    reporters: process.env['GITHUB_ACTIONS'] ? ['default', 'github-actions'] : 'default',
  },
});

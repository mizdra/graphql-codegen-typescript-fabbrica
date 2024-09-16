// @ts-check
import mizdra from '@mizdra/eslint-config-mizdra';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['dist', 'e2e'] },
  ...mizdra.baseConfigs,
  ...mizdra.typescriptConfigs,
  ...mizdra.nodeConfigs,
  {
    files: ['**/*.{js,jsx,mjs,cjs}', '**/*.{ts,tsx,cts,mts}'],
    rules: {
      'n/no-extraneous-dependencies': 'off', // false positive
    },
  },
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
    },
  },
  mizdra.prettierConfig,
];

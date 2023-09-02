'use strict';
const { join } = require('node:path');

/** @type {import('eslint').Linter.BaseConfig} */
module.exports = {
  root: true,
  extends: ['@mizdra/mizdra', '@mizdra/mizdra/+node', '@mizdra/mizdra/+prettier'],
  parserOptions: {
    ecmaVersion: 2022,
  },
  reportUnusedDisableDirectives: true,
  env: {
    es2022: true,
    node: true,
  },
  rules: {
    'no-use-before-define': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        includeTypes: true,
        packageDir: [__dirname, join(__dirname, 'e2e')],
      },
    ],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.cts', '*.mts'],
      extends: ['@mizdra/mizdra/+typescript', '@mizdra/mizdra/+prettier'],
      rules: {
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              '{}': false,
            },
          },
        ],
      },
    },
  ],
};

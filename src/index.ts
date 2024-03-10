// MEMO: The tests for this module are covered by `e2e/*.e2e.ts`.

import { type PluginFunction } from '@graphql-codegen/plugin-helpers';
import { generateCode } from './code-generator.js';
import { normalizeConfig, validateConfig } from './config.js';
import { getTypeInfos } from './schema-scanner.js';

export const plugin: PluginFunction = (schema, _documents, config, _info) => {
  validateConfig(config);

  const normalizedConfig = normalizeConfig(config);
  const typeInfos = getTypeInfos(normalizedConfig, schema);
  const code = generateCode(normalizedConfig, typeInfos);
  return code;
};

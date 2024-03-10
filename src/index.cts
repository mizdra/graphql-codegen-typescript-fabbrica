// MEMO: The tests for this module are covered by `e2e/*.e2e.ts`.

import { type CodegenPlugin } from '@graphql-codegen/plugin-helpers';

const plugin: CodegenPlugin = {
  async plugin(schema, _documents, config, _info) {
    const { generateCode } = await import('./code-generator.js');
    const { normalizeConfig, validateConfig } = await import('./config.js');
    const { getTypeInfos } = await import('./schema-scanner.js');

    // @ts-expect-error Maybe... This is a bug of `typescript`.
    validateConfig(config);

    const normalizedConfig = normalizeConfig(config);
    const typeInfos = getTypeInfos(normalizedConfig, schema);
    const code = generateCode(normalizedConfig, typeInfos);
    return code;
  },
};

export = plugin;

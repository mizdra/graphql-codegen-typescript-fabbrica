// MEMO: The tests for this module are covered by `e2e/*.e2e.ts`.

import type { CodegenPlugin } from '@graphql-codegen/plugin-helpers';
import { generateCode } from './code-generator.js';
import { validateOptions } from './option.js';
import { getTypeInfos } from './schema-scanner.js';

const plugin: CodegenPlugin = {
  plugin(schema, _documents, config, _info) {
    validateOptions(config);
    const typeInfos = getTypeInfos(schema);
    const code = generateCode(config, typeInfos);
    return code;
  },
};

export = plugin;

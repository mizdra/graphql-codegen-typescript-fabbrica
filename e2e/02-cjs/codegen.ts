import { CodegenConfig } from '@graphql-codegen/cli';
import { defaultFabbricaPluginConfig, defaultTypeScriptPluginConfig } from '../util/config.cjs';

const config: CodegenConfig = {
  generates: {
    '__generated__/1-basic/types.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
        nonOptionalTypename: true,
        skipTypename: true,
      },
    },
    './__generated__/1-basic/fabbrica.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        skipTypename: true,
      },
    },
  },
};

module.exports = config;

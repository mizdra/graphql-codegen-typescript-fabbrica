import type { CodegenConfig } from '@graphql-codegen/cli';
import { defaultFabbricaPluginConfig, defaultTypeScriptPluginConfig, fabbricaPlugin } from '../util/config.js';

const config: CodegenConfig = {
  generates: {
    '__generated__/1-basic/types.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
        skipTypename: true,
      },
    },
    './__generated__/1-basic/fabbrica.ts': {
      schema: './1-basic-schema.graphql',
      plugins: [fabbricaPlugin],
      config: {
        ...defaultFabbricaPluginConfig,
        skipTypename: true,
      },
    },
  },
};

export default config;

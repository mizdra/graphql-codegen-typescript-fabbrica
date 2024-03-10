import { CodegenConfig } from '@graphql-codegen/cli';

const defaultTypeScriptPluginConfig = {
  nonOptionalTypename: true,
  enumsAsTypes: true,
  avoidOptionals: true,
  skipTypename: true,
};
const defaultFabbricaPluginConfig = {
  typesFile: './types.js',
  skipTypename: true,
};

const config: CodegenConfig = {
  generates: {
    '__generated__/1-basic/types.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
      },
    },
    './__generated__/1-basic/fabbrica.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
      },
    },
  },
};

export default config;

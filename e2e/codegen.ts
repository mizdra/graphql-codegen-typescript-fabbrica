import { CodegenConfig } from '@graphql-codegen/cli';

const defaultTypeScriptPluginConfig = {
  nonOptionalTypename: true,
  enumsAsTypes: true,
  avoidOptionals: true,
  skipTypename: true,
};
const defaultFabbricaPluginConfig = {
  typesFile: './types',
  skipTypename: true,
};

const config: CodegenConfig = {
  generates: {
    '__generated__/1-basic/types.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
        scalars: {
          CustomScalarTest_CustomScalar1: 'Date',
          CustomScalarTest_CustomScalar2: '{ field: string }',
        },
        namingConvention: {
          typeNames: './my-naming-fn.js',
        },
      },
    },
    './__generated__/1-basic/fabbrica.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        namingConvention: {
          typeNames: './my-naming-fn.js',
        },
      },
    },
    '__generated__/2-typesPrefix/types.ts': {
      schema: './2-typesPrefix-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
        typesPrefix: 'Prefix',
      },
    },
    './__generated__/2-typesPrefix/fabbrica.ts': {
      schema: './2-typesPrefix-schema.graphql',
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        typesPrefix: 'Prefix',
      },
    },
    '__generated__/3-typesSuffix/types.ts': {
      schema: './3-typesSuffix-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
        typesSuffix: 'Suffix',
      },
    },
    './__generated__/3-typesSuffix/fabbrica.ts': {
      schema: './3-typesSuffix-schema.graphql',
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        typesSuffix: 'Suffix',
      },
    },
    '__generated__/4-non-optional-fields/types.ts': {
      schema: './4-non-optional-fields-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
      },
    },
    './__generated__/4-non-optional-fields/fabbrica.ts': {
      schema: './4-non-optional-fields-schema.graphql',
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        nonOptionalFields: true,
      },
    },
  },
};

module.exports = config;

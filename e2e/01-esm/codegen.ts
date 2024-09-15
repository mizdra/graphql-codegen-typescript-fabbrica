import { CodegenConfig } from '@graphql-codegen/cli';
import { defaultFabbricaPluginConfig, defaultTypeScriptPluginConfig } from '../util/config.cjs';

const config: CodegenConfig = {
  generates: {
    '__generated__/1-basic/types.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['typescript'],
      config: {
        ...defaultTypeScriptPluginConfig,
        skipTypename: true,
        scalars: {
          CustomScalarTest_CustomScalar1: 'Date',
          CustomScalarTest_CustomScalar2: '{ field: string }',
        },
        namingConvention: {
          typeNames: './my-naming-fn.cjs',
        },
      },
    },
    './__generated__/1-basic/fabbrica.ts': {
      schema: './1-basic-schema.graphql',
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        skipTypename: true,
        namingConvention: {
          typeNames: './my-naming-fn.cjs',
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
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
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
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
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
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
      config: {
        ...defaultFabbricaPluginConfig,
        nonOptionalDefaultFields: true,
      },
    },
  },
};

export default config;

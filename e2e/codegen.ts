import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  config: {
    namingConvention: {
      typeNames: './my-naming-fn.js',
    },
  },
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      config: {
        nonOptionalTypename: true,
        enumsAsTypes: true,
        avoidOptionals: true,
        skipTypename: true,
        scalars: {
          CustomScalarTest_CustomScalar1: 'Date',
          CustomScalarTest_CustomScalar2: '{ field: string }',
        },
      },
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        typesFile: './types',
        skipTypename: true,
      },
    },
  },
};

module.exports = config;

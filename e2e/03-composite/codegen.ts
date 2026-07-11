import type { CodegenConfig } from '@graphql-codegen/cli';
import { defaultFabbricaPluginConfig, defaultTypeScriptPluginConfig } from '../util/config.cjs';

const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    // The files other than those matching includes cannot be read when using `compisite`.
    // Therefore, fabbrica artifacts are also output under `src/`.
    'src/__generated__/types.ts': {
      plugins: ['typescript'],
      config: defaultTypeScriptPluginConfig,
    },
    'src/__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-codegen-typescript-fabbrica'],
      config: defaultFabbricaPluginConfig,
    },
  },
};

export default config;

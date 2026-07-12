import type { CodegenConfig } from '@graphql-codegen/cli';
import { defaultFabbricaPluginConfig, defaultTypeScriptPluginConfig, fabbricaPlugin } from '../util/config.js';

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
      // NOTE: The plugin copied into this project's node_modules by `install-links=true`
      // cannot be used at codegen time. It brings its own `graphql` instance, which
      // conflicts with the one used by the codegen CLI hoisted to the repository root.
      // The type-checking of the generated code still uses the copied package.
      plugins: [fabbricaPlugin],
      config: defaultFabbricaPluginConfig,
    },
  },
};

export default config;

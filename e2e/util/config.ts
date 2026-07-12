// The path to the local fabbrica plugin, relative to the directory where the codegen CLI runs.
// NOTE: The plugin cannot be referenced by its package name (`@mizdra/graphql-codegen-typescript-fabbrica`)
// because the codegen CLI resolves plugin names via node_modules, which does not support
// Node.js package self-reference.
export const fabbricaPlugin = '../../dist/esm/index.js';
export const defaultTypeScriptPluginConfig = {
  enumsAsTypes: true, // required
  avoidOptionals: true, // required
};
export const defaultFabbricaPluginConfig = {
  typesFile: './types.js', // required
};

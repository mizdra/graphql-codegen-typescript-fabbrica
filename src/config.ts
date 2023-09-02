export type RawConfig = {
  typesFile: string;
  skipTypename?: boolean;
  // TODO: support addIsAbstractType
};

export type Config = {
  typesFile: string;
  skipTypename: boolean;
  // TODO: support addIsAbstractType
};

export function validateConfig(rawConfig: unknown): asserts rawConfig is RawConfig {
  if (typeof rawConfig !== 'object' || rawConfig === null) {
    throw new Error('`options` must be an object');
  }
  if (!('typesFile' in rawConfig)) {
    throw new Error('`option.typesFile` is required');
  }
  if (typeof rawConfig['typesFile'] !== 'string') {
    throw new Error('`options.typesFile` must be a string');
  }
  if ('skipTypename' in rawConfig && typeof rawConfig['skipTypename'] !== 'boolean') {
    throw new Error('`options.skipTypename` must be a boolean');
  }
}

export function normalizeConfig(rawConfig: RawConfig): Config {
  return {
    typesFile: rawConfig.typesFile,
    skipTypename: rawConfig.skipTypename ?? false,
  };
}

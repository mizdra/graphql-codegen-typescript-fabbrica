export type RawConfig = {
  typesFile: string;
  // TODO: support skipTypename, addIsAbstractType
};

export type Config = {
  typesFile: string;
  // TODO: support skipTypename, addIsAbstractType
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
}

export function normalizeConfig(rawConfig: RawConfig): Config {
  return {
    typesFile: rawConfig.typesFile,
  };
}

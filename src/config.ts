import { ConvertFn, RawTypesConfig, convertFactory } from '@graphql-codegen/visitor-plugin-common';

export type RawConfig = {
  typesFile: string;
  skipTypename?: RawTypesConfig['skipTypename'];
  skipIsAbstractType?: boolean | undefined;
  namingConvention?: RawTypesConfig['namingConvention'];
  typesPrefix?: RawTypesConfig['typesPrefix'];
  typesSuffix?: RawTypesConfig['typesSuffix'];
  // TODO: support addIsAbstractType
};

export type Config = {
  typesFile: string;
  skipTypename: Exclude<RawTypesConfig['skipTypename'], undefined>;
  skipIsAbstractType: boolean;
  typesPrefix: Exclude<RawTypesConfig['typesPrefix'], undefined>;
  typesSuffix: Exclude<RawTypesConfig['typesSuffix'], undefined>;
  convert: ConvertFn;
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
  if ('skipIsAbstractType' in rawConfig && typeof rawConfig['skipIsAbstractType'] !== 'boolean') {
    throw new Error('`options.skipIsAbstractType` must be a boolean');
  }
  if ('typesPrefix' in rawConfig && typeof rawConfig['typesPrefix'] !== 'string') {
    throw new Error('`options.typesPrefix` must be a string');
  }
  if ('typesSuffix' in rawConfig && typeof rawConfig['typesSuffix'] !== 'string') {
    throw new Error('`options.typesSuffix` must be a string');
  }
}

export function normalizeConfig(rawConfig: RawConfig): Config {
  return {
    typesFile: rawConfig.typesFile,
    skipTypename: rawConfig.skipTypename ?? false,
    skipIsAbstractType: rawConfig.skipIsAbstractType ?? true,
    typesPrefix: rawConfig.typesPrefix ?? '',
    typesSuffix: rawConfig.typesSuffix ?? '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    convert: convertFactory(rawConfig as any),
  };
}

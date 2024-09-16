import { randomInt } from 'node:crypto';

import { convertFactory } from '@graphql-codegen/visitor-plugin-common';

import { Config } from '../config.js';

export function oneOf<const T>(items: T[]): T {
  return items[randomInt(items.length)]!;
}

export function fakeConfig(args: Partial<Config> = {}): Config {
  return {
    typesFile: './types',
    skipTypename: true,
    skipIsAbstractType: true,
    nonOptionalDefaultFields: false,
    typesPrefix: '',
    typesSuffix: '',
    convert: convertFactory({}),
    ...args,
  };
}

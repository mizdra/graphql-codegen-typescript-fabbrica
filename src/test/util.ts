import { randomInt } from 'node:crypto';
import { convertFactory } from '@graphql-codegen/visitor-plugin-common';
import { Config } from '../config.js';

export function oneOf<const T>(items: T[]): T {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return items[randomInt(items.length)]!;
}

export function fakeConfig(args: Partial<Config> = {}): Config {
  return {
    typesFile: './types',
    skipTypename: false,
    skipAbstractType: true,
    typesPrefix: '',
    typesSuffix: '',
    convert: convertFactory({}),
    ...args,
  };
}

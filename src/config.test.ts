import { describe, expect, it } from 'vitest';
import { validateConfig } from './config.js';
import { oneOf } from './test/util.js';

describe('validateConfig', () => {
  it('options must be an object', () => {
    expect(() => validateConfig(1)).toThrow('`options` must be an object');
    expect(() => validateConfig(null)).toThrow('`options` must be an object');
  });
  it('typesFile', () => {
    expect(() => validateConfig({ typesFile: './types' })).not.toThrow();
    expect(() => validateConfig({})).toThrow('`option.typesFile` is required');
    expect(() => validateConfig({ typesFile: 1 })).toThrow('`options.typesFile` must be a string');
  });
  it('skipTypename', () => {
    expect(() => validateConfig({ typesFile: './types', skipTypename: oneOf([true, false]) })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types', skipTypename: 1 })).toThrow(
      '`options.skipTypename` must be a boolean',
    );
  });
  it('skipIsAbstractType', () => {
    expect(() => validateConfig({ typesFile: './types', skipIsAbstractType: oneOf([true, false]) })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types', skipIsAbstractType: 1 })).toThrow(
      '`options.skipIsAbstractType` must be a boolean',
    );
  });
  it('nonOptionalDefaultFields', () => {
    expect(() =>
      validateConfig({ typesFile: './types', nonOptionalDefaultFields: oneOf([true, false]) }),
    ).not.toThrow();
    expect(() => validateConfig({ typesFile: './types' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types', nonOptionalDefaultFields: 1 })).toThrow(
      '`options.nonOptionalDefaultFields` must be a boolean',
    );
  });
  it('typesPrefix', () => {
    expect(() => validateConfig({ typesFile: './types', typesPrefix: 'Prefix' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types', typesPrefix: 1 })).toThrow(
      '`options.typesPrefix` must be a string',
    );
  });
  it('typesSuffix', () => {
    expect(() => validateConfig({ typesFile: './types', typesSuffix: 'Suffix' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types' })).not.toThrow();
    expect(() => validateConfig({ typesFile: './types', typesSuffix: 1 })).toThrow(
      '`options.typesSuffix` must be a string',
    );
  });
});

import { describe, expect, it } from 'vitest';
import { validateConfig } from './config.js';

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
});

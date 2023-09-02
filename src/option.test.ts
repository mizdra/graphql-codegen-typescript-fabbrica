import { describe, expect, it } from 'vitest';
import { validateOptions } from './option.js';

describe('validateOptions', () => {
  it('options must be an object', () => {
    expect(() => validateOptions(1)).toThrow('`options` must be an object');
    expect(() => validateOptions(null)).toThrow('`options` must be an object');
  });
  it('typesFile', () => {
    expect(() => validateOptions({ typesFile: './types' })).not.toThrow();
    expect(() => validateOptions({})).toThrow('`option.typesFile` is required');
    expect(() => validateOptions({ typesFile: 1 })).toThrow('`options.typesFile` must be a string');
  });
});

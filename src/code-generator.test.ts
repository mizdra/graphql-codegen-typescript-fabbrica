import { describe, expect, it } from 'vitest';
import { generateCode } from './code-generator.js';
import { Options } from './option.js';
import { TypeInfo } from './schema-scanner.js';

describe('generateCode', () => {
  it('generates code', () => {
    const options: Options = {
      typesFile: './types',
    };
    const typeInfos: TypeInfo[] = [
      { name: 'Book', fieldNames: ['id', 'title', 'author'] },
      { name: 'Author', fieldNames: ['id', 'name', 'books'] },
    ];
    const actual = generateCode(options, typeInfos);
    expect(actual).toMatchSnapshot();
  });
});

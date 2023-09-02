import { describe, expect, it } from 'vitest';
import { generateCode } from './code-generator.js';
import { Config } from './config.js';
import { TypeInfo } from './schema-scanner.js';
import { oneOf } from './test/util.js';

describe('generateCode', () => {
  it('generates code', () => {
    const config: Config = {
      typesFile: './types',
      skipTypename: oneOf([true, false]),
    };
    const typeInfos: TypeInfo[] = [
      { name: 'Book', fieldNames: ['id', 'title', 'author'] },
      { name: 'Author', fieldNames: ['id', 'name', 'books'] },
    ];
    const actual = generateCode(config, typeInfos);
    expect(actual).toMatchSnapshot();
  });
});

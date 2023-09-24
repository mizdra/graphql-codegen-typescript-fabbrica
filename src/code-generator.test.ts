import { describe, expect, it } from 'vitest';
import { generateCode } from './code-generator.js';
import { TypeInfo } from './schema-scanner.js';
import { fakeConfig } from './test/util';
import { oneOf } from './test/util.js';

describe('generateCode', () => {
  it('generates code', () => {
    const config = fakeConfig({
      typesFile: './types',
      skipTypename: oneOf([true, false]),
    });
    const typeInfos: TypeInfo[] = [
      {
        name: 'Book',
        fields: [
          { name: 'id', typeString: 'string' },
          { name: 'title', typeString: 'string' },
          { name: 'author', typeString: 'OptionalAuthor' },
        ],
      },
      {
        name: 'Author',
        fields: [
          { name: 'id', typeString: 'string' },
          { name: 'name', typeString: 'string' },
          { name: 'books', typeString: 'Book[]' },
        ],
      },
    ];
    const actual = generateCode(config, typeInfos);
    expect(actual).toMatchSnapshot();
  });
});

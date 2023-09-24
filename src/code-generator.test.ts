import { transformComment } from '@graphql-codegen/visitor-plugin-common';
import { describe, expect, it } from 'vitest';
import { generateCode, generateOptionalTypeDefinitionCode } from './code-generator.js';
import { TypeInfo } from './schema-scanner.js';
import { fakeConfig } from './test/util';
import { oneOf } from './test/util.js';

describe('generateOptionalTypeDefinitionCode', () => {
  it('generates description comment', () => {
    const typeInfo: TypeInfo = {
      name: 'Book',
      fields: [
        { name: 'id', typeString: 'string' },
        { name: 'title', typeString: 'string', comment: transformComment('The book title') },
      ],
      comment: transformComment('The book'),
    };
    const actual = generateOptionalTypeDefinitionCode(typeInfo);
    expect(actual).toMatchInlineSnapshot(`
      "/** The book */
      export type OptionalBook = {
        id: string;
        /** The book title */
        title: string;
      };
      "
    `);
  });
});

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

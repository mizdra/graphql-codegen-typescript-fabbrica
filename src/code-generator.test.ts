import { transformComment } from '@graphql-codegen/visitor-plugin-common';
import { describe, expect, it } from 'vitest';
import { generateCode, generateOptionalTypeDefinitionCode } from './code-generator.js';
import type { TypeInfo } from './schema-scanner.js';
import { fakeConfig, oneOf } from './test/util.js';

describe('generateOptionalTypeDefinitionCode', () => {
  it('generates description comment', () => {
    const typeInfo1: TypeInfo = {
      type: 'object',
      name: 'Book',
      fields: [
        { name: 'id', typeString: 'string | undefined' },
        { name: 'title', typeString: 'string | undefined', comment: transformComment('The book title') },
      ],
      comment: transformComment('The book'),
    };
    expect(generateOptionalTypeDefinitionCode(typeInfo1)).toMatchInlineSnapshot(`
      "/** The book */
      export type OptionalBook = {
        id?: string | undefined;
        /** The book title */
        title?: string | undefined;
      };
      "
    `);
    const typeInfo2: TypeInfo = {
      type: 'abstract',
      name: 'Node',
      possibleTypes: ['Book', 'Author'],
      comment: transformComment('The node'),
    };
    expect(generateOptionalTypeDefinitionCode(typeInfo2)).toMatchInlineSnapshot(`
      "/** The node */
      export type OptionalNode = OptionalBook | OptionalAuthor;
      "
    `);
  });
  it('generates `never` for abstract types with no possible types', () => {
    // e.g. an interface that no object type implements, or a union with no members
    const typeInfo: TypeInfo = {
      type: 'abstract',
      name: 'EmptyInterface',
      possibleTypes: [],
    };
    expect(generateOptionalTypeDefinitionCode(typeInfo)).toMatchInlineSnapshot(`
      "export type OptionalEmptyInterface = never;
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
        type: 'object',
        name: 'Book',
        fields: [
          { name: 'id', typeString: 'string | undefined' },
          { name: 'title', typeString: 'string | undefined' },
          { name: 'author', typeString: 'OptionalAuthor | undefined' },
        ],
      },
      {
        type: 'object',
        name: 'Author',
        fields: [
          { name: 'id', typeString: 'string | undefined' },
          { name: 'name', typeString: 'string | undefined' },
          { name: 'books', typeString: 'Book[] | undefined' },
        ],
      },
      {
        type: 'abstract',
        name: 'Node',
        possibleTypes: ['Book', 'Author'],
      },
    ];
    const actual = generateCode(config, typeInfos);
    expect(actual).toMatchSnapshot();
  });
  it('generates code when empty typeInfos is passed', () => {
    const config = fakeConfig({
      typesFile: './types',
      skipTypename: oneOf([true, false]),
    });
    const typeInfos: TypeInfo[] = [];
    const actual = generateCode(config, typeInfos);
    expect(actual).toMatchSnapshot();
  });
});

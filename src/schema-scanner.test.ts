// NOTE: To avoid `Cannot use GraphQLSchema xxx from another module or realm.`, import from 'graphql/index.js' instead of 'graphql'.
// ref: https://github.com/graphql/graphql-js/issues/1479
import { buildSchema } from 'graphql/index.js';
import { describe, expect, it } from 'vitest';
import { Config } from './config.js';
import { getTypeInfos } from './schema-scanner.js';
import { fakeConfig } from './test/util.js';

describe('getTypeInfos', () => {
  it('returns typename and field names', () => {
    const schema = buildSchema(`
      type Book {
        id: ID!
        title: String!
        author: Author!
      }
      type Author {
        id: ID!
        name: String!
        books: [Book!]!
      }
    `);
    const config: Config = fakeConfig();
    expect(getTypeInfos(config, schema)).toMatchInlineSnapshot(`
      [
        {
          "comment": undefined,
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Book'",
            },
            {
              "comment": undefined,
              "name": "id",
              "typeString": "Book['id'] | undefined",
            },
            {
              "comment": undefined,
              "name": "title",
              "typeString": "Book['title'] | undefined",
            },
            {
              "comment": undefined,
              "name": "author",
              "typeString": "OptionalAuthor | undefined",
            },
          ],
          "name": "Book",
        },
        {
          "comment": undefined,
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Author'",
            },
            {
              "comment": undefined,
              "name": "id",
              "typeString": "Author['id'] | undefined",
            },
            {
              "comment": undefined,
              "name": "name",
              "typeString": "Author['name'] | undefined",
            },
            {
              "comment": undefined,
              "name": "books",
              "typeString": "OptionalBook[] | undefined",
            },
          ],
          "name": "Author",
        },
      ]
    `);
  });
  it('argument', () => {
    const schema = buildSchema(`
      type Argument {
        field(arg: String!): String!
      }
    `);
    const config: Config = fakeConfig();
    expect(getTypeInfos(config, schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'Argument'",
          },
          {
            "comment": undefined,
            "name": "field",
            "typeString": "Argument['field'] | undefined",
          },
        ],
        "name": "Argument",
      }
    `);
  });
  it('nullable', () => {
    const schema = buildSchema(`
      type Type {
        field1: String
        field2: [String]
        field3: SubType
        field4: [SubType]
      }
      type SubType {
        field: String!
      }
    `);
    const config: Config = fakeConfig();
    expect(getTypeInfos(config, schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'Type'",
          },
          {
            "comment": undefined,
            "name": "field1",
            "typeString": "Type['field1'] | undefined",
          },
          {
            "comment": undefined,
            "name": "field2",
            "typeString": "Type['field2'] | undefined",
          },
          {
            "comment": undefined,
            "name": "field3",
            "typeString": "Maybe<OptionalSubType> | undefined",
          },
          {
            "comment": undefined,
            "name": "field4",
            "typeString": "Maybe<Maybe<OptionalSubType>[]> | undefined",
          },
        ],
        "name": "Type",
      }
    `);
  });
  it('interface', () => {
    const schema = buildSchema(`
      interface Interface1 {
        fieldA: String!
      }
      interface Interface2 {
        fieldB: String!
      }
      type ImplementingType implements Interface1 & Interface2 {
        fieldA: String!
        fieldB: String!
      }
    `);
    expect(getTypeInfos(fakeConfig({ skipIsAbstractType: true }), schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'ImplementingType'",
          },
          {
            "comment": undefined,
            "name": "fieldA",
            "typeString": "ImplementingType['fieldA'] | undefined",
          },
          {
            "comment": undefined,
            "name": "fieldB",
            "typeString": "ImplementingType['fieldB'] | undefined",
          },
        ],
        "name": "ImplementingType",
      }
    `);
    expect(getTypeInfos(fakeConfig({ skipIsAbstractType: false }), schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'ImplementingType'",
          },
          {
            "name": "__isInterface1",
            "typeString": "'ImplementingType'",
          },
          {
            "name": "__isInterface2",
            "typeString": "'ImplementingType'",
          },
          {
            "comment": undefined,
            "name": "fieldA",
            "typeString": "ImplementingType['fieldA'] | undefined",
          },
          {
            "comment": undefined,
            "name": "fieldB",
            "typeString": "ImplementingType['fieldB'] | undefined",
          },
        ],
        "name": "ImplementingType",
      }
    `);
  });
  it('union', () => {
    const schema = buildSchema(`
      union Union1 = Member1 | Member2
      union Union2 = Member1 | Member2
      type Member1 {
        field1: String!
      }
      type Member2 {
        field2: String!
      }
    `);
    expect(getTypeInfos(fakeConfig({ skipIsAbstractType: true }), schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'Member1'",
          },
          {
            "comment": undefined,
            "name": "field1",
            "typeString": "Member1['field1'] | undefined",
          },
        ],
        "name": "Member1",
      }
    `);
    expect(getTypeInfos(fakeConfig({ skipIsAbstractType: false }), schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'Member1'",
          },
          {
            "name": "__isUnion1",
            "typeString": "'Member1'",
          },
          {
            "name": "__isUnion2",
            "typeString": "'Member1'",
          },
          {
            "comment": undefined,
            "name": "field1",
            "typeString": "Member1['field1'] | undefined",
          },
        ],
        "name": "Member1",
      }
    `);
  });
  it('input', () => {
    const schema = buildSchema(`
      input Input {
        field1: String!
        field2: SubType!
      }
      type SubType {
        field: String!
      }
    `);
    const config: Config = fakeConfig();
    expect(getTypeInfos(config, schema)[0]).toMatchInlineSnapshot(`
      {
        "comment": undefined,
        "fields": [
          {
            "name": "__typename",
            "typeString": "'Input'",
          },
          {
            "comment": undefined,
            "name": "field1",
            "typeString": "Input['field1'] | undefined",
          },
          {
            "comment": undefined,
            "name": "field2",
            "typeString": "OptionalSubType | undefined",
          },
        ],
        "name": "Input",
      }
    `);
  });
  it('includes __typename if skipTypename is false', () => {
    const schema = buildSchema(`
      type Book {
        id: ID!
        title: String!
      }
    `);
    const config: Config = fakeConfig({ skipTypename: false });
    expect(getTypeInfos(config, schema)).toMatchInlineSnapshot(`
      [
        {
          "comment": undefined,
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Book'",
            },
            {
              "comment": undefined,
              "name": "id",
              "typeString": "Book['id'] | undefined",
            },
            {
              "comment": undefined,
              "name": "title",
              "typeString": "Book['title'] | undefined",
            },
          ],
          "name": "Book",
        },
      ]
    `);
  });
  it('includes description comment', () => {
    const schema = buildSchema(`
"The book"
type Book {
  id: ID!
  "The book title"
  title: String!
}
    `);
    const config: Config = fakeConfig();
    expect(getTypeInfos(config, schema)).toMatchInlineSnapshot(`
      [
        {
          "comment": "/** The book */
      ",
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Book'",
            },
            {
              "comment": undefined,
              "name": "id",
              "typeString": "Book['id'] | undefined",
            },
            {
              "comment": "/** The book title */
      ",
              "name": "title",
              "typeString": "Book['title'] | undefined",
            },
          ],
          "name": "Book",
        },
      ]
    `);
  });
});

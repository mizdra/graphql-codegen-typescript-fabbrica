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
      interface Node {
        id: ID!
      }
      type Book implements Node {
        id: ID!
        title: String!
        author: Author!
      }
      type Author implements Node {
        id: ID!
        name: String!
        books: [Book!]!
      }
      type Query {
        node(id: ID!): Node
      }
      type Subscription {
        bookAdded: Book!
      }
      type Mutation {
        addBook(title: String!, authorId: ID!): Book!
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
        {
          "comment": undefined,
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Query'",
            },
            {
              "comment": undefined,
              "name": "node",
              "typeString": "Query['node'] | undefined",
            },
          ],
          "name": "Query",
        },
        {
          "comment": undefined,
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Subscription'",
            },
            {
              "comment": undefined,
              "name": "bookAdded",
              "typeString": "OptionalBook | undefined",
            },
          ],
          "name": "Subscription",
        },
        {
          "comment": undefined,
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Mutation'",
            },
            {
              "comment": undefined,
              "name": "addBook",
              "typeString": "OptionalBook | undefined",
            },
          ],
          "name": "Mutation",
        },
      ]
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

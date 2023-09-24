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
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Book'",
            },
            {
              "name": "id",
              "typeString": "Book['id'] | undefined",
            },
            {
              "name": "title",
              "typeString": "Book['title'] | undefined",
            },
            {
              "name": "author",
              "typeString": "Book['author'] | undefined",
            },
          ],
          "name": "Book",
        },
        {
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Author'",
            },
            {
              "name": "id",
              "typeString": "Author['id'] | undefined",
            },
            {
              "name": "name",
              "typeString": "Author['name'] | undefined",
            },
            {
              "name": "books",
              "typeString": "Author['books'] | undefined",
            },
          ],
          "name": "Author",
        },
        {
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Query'",
            },
            {
              "name": "node",
              "typeString": "Query['node'] | undefined",
            },
          ],
          "name": "Query",
        },
        {
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Subscription'",
            },
            {
              "name": "bookAdded",
              "typeString": "Subscription['bookAdded'] | undefined",
            },
          ],
          "name": "Subscription",
        },
        {
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Mutation'",
            },
            {
              "name": "addBook",
              "typeString": "Mutation['addBook'] | undefined",
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
          "fields": [
            {
              "name": "__typename",
              "typeString": "'Book'",
            },
            {
              "name": "id",
              "typeString": "Book['id'] | undefined",
            },
            {
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

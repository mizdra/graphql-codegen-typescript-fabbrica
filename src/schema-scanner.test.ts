import { parse, buildASTSchema } from 'graphql';
import { describe, expect, it } from 'vitest';
import { Config } from './config.js';
import { getTypeInfos } from './schema-scanner.js';

describe('getTypeInfos', () => {
  it('returns typename and field names', () => {
    const ast = parse(`
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
    const schema = buildASTSchema(ast);
    const config: Config = { typesFile: './types', skipTypename: true };
    expect(getTypeInfos(config, schema)).toStrictEqual([
      { name: 'Book', fieldNames: ['id', 'title', 'author'] },
      { name: 'Author', fieldNames: ['id', 'name', 'books'] },
      { name: 'Query', fieldNames: ['node'] },
      { name: 'Subscription', fieldNames: ['bookAdded'] },
      { name: 'Mutation', fieldNames: ['addBook'] },
    ]);
  });
  it('includes __typename if skipTypename is false', () => {
    const ast = parse(`
      type Book {
        id: ID!
        title: String!
      }
    `);
    const schema = buildASTSchema(ast);
    const config: Config = { typesFile: './types', skipTypename: false };
    expect(getTypeInfos(config, schema)).toStrictEqual([{ name: 'Book', fieldNames: ['__typename', 'id', 'title'] }]);
  });
});

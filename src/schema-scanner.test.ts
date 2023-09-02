import { parse, buildASTSchema } from 'graphql';
import { expect, it } from 'vitest';
import { getTypeInfos } from './schema-scanner.js';

it('getTypeInfos', () => {
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
  expect(getTypeInfos(schema)).toStrictEqual([
    { name: 'Book', fieldNames: ['id', 'title', 'author'] },
    { name: 'Author', fieldNames: ['id', 'name', 'books'] },
    { name: 'Query', fieldNames: ['node'] },
    { name: 'Subscription', fieldNames: ['bookAdded'] },
    { name: 'Mutation', fieldNames: ['addBook'] },
  ]);
});

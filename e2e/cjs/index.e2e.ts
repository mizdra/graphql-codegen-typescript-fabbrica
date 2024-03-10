import { it } from 'node:test';
import { defineAuthorFactory, defineBookFactory, dynamic } from './__generated__/1-basic/fabbrica.js';
import assert from 'node:assert/strict';

it('integration test', async () => {
  const BookFactory = defineBookFactory({
    defaultFields: {
      id: dynamic(({ seq }) => `Book-${seq}`),
      title: dynamic(({ seq }) => `ゆゆ式 ${seq}巻`),
      author: undefined,
    },
  });
  const AuthorFactory = defineAuthorFactory({
    defaultFields: {
      id: dynamic(({ seq }) => `Author-${seq}`),
      name: dynamic(({ seq }) => `${seq}上小又`),
      books: undefined,
    },
  });
  let book = await BookFactory.build({
    author: await AuthorFactory.build(),
  });

  assert.deepEqual(book, {
    id: 'Book-0',
    title: 'ゆゆ式 0巻',
    author: {
      id: 'Author-0',
      name: '0上小又',
      books: undefined,
    },
  });
  const _book: {
    id: string;
    title: string;
    author: {
      id: string;
      name: string;
      books: undefined;
    };
  } = book;
  book = _book;
});

import { expectType } from 'ts-expect';
import { expect, it, describe } from 'vitest';
import { oneOf } from './test/util.js';
import { defineBookFactory, type Book, resetAllSequence } from './index.js';

describe('defineTypeFactory', () => {
  it('basic', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: 'Book-0',
        title: 'ゆゆ式',
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: [],
        },
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-0',
      title: 'ゆゆ式',
      author: {
        id: 'Author-0',
        name: '三上小又',
        books: [],
      },
    });
    expectType<{
      id: string;
      title: string;
      author: {
        id: string;
        name: string;
        books: Book[];
      };
    }>(book);
  });
  it('accepts undefined fields', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: 'Book-0',
        title: undefined, // shallow field
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: undefined, // deep field
        },
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-0',
      title: undefined,
      author: {
        id: 'Author-0',
        name: '三上小又',
        books: undefined,
      },
    });
    expectType<{
      id: string;
      title: undefined;
      author: {
        id: string;
        name: string;
        books: undefined;
      };
    }>(book);
  });
  it('accepts functional field resolvers', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: () => 'Book-0',
        title: async () => Promise.resolve('ゆゆ式'),
        author: undefined,
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-0',
      title: 'ゆゆ式',
      author: undefined,
    });
    expectType<{
      id: string;
      title: string;
      author: undefined;
    }>(book);
  });
  it('creates fields with sequential id', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: ({ seq }) => `Book-${seq}`,
        title: async ({ seq }) => Promise.resolve(`ゆゆ式 ${seq}巻`),
        author: undefined,
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-0',
      title: 'ゆゆ式 0巻',
      author: undefined,
    });
  });
  describe('resetAllSequence', () => {
    it('resets all sequence', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: ({ seq }) => `Book-${seq}`,
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-1' });
      resetAllSequence();
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      // TODO: Test other factories
    });
  });
});

describe('TypeFactoryInterface', () => {
  const BookFactory = defineBookFactory({
    defaultFields: {
      id: 'Book-0',
      title: 'ゆゆ式',
      author: {
        id: 'Author-0',
        name: '三上小又',
        books: [],
      },
    },
  });
  describe('build', () => {
    it('overrides defaultFields', async () => {
      // input field is optional
      const book1 = await oneOf(BookFactory.build(), BookFactory.build({}));
      expect(book1).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式',
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: [],
        },
      });
      expectType<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: Book[];
        };
      }>(book1);

      // Passing input fields allows overriding the default field.
      const boo2 = await BookFactory.build({
        title: 'ゆゆ式 100巻',
      });
      expect(boo2).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 100巻',
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: [],
        },
      });
      expectType<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: Book[];
        };
      }>(boo2);
    });
    it('accepts undefined fields', async () => {
      const book = await BookFactory.build({
        title: undefined, // shallow field
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: undefined, // deep field
        },
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: undefined,
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: undefined,
        },
      });
      expectType<{
        id: string;
        title: undefined;
        author: {
          id: string;
          name: string;
          books: undefined;
        };
      }>(book);
    });
    it('creates fields with sequential id', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: 'Book-0',
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      const book = await BookFactory.build({
        id: ({ seq }) => `Book-${seq}`,
        title: async ({ seq }) => Promise.resolve(`ゆゆ式 ${seq}巻`),
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 0巻',
        author: undefined,
      });
    });
  });
  describe('resetSequence', () => {
    it('resets sequence', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: ({ seq }) => `Book-${seq}`,
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-1' });
      BookFactory.resetSequence();
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      // TODO: Test other factories
    });
  });
});

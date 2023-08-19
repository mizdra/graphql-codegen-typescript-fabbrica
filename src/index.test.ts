import { expectType } from 'ts-expect';
import { expect, it, describe } from 'vitest';
import { defineBookFactory, type Book } from './index.js';

describe('defineTypeFactory', () => {
  it('basic', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: 'Book-1',
        title: 'ゆゆ式',
        author: {
          id: 'Author-1',
          name: '三上小又',
          books: [],
        },
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-1',
      title: 'ゆゆ式',
      author: {
        id: 'Author-1',
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
        id: 'Book-1',
        title: undefined, // shallow field
        author: {
          id: 'Author-1',
          name: '三上小又',
          books: undefined, // deep field
        },
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-1',
      title: undefined,
      author: {
        id: 'Author-1',
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
        id: () => 'Book-1',
        title: async () => Promise.resolve('ゆゆ式'),
        author: undefined,
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-1',
      title: 'ゆゆ式',
      author: undefined,
    });
    expectType<{
      id: string;
      title: string;
      author: undefined;
    }>(book);
  });
});

describe('TypeFactoryInterface', () => {
  const BookFactory = defineBookFactory({
    defaultFields: {
      id: 'Book-1',
      title: 'ゆゆ式',
      author: {
        id: 'Author-1',
        name: '三上小又',
        books: [],
      },
    },
  });
  describe('build', () => {
    it('overrides defaultFields', async () => {
      const book = await BookFactory.build({
        // input field is optional
        // id: ...,
        // author: ...,
        title: 'ゆゆ式 2巻', // non-undefined field
      });
      expect(book).toStrictEqual({
        id: 'Book-1',
        title: 'ゆゆ式 2巻',
        author: {
          id: 'Author-1',
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
      const book = await BookFactory.build({
        title: undefined, // shallow field
        author: {
          id: 'Author-1',
          name: '三上小又',
          books: undefined, // deep field
        },
      });
      expect(book).toStrictEqual({
        id: 'Book-1',
        title: undefined,
        author: {
          id: 'Author-1',
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
  });
});

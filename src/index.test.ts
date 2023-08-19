import { expect, it, describe, assertType, expectTypeOf } from 'vitest';
import { oneOf } from './test/util.js';
import { defineBookFactory, type Book, resetAllSequence, lazy } from './index.js';

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
    assertType<{
      id: string;
      title: string;
      author: {
        id: string;
        name: string;
        books: Book[];
      };
    }>(book);
    expectTypeOf(book).not.toBeNever();
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
    assertType<{
      id: string;
      title: undefined;
      author: {
        id: string;
        name: string;
        books: undefined;
      };
    }>(book);
    expectTypeOf(book).not.toBeNever();
  });
  it('accepts functional field resolvers', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: lazy(() => 'Book-0'),
        title: lazy(async () => Promise.resolve('ゆゆ式')),
        author: undefined,
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-0',
      title: 'ゆゆ式',
      author: undefined,
    });
    assertType<{
      id: string;
      title: string;
      author: undefined;
    }>(book);
    expectTypeOf(book).not.toBeNever();
  });
  it('creates fields with sequential id', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: lazy(({ seq }) => `Book-${seq}`),
        title: lazy(async ({ seq }) => Promise.resolve(`ゆゆ式 ${seq}巻`)),
        author: undefined,
      },
    });
    const book = await BookFactory.build();
    expect(book).toStrictEqual({
      id: 'Book-0',
      title: 'ゆゆ式 0巻',
      author: undefined,
    });
    assertType<{
      id: string;
      title: string;
      author: undefined;
    }>(book);
    expectTypeOf(book).not.toBeNever();
  });
  describe('resetAllSequence', () => {
    it('resets all sequence', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: lazy(({ seq }) => `Book-${seq}`),
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
      const book1 = await oneOf([BookFactory.build(), BookFactory.build({})]);
      expect(book1).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式',
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: [],
        },
      });
      assertType<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: Book[];
        };
      }>(book1);
      expectTypeOf(book1).not.toBeNever();

      // Passing input fields allows overriding the default field.
      const book2 = await BookFactory.build({
        title: 'ゆゆ式 100巻',
      });
      expect(book2).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 100巻',
        author: {
          id: 'Author-0',
          name: '三上小又',
          books: [],
        },
      });
      assertType<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: Book[];
        };
      }>(book2);
      expectTypeOf(book2).not.toBeNever();
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
      assertType<{
        id: string;
        title: undefined;
        author: {
          id: string;
          name: string;
          books: undefined;
        };
      }>(book);
      expectTypeOf(book).not.toBeNever();
    });
    it('accepts functional field resolvers', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: 'Book-0',
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      const book = await BookFactory.build({
        id: lazy(() => 'Book-0'),
        title: lazy(async () => Promise.resolve('ゆゆ式')),
        author: undefined,
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式',
        author: undefined,
      });
      assertType<{
        id: string;
        title: string;
        author: undefined;
      }>(book);
      expectTypeOf(book).not.toBeNever();
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
        id: lazy(({ seq }) => `Book-${seq}`),
        title: lazy(async ({ seq }) => Promise.resolve(`ゆゆ式 ${seq}巻`)),
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 0巻',
        author: undefined,
      });
      assertType<{
        id: string;
        title: string;
        author: undefined;
      }>(book);
      expectTypeOf(book).not.toBeNever();
    });
  });
  describe('resetSequence', () => {
    it('resets sequence', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: lazy(({ seq }) => `Book-${seq}`),
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

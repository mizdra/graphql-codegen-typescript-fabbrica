import { expect, it, describe, expectTypeOf, vi } from 'vitest';
import {
  defineAuthorFactory,
  defineBookFactory,
  defineImageFactory,
  defineInterfaceTest_TypeWithInterfaceFieldFactory,
  defineInterfaceTest_ImplementingTypeFactory,
  defineUserFactory,
  dynamic,
  resetAllSequence,
  defineUnionTest_TypeFactory,
  defineUnionTest_Member1Factory,
  defineEnumTest_TypeFactory,
  defineCustomScalarTest_TypeFactory,
  defineNamingConventionTest_RenamedTypeFactory,
  defineNullableTest_TypeFactory,
  defineInputTest_InputFactory,
  defineNonOptionalDefaultFields_OptionalDefaultFieldsTypeFactory,
  OptionalAuthor,
} from './__generated__/1-basic/fabbrica.js';
import { oneOf } from './test/util.js';
import { definePrefixTypeFactory } from './__generated__/2-typesPrefix/fabbrica.js';
import { defineTypeSuffixFactory } from './__generated__/3-typesSuffix/fabbrica.js';
import { defineNonOptionalDefaultFields_NonOptionalDefaultFieldsTypeFactory } from './__generated__/4-non-optional-fields/fabbrica.js';

describe('integration test', () => {
  it('circular dependent type', async () => {
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: dynamic(({ seq }) => `Book-${seq}`),
        title: dynamic(({ seq }) => `ゆゆ式 ${seq}巻`),
        // NOTE: `dynamic(({ seq }) => AuthorFactory.build())` causes a circular dependency between `BookFactory` and `AuthorFactory`.
        // As a result, the types of each other become undecidable and a compile error occurs.
        // So that the type is not undecidable, pass `undefined`.
        author: undefined,
      },
    });
    const AuthorFactory = defineAuthorFactory({
      defaultFields: {
        id: dynamic(({ seq }) => `Author-${seq}`),
        name: dynamic(({ seq }) => `${seq}上小又`),
        // NOTE: The type is not undecidable, pass `undefined`.
        books: undefined,
      },
    });
    const book = await BookFactory.build({
      author: await AuthorFactory.build(),
    });

    expect(book).toStrictEqual({
      id: 'Book-0',
      title: 'ゆゆ式 0巻',
      author: {
        id: 'Author-0',
        name: '0上小又',
        books: undefined,
      },
    });
    expectTypeOf(book).toEqualTypeOf<{
      id: string;
      title: string;
      author: {
        id: string;
        name: string;
        books: undefined;
      };
    }>();

    const author = await AuthorFactory.build({
      books: [book],
    });
    expect(author).toStrictEqual({
      id: 'Author-1',
      name: '1上小又',
      books: [book],
    });
    expectTypeOf(author).toEqualTypeOf<{
      id: string;
      name: string;
      books: {
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: undefined;
        };
      }[];
    }>();
  });
});

describe('GraphQL features test', () => {
  it('nullable', async () => {
    const TypeFactory = defineNullableTest_TypeFactory({
      defaultFields: {
        field1: null,
        field2: ['item', null],
        field3: { field: 'field' },
        field4: [{ field: 'field' }, null],
      },
    });
    const type = await TypeFactory.build();
    expect(type).toStrictEqual({
      field1: null,
      field2: ['item', null],
      field3: { field: 'field' },
      field4: [{ field: 'field' }, null],
    });
    expectTypeOf(type).toEqualTypeOf<{
      field1: null;
      field2: (string | null)[];
      field3: { field: string };
      field4: ({ field: string } | null)[];
    }>();
  });
  describe('interface', () => {
    it('basic', async () => {
      const TypeWithInterfaceField = defineInterfaceTest_TypeWithInterfaceFieldFactory({
        defaultFields: {
          interface: undefined,
        },
      });
      const ImplementingTypeFactory = defineInterfaceTest_ImplementingTypeFactory({
        defaultFields: {
          id: 'ImplementingType-0',
          field: 'field',
        },
      });
      const typeWithInterfaceField = await TypeWithInterfaceField.build({
        interface: await ImplementingTypeFactory.build(),
      });
      expect(typeWithInterfaceField).toStrictEqual({
        interface: {
          id: 'ImplementingType-0',
          field: 'field',
        },
      });
      expectTypeOf(typeWithInterfaceField).toEqualTypeOf<{ interface: { id: string; field: string } }>();
    });
    it('the fields of a union field is optional', async () => {
      defineInterfaceTest_TypeWithInterfaceFieldFactory({
        defaultFields: {
          interface: {},
        },
      });
    });
  });
  describe('union', () => {
    it('basic', async () => {
      const TypeFactory = defineUnionTest_TypeFactory({
        defaultFields: {
          union: undefined,
        },
      });
      const Member1Factory = defineUnionTest_Member1Factory({
        defaultFields: {
          field1: 'field1',
        },
      });
      const type = await TypeFactory.build({
        union: await Member1Factory.build(),
      });
      expect(type).toStrictEqual({
        union: {
          field1: 'field1',
        },
      });
      expectTypeOf(type).toEqualTypeOf<{ union: { field1: string } }>();
    });
    it('the fields of a union field is optional', async () => {
      defineUnionTest_TypeFactory({
        defaultFields: {
          union: {},
        },
      });
    });
  });
  it('enum', async () => {
    const TypeFactory = defineEnumTest_TypeFactory({
      defaultFields: {
        enum: 'VALUE1',
      },
    });
    const type = await TypeFactory.build();
    expect(type).toStrictEqual({
      enum: 'VALUE1',
    });
    expectTypeOf(type).toEqualTypeOf<{ enum: 'VALUE1' }>();
  });
  it('custom scalar', async () => {
    const TypeFactory = defineCustomScalarTest_TypeFactory({
      defaultFields: {
        scalar1: new Date('2021-01-01T00:00:00.000Z'),
        scalar2: { field: 'field' },
      },
    });
    const type = await TypeFactory.build();
    expect(type).toStrictEqual({
      scalar1: new Date('2021-01-01T00:00:00.000Z'),
      scalar2: { field: 'field' },
    });
    expectTypeOf(type).toEqualTypeOf<{ scalar1: Date; scalar2: { field: string } }>();

    // The field of object-typed custom scalar is not optional.
    defineCustomScalarTest_TypeFactory({
      defaultFields: {
        scalar1: new Date('2021-01-01T00:00:00.000Z'),
        // @ts-expect-error -- not optional
        scalar2: { field: undefined },
      },
    });
  });
  it('input', async () => {
    const InputFactory = defineInputTest_InputFactory({
      defaultFields: {
        field: 'field',
      },
    });
    const input = await InputFactory.build();
    expect(input).toStrictEqual({
      field: 'field',
    });
    expectTypeOf(input).toEqualTypeOf<{ field: string }>();
  });
});

describe('GraphQL Code Generator features test', () => {
  it('namingConvention', async () => {
    const RenamedTypeFactory = defineNamingConventionTest_RenamedTypeFactory({
      defaultFields: {
        field1: 'field1',
        field2: { field: 'field' },
      },
    });
    const type = await RenamedTypeFactory.build();
    expect(type).toStrictEqual({
      field1: 'field1',
      field2: { field: 'field' },
    });
    expectTypeOf(type).toEqualTypeOf<{ field1: string; field2: { field: string } }>();
  });
  it('typesPrefix', async () => {
    const TypePrefixFactory = definePrefixTypeFactory({
      defaultFields: {
        field1: 'field1',
        field2: { field: 'field' },
      },
    });
    const type = await TypePrefixFactory.build();
    expect(type).toStrictEqual({
      field1: 'field1',
      field2: { field: 'field' },
    });
    expectTypeOf(type).toEqualTypeOf<{ field1: string; field2: { field: string } }>();
  });
  it('typesSuffix', async () => {
    const TypeSuffixFactory = defineTypeSuffixFactory({
      defaultFields: {
        field1: 'field1',
        field2: { field: 'field' },
      },
    });
    const type = await TypeSuffixFactory.build();
    expect(type).toStrictEqual({
      field1: 'field1',
      field2: { field: 'field' },
    });
    expectTypeOf(type).toEqualTypeOf<{ field1: string; field2: { field: string } }>();
  });
});

describe('defineTypeFactory', () => {
  describe('defaultFields', () => {
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
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: never[];
        };
      }>();
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
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: undefined;
        author: {
          id: string;
          name: string;
          books: undefined;
        };
      }>();
    });
    it('accepts functional field resolvers', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: dynamic(() => 'Book-0'),
          title: dynamic(async () => Promise.resolve('ゆゆ式')),
          author: undefined,
        },
      });
      const book = await BookFactory.build();
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式',
        author: undefined,
      });
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: undefined;
      }>();
    });
    it('accepts readonly array as field', async () => {
      const books = [{ id: 'Book-0', title: 'ゆゆ式', author: undefined }] as const;
      const AuthorFactory = defineAuthorFactory({
        defaultFields: {
          id: 'Author-0',
          name: '三上小又',
          books,
        },
      });
      const author = await AuthorFactory.build();
      expectTypeOf(author).toEqualTypeOf<{
        id: string;
        name: string;
        books: readonly [{ readonly id: 'Book-0'; readonly title: 'ゆゆ式'; readonly author: undefined }];
      }>();
    });
    it('allow missing fields of nested field', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: 'Book-0',
          title: 'ゆゆ式',
          author: {
            id: 'Author-0',
            // missing fields: __typename, name
          },
        },
      });
      const book = await BookFactory.build();
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: {
          id: string;
        };
      }>();
    });
    it('creates fields with sequential id', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Book-${seq}`),
          title: dynamic(async ({ seq }) => Promise.resolve(`ゆゆ式 ${seq}巻`)),
          author: undefined,
        },
      });
      const book = await BookFactory.build();
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 0巻',
        author: undefined,
      });
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: undefined;
      }>();
    });
    it('creates fields based on the values of other fields', async () => {
      const firstNameResolver = vi.fn(() => 'Komata');
      const lastNameResolver = vi.fn(() => 'Mikami');
      const UserFactory = defineUserFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `User-${seq}`),
          firstName: dynamic(firstNameResolver),
          lastName: dynamic(lastNameResolver),
          fullName: dynamic(
            async ({ get }) => `${(await get('firstName')) ?? 'firstName'} ${(await get('lastName')) ?? 'lastName'}`,
          ),
        },
      });
      const user = await UserFactory.build();
      expect(user).toStrictEqual({
        id: 'User-0',
        firstName: 'Komata',
        lastName: 'Mikami',
        fullName: 'Komata Mikami',
      });
      expectTypeOf(user).toEqualTypeOf<{
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
      }>();

      // The result of the field resolver is cached, so the resolver is called only once.
      expect(firstNameResolver).toHaveBeenCalledTimes(1);
      expect(lastNameResolver).toHaveBeenCalledTimes(1);
    });
    describe('nonOptionalDefaultFields', () => {
      it('requires to pass all fields if nonOptionalDefaultFields is false', async () => {
        defineNonOptionalDefaultFields_NonOptionalDefaultFieldsTypeFactory({
          // @ts-expect-error -- expects error
          defaultFields: {
            field1: 'field1',
            // field2: 'field2',
          },
        });
      });
      it('requires to pass all fields if nonOptionalDefaultFields is true', async () => {
        const TypeFactory = defineNonOptionalDefaultFields_OptionalDefaultFieldsTypeFactory({
          defaultFields: {
            field1: 'field1',
            // field2: 'field2',
          },
        });
        // field2 is not included if it is not passed to `defaultFields` or `build`.
        const type1 = await TypeFactory.build();
        expect(type1).toStrictEqual({ field1: 'field1' });
        expectTypeOf(type1).toEqualTypeOf<{ field1: string }>();

        // field2 is included if it is passed to `defaultFields` or `build`.
        const type2 = await TypeFactory.build({ field2: 'field2' });
        expect(type2).toStrictEqual({ field1: 'field1', field2: 'field2' });
        expectTypeOf(type2).toEqualTypeOf<{ field1: string; field2: string }>();
      });
    });
  });
  describe('traits', () => {
    it('overrides defaultFields', async () => {
      const ImageFactory = defineImageFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Image-${seq}`),
          url: '#',
          width: null,
          height: null,
        },
        traits: {
          avatar: {
            defaultFields: {
              url: 'https://example.com/avatar.png',
              width: 48,
              height: 48,
            },
          },
        },
      });
      const image = await ImageFactory.use('avatar').build();
      expect(image).toStrictEqual({
        id: 'Image-0',
        url: 'https://example.com/avatar.png',
        width: 48,
        height: 48,
      });
      expectTypeOf(image).toEqualTypeOf<{
        id: string;
        url: string;
        width: number;
        height: number;
      }>();
    });
    it('overrides fields multiple times by chaining the use methods', async () => {
      const ImageFactory = defineImageFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Image-${seq}`),
          url: '#',
          width: null,
          height: null,
        },
        traits: {
          large: {
            defaultFields: {
              width: 256,
              height: 256,
            },
          },
          avatar: {
            defaultFields: {
              url: 'https://example.com/avatar.png',
            },
          },
        },
      });
      const image = await ImageFactory.use('large').use('avatar').build();
      expect(image).toStrictEqual({
        id: 'Image-0',
        url: 'https://example.com/avatar.png',
        width: 256,
        height: 256,
      });
      expectTypeOf(image).toEqualTypeOf<{
        id: string;
        url: string;
        width: number;
        height: number;
      }>();
    });
    it('increments seq even with traits', async () => {
      const ImageFactory = defineImageFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Image-${seq}`),
          url: '#',
        },
        traits: {
          avatar: {
            defaultFields: {
              url: 'https://example.com/avatar.png',
            },
          },
        },
      });
      const image1 = await ImageFactory.build();
      const image2 = await ImageFactory.use('avatar').build();
      expect(image1.id).toBe('Image-0');
      expect(image2.id).toBe('Image-1');
    });
  });
  describe('transientFields', () => {
    it('basic', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Book-${seq}`),
          title: dynamic(({ seq }) => `ゆゆ式 ${seq}巻`),
          author: undefined,
        },
      });
      const AuthorFactory = defineAuthorFactory.withTransientFields({
        bookCount: 0,
      })({
        defaultFields: {
          id: dynamic(({ seq }) => `Author-${seq}`),
          name: '三上小又',
          books: dynamic(async ({ get }) => {
            const bookCount = (await get('bookCount')) ?? 0;
            return BookFactory.buildList(bookCount);
          }),
        },
      });
      const author1 = await AuthorFactory.build();
      expect(author1).toStrictEqual({
        id: 'Author-0',
        name: '三上小又',
        books: [],
      });
      expectTypeOf(author1).toEqualTypeOf<{
        id: string;
        name: string;
        books: { id: string; title: string; author: undefined }[];
      }>();

      const author2 = await AuthorFactory.build({ bookCount: 3 });
      expect(author2).toStrictEqual({
        id: 'Author-1',
        name: '三上小又',
        books: [
          { id: 'Book-0', title: 'ゆゆ式 0巻', author: undefined },
          { id: 'Book-1', title: 'ゆゆ式 1巻', author: undefined },
          { id: 'Book-2', title: 'ゆゆ式 2巻', author: undefined },
        ],
      });
      expectTypeOf(author2).toEqualTypeOf<{
        id: string;
        name: string;
        books: {
          id: string;
          title: string;
          author: undefined;
        }[];
      }>();
    });
    it('support chaining', async () => {
      const AuthorFactory = defineAuthorFactory
        .withTransientFields({
          a: 0,
          b: 'str',
        })
        .withTransientFields({
          b: undefined,
          c: true,
        })({
        defaultFields: {
          id: dynamic(async ({ get }) => {
            return `${await get('a')}-${await get('b')}-${await get('c')}`;
          }),
        },
      });
      const author1 = await AuthorFactory.build({ a: 0, b: undefined, c: true });
      expect(author1).toStrictEqual({ id: '0-undefined-true' });
      expectTypeOf(author1).toEqualTypeOf<{ id: string }>();
      // @ts-expect-error -- b is overridden by undefined
      await AuthorFactory.build({ a: 0, b: 'str', c: true });
    });
    it('with traits', async () => {
      const BookFactory = defineBookFactory.withTransientFields({
        prefix: 'Foo-',
      })({
        defaultFields: {
          id: dynamic(async ({ get }) => `${(await get('prefix')) ?? ''}Book`),
        },
        traits: {
          trait: {
            defaultFields: {
              prefix: 'Bar-',
            },
          },
        },
      });
      const book1 = await BookFactory.build();
      const book2 = await BookFactory.use('trait').build();
      expect(book1.id).toBe('Foo-Book');
      expect(book2.id).toBe('Bar-Book');
    });
  });
  it('additionalFields', async () => {
    const AuthorFactory = defineAuthorFactory.withAdditionalFields<{ popularBooks: OptionalAuthor['books'] }>()({
      defaultFields: {
        id: dynamic(({ seq }) => `Author-${seq}`),
        name: 'Komata Mikami',
        books: dynamic(() => BookFactory.buildList(3)),
        popularBooks: dynamic(() => BookFactory.buildList(1)),
      },
    });
    const BookFactory = defineBookFactory({
      defaultFields: {
        id: dynamic(({ seq }) => `Book-${seq}`),
        title: dynamic(({ seq }) => `Yuyushiki Vol.${seq}`),
      },
    });
    const author = await AuthorFactory.build();
    expect(author).toStrictEqual({
      id: 'Author-0',
      name: 'Komata Mikami',
      books: [
        { id: 'Book-0', title: 'Yuyushiki Vol.0' },
        { id: 'Book-1', title: 'Yuyushiki Vol.1' },
        { id: 'Book-2', title: 'Yuyushiki Vol.2' },
      ],
      popularBooks: [{ id: 'Book-3', title: 'Yuyushiki Vol.3' }],
    });
    expectTypeOf(author).toEqualTypeOf<{
      id: string;
      name: string;
      books: { id: string; title: string }[];
      popularBooks: { id: string; title: string }[];
    }>();
  });
  describe('resetAllSequence', () => {
    it('resets all sequence', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Book-${seq}`),
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      const AuthorFactory = defineAuthorFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Author-${seq}`),
          name: '三上小又',
          books: undefined,
        },
      });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-1' });
      expect(await AuthorFactory.build()).toMatchObject({ id: 'Author-0' });
      expect(await AuthorFactory.build()).toMatchObject({ id: 'Author-1' });
      resetAllSequence();
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      expect(await AuthorFactory.build()).toMatchObject({ id: 'Author-0' });
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
      expectTypeOf(book1).toEqualTypeOf<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: never[];
        };
      }>();

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
      expectTypeOf(book2).toEqualTypeOf<{
        id: string;
        title: string;
        author: {
          id: string;
          name: string;
          books: never[];
        };
      }>();
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
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: undefined;
        author: {
          id: string;
          name: string;
          books: undefined;
        };
      }>();
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
        id: dynamic(() => 'Book-0'),
        title: dynamic(async () => Promise.resolve('ゆゆ式')),
        author: undefined,
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式',
        author: undefined,
      });
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: undefined;
      }>();
    });
    it('accepts readonly array as field', async () => {
      const books = [{ id: 'Book-0', title: 'ゆゆ式', author: undefined }] as const;
      const AuthorFactory = defineAuthorFactory({
        defaultFields: {
          id: 'Author-0',
          name: '三上小又',
          books: undefined,
        },
      });
      const author = await AuthorFactory.build({ books });
      expectTypeOf(author).toEqualTypeOf<{
        id: string;
        name: string;
        books: readonly [{ readonly id: 'Book-0'; readonly title: 'ゆゆ式'; readonly author: undefined }];
      }>();
    });
    it('returns the object with mutable fields', async () => {
      const AuthorFactory = defineAuthorFactory({
        defaultFields: {
          id: 'Author-0',
          name: '0上小又',
          books: [{ id: 'Book-0', title: 'ゆゆ式 0巻', author: undefined }],
        },
      });

      // field is mutable
      const author1 = await AuthorFactory.build();
      author1.id = 'Author-1';
      author1.name = '1上小又';
      author1.books = [{ id: 'Book-1', title: 'ゆゆ式 1巻', author: undefined }];
      expectTypeOf(author1).toEqualTypeOf<{
        id: string;
        name: string;
        books: { id: string; title: string; author: undefined }[];
      }>();

      // The readonly modifier of the input value is kept.
      const books = [{ id: 'Book-1', title: 'ゆゆ式 1巻', author: undefined }] as const;
      const author2 = await AuthorFactory.build({ books });
      author2.id = 'Author-1';
      author2.name = '1上小又';
      // @ts-expect-error -- ignore readonly error
      author2.books = [{ id: 'Book-2', title: 'ゆゆ式 2巻', author: undefined }];
      expectTypeOf(author2).toEqualTypeOf<{
        id: string;
        name: string;
        books: readonly [{ readonly id: 'Book-1'; readonly title: 'ゆゆ式 1巻'; readonly author: undefined }];
      }>();
    });
    it('does not call the overridden resolvers', async () => {
      const defaultTitleResolver = vi.fn(() => 'ゆゆ式');
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: 'Book-0',
          title: dynamic(defaultTitleResolver),
          author: undefined,
        },
      });
      const book = await BookFactory.build({
        title: 'ゆゆ式 100巻',
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 100巻',
        author: undefined,
      });
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: undefined;
      }>();
      expect(defaultTitleResolver).not.toHaveBeenCalled();
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
        id: dynamic(({ seq }) => `Book-${seq}`),
        title: dynamic(async ({ seq }) => Promise.resolve(`ゆゆ式 ${seq}巻`)),
      });
      expect(book).toStrictEqual({
        id: 'Book-0',
        title: 'ゆゆ式 0巻',
        author: undefined,
      });
      expectTypeOf(book).toEqualTypeOf<{
        id: string;
        title: string;
        author: undefined;
      }>();
    });
    it('creates fields based on the values of other fields', async () => {
      const firstNameResolver = vi.fn(() => 'Komata');
      const lastNameResolver = vi.fn(() => 'Mikami');
      const UserFactory = defineUserFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `User-${seq}`),
          firstName: '',
          lastName: '',
          fullName: '',
        },
      });
      const User = await UserFactory.build({
        firstName: dynamic(firstNameResolver),
        lastName: dynamic(lastNameResolver),
        fullName: dynamic(
          async ({ get }) => `${(await get('firstName')) ?? 'firstName'} ${(await get('lastName')) ?? 'lastName'}`,
        ),
      });
      expect(User).toStrictEqual({
        id: 'User-0',
        firstName: 'Komata',
        lastName: 'Mikami',
        fullName: 'Komata Mikami',
      });
      expectTypeOf(User).toEqualTypeOf<{
        id: string;
        firstName: string;
        lastName: string;
        fullName: string;
      }>();

      // The result of the field resolver is cached, so the resolver is called only once.
      expect(firstNameResolver).toHaveBeenCalledTimes(1);
      expect(lastNameResolver).toHaveBeenCalledTimes(1);
    });
  });
  describe('buildList', () => {
    it('overrides defaultFields', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Book-${seq}`),
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      // input field is optional
      const books1 = await BookFactory.buildList(2);
      expect(books1).toStrictEqual([
        {
          id: 'Book-0',
          title: 'ゆゆ式',
          author: undefined,
        },
        {
          id: 'Book-1',
          title: 'ゆゆ式',
          author: undefined,
        },
      ]);
      expectTypeOf(books1).toEqualTypeOf<
        {
          id: string;
          title: string;
          author: undefined;
        }[]
      >();

      BookFactory.resetSequence();

      // Passing input fields allows overriding the default field.
      const books2 = await BookFactory.buildList(2, {
        title: 'ゆゆ式 100巻',
      });
      expect(books2).toStrictEqual([
        {
          id: 'Book-0',
          title: 'ゆゆ式 100巻',
          author: undefined,
        },
        {
          id: 'Book-1',
          title: 'ゆゆ式 100巻',
          author: undefined,
        },
      ]);
      expectTypeOf(books2).toEqualTypeOf<
        {
          id: string;
          title: string;
          author: undefined;
        }[]
      >();
    });
  });
  describe('resetSequence', () => {
    it('resets sequence', async () => {
      const BookFactory = defineBookFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Book-${seq}`),
          title: 'ゆゆ式',
          author: undefined,
        },
      });
      const AuthorFactory = defineAuthorFactory({
        defaultFields: {
          id: dynamic(({ seq }) => `Author-${seq}`),
          name: '三上小又',
          books: undefined,
        },
      });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-1' });
      expect(await AuthorFactory.build()).toMatchObject({ id: 'Author-0' });
      expect(await AuthorFactory.build()).toMatchObject({ id: 'Author-1' });
      BookFactory.resetSequence();
      expect(await BookFactory.build()).toMatchObject({ id: 'Book-0' });
      expect(await AuthorFactory.build()).toMatchObject({ id: 'Author-2' });
    });
  });
});

# graphql-fabbrica

GraphQL Code Generator Plugin to define mock data factory.

## Installation

```sh
npm install --save-dev @mizdra/graphql-fabbrica
```

## Usage

First, you should configure the configuration file of GraphQL Code Generator as follows.

```ts
// codegen.ts
import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      config: {
        enumsAsTypes: true, // required
        avoidOptionals: true, // required
        nonOptionalTypename: true, // required
      },
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        typesFile: './types', // required
      },
    },
  },
};

module.exports = config;
```

```graphql
# schema.graphql
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
```

Second, you should generate the code with the GraphQL Code Generator.

```sh
npx graphql-codegen
```

Then, the utilities to define a factory are generated. You can define your preferred factory with it.

```ts
// src/app.ts
import { defineBookFactory, defineAuthorFactory, lazy } from '../__generated__/fabbrica';
import { faker } from '@faker-js/faker';

const BookFactory = defineBookFactory({
  defaultFields: {
    __typename: 'Book',
    id: lazy(({ seq }) => `Book-${seq}`),
    title: lazy(() => faker.word.noun()),
    author: undefined,
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    __typename: 'Author',
    id: lazy(({ seq }) => `Author-${seq}`),
    name: lazy(() => faker.person.firstName()),
    books: undefined,
  },
});
```

The factory generates strictly typed mock data.

```ts
// simple
const book0 = await BookFactory.build();
expect(book0).toStrictEqual({
  __typename: 'Book',
  id: 'Book-0',
  title: 'apple',
  author: undefined,
});
assertType<{
  __typename: 'Book';
  id: string;
  title: string;
  author: undefined;
}>(book0);

// nested
const book1 = await BookFactory.build({
  author: await AuthorFactory.build(),
});
expect(book1).toStrictEqual({
  __typename: 'Book',
  id: 'Book-1',
  title: 'orange',
  author: {
    __typename: 'Author',
    id: 'Author-0',
    name: 'Tom',
    books: undefined,
  },
});
assertType<{
  __typename: 'Book';
  id: string;
  title: string;
  author: {
    __typename: 'Author';
    id: string;
    name: string;
    books: undefined;
  };
}>(book1);
```

## Notable features

The library has several notable features. And many of them are inspired by [FactoryBot](https://thoughtbot.github.io/factory_bot/).

### Sequences

Sequences allow you to build sequentially numbered data.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Book-${seq}`),
    title: lazy(async ({ seq }) => Promise.resolve(`Yuyushiki Vol.${seq}`)),
    author: undefined,
  },
});
expect(await BookFactory.build()).toStrictEqual({
  id: 'Book-0',
  title: 'Yuyushiki Vol.0',
  author: undefined,
});
expect(await BookFactory.build()).toStrictEqual({
  id: 'Book-1',
  title: 'Yuyushiki Vol.1',
  author: undefined,
});
```

### Dependent Fields

Fields can be based on the values of other fields using `get` function.

```ts
const UserFactory = defineUserFactory({
  defaultFields: {
    id: lazy(({ seq }) => `User-${seq}`),
    name: 'yukari',
    email: lazy(async ({ get }) => `${(await get('name')) ?? 'defaultName'}@yuyushiki.net`),
  },
});
expect(await UserFactory.build()).toStrictEqual({
  id: 'User-0',
  name: 'yukari',
  email: 'yukari@yuyushiki.net',
});
expect(await UserFactory.build({ name: 'yui' })).toStrictEqual({
  id: 'User-1',
  name: 'yui',
  email: 'yui@yuyushiki.net',
});
```

### Building lists

You can build a list of mock data with `buildList` utility.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Book-${seq}`),
    title: lazy(({ seq }) => `Yuyushiki Vol.${seq}`),
    author: undefined,
  },
});
expect(await BookFactory.buildList(3)).toStrictEqual([
  { id: 'Book-0', title: 'Yuyushiki Vol.0', author: undefined },
  { id: 'Book-1', title: 'Yuyushiki Vol.1', author: undefined },
  { id: 'Book-2', title: 'Yuyushiki Vol.2', author: undefined },
]);
```

### Build mock data of related types (a.k.a. Associations)

You can build mock data of the relevant type in one shot.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Book-${seq}`),
    title: lazy(({ seq }) => `Yuyushiki Vol.${seq}`),
    author: undefined,
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Author-${seq}`),
    name: 'Komata Mikami',
    books: lazy(async () => BookFactory.buildList(1)), // Build mock data of related types
  },
});
expect(await AuthorFactory.build()).toStrictEqual({
  id: 'Author-0',
  name: 'Komata Mikami',
  books: [{ id: 'Book-0', title: 'Yuyushiki Vol.0', author: undefined }],
});
```

### Transient Fields

Transient fields are only available within the factory definition and are not included in the data being built. This allows more complex logic to be used inside factories.

However, you must prepare a custom `define<Type>Factory` to use Transient Fields.

```ts
import {
  defineAuthorFactoryInternal,
  lazy,
  DefaultFieldsResolver,
  Traits,
  AuthorFactoryDefineOptions,
  AuthorFactoryInterface,
} from '../__generated__/fabbrica';
import { Author } from '../__generated__/types';

// Prepare custom `defineAuthorFactory` with transient fields
type AuthorTransientFields = {
  bookCount: number;
};
function defineAuthorFactoryWithTransientFields<
  _DefaultFieldsResolver extends DefaultFieldsResolver<Author & AuthorTransientFields>,
  _Traits extends Traits<Author, AuthorTransientFields>,
>(
  options: AuthorFactoryDefineOptions<AuthorTransientFields, _DefaultFieldsResolver, _Traits>,
): AuthorFactoryInterface<AuthorTransientFields, _DefaultFieldsResolver, _Traits> {
  return defineAuthorFactoryInternal(options);
}

// Use custom `defineAuthorFactory`
const AuthorFactory = defineAuthorFactoryWithTransientFields({
  defaultFields: {
    id: lazy(({ seq }) => `Author-${seq}`),
    name: 'Komata Mikami',
    books: lazy(async ({ get }) => {
      const bookCount = (await get('bookCount')) ?? 0;
      return BookFactory.buildList(bookCount);
    }),
    bookCount: 0,
  },
});
expect(await AuthorFactory.build({ bookCount: 3 })).toStrictEqual({
  id: 'Author-0',
  name: 'Komata Mikami',
  books: [
    { id: 'Book-0', title: 'Yuyushiki Vol.0', author: undefined },
    { id: 'Book-1', title: 'Yuyushiki Vol.1', author: undefined },
    { id: 'Book-2', title: 'Yuyushiki Vol.2', author: undefined },
  ],
});
```

### Traits

Traits allow you to group the default values of fields and apply them to factories.

```ts
import I_SPACER from '../assets/spacer.gif';
import I_AVATAR from '../assets/dummy/avatar.png';
import I_BANNER from '../assets/dummy/banner.png';

const ImageFactory = defineImageFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Image-${seq}`),
    url: I_SPACER.src,
    width: I_SPACER.width,
    height: I_SPACER.height,
  },
  traits: {
    avatar: {
      defaultFields: {
        url: I_AVATAR.src,
        width: I_AVATAR.width,
        height: I_AVATAR.height,
      },
    },
    banner: {
      defaultFields: {
        url: I_BANNER.src,
        width: I_BANNER.width,
        height: I_BANNER.height,
      },
    },
  },
});
expect(await ImageFactory.build()).toStrictEqual({
  id: 'Image-0',
  url: I_SPACER.src,
  width: I_SPACER.width,
  height: I_SPACER.height,
});
expect(await ImageFactory.use('avatar').build()).toStrictEqual({
  id: 'Image-1',
  url: I_AVATAR.src,
  width: I_AVATAR.width,
  height: I_AVATAR.height,
});
expect(await ImageFactory.use('banner').build()).toStrictEqual({
  id: 'Image-2',
  url: I_BANNER.src,
  width: I_BANNER.width,
  height: I_BANNER.height,
});
```

## Available configs

Several configs can be set in the GraphQL Code Generator configuration file.

### `typesFile`

type: `string`, required

Defines the file path containing all GraphQL types. This file can be generated with the [typescript plugin](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript).

### `skipTypename`

type: `boolean`, default: `false`

Does not add `__typename` to the generated mock data. The value of this option must be the same as the option of the same name in [typescript plugin](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript).

## Troubleshooting

### `error TS7022: '<Type>Factory' implicitly has type 'any' because ...`

Creating a circular type with [Associations](#build-mock-data-of-related-types-aka-associations) may cause compile errors.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Book-${seq}`),
    title: lazy(({ seq }) => `ゆゆ式 ${seq}巻`),
    // NOTE: `lazy(({ seq }) => AuthorFactory.build())` causes a circular dependency between `BookFactory` and `AuthorFactory`.
    // As a result, the types of each other become undecidable and a compile error occurs.
    // So that the type is not undecidable, pass `undefined`.
    author: lazy(({ seq }) => AuthorFactory.build()),
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Author-${seq}`),
    name: lazy(({ seq }) => `${seq}上小又`),
    // NOTE: The type is not undecidable, pass `undefined`.
    books: lazy(({ seq }) => BookFactory.buildList()),
  },
});
```

```console
$ npx tsc --noEmit
index.e2e.ts:20:11 - error TS7022: 'BookFactory' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

20     const BookFactory = defineBookFactory({
             ~~~~~~~~~~~

index.e2e.ts:30:11 - error TS7022: 'AuthorFactory' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

30     const AuthorFactory = defineAuthorFactory({
             ~~~~~~~~~~~~~
```

This error is due to the type of each field being cycled, making the type undecidable. To avoid this, you can pass `undefined` to any field.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Book-${seq}`),
    title: lazy(({ seq }) => `ゆゆ式 ${seq}巻`),
    author: lazy(({ seq }) => AuthorFactory.build()),
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    id: lazy(({ seq }) => `Author-${seq}`),
    name: lazy(({ seq }) => `${seq}上小又`),
    // Pass `undefined` to avoid type being undecidable.
    books: undefined,
  },
});
```

## License

This library is licensed under the MIT license.

The copyright contains two names. The first is [@mizdra](https://github.com/mizdra), author of graphql-fabbrica. The second is [@Quramy](https://github.com/Quramy), author of [prisma-fabbrica](https://github.com/Quramy/prisma-fabbrica).

The name of the author of prisma-fabbrica is written because graphql-fabbrica reuses some of prisma-fabbrica's code.

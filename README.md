# graphql-fabbrica

GraphQL Code Generator Plugin to define mock data factory.

## Installation

```sh
npm install --save-dev @mizdra/graphql-fabbrica
```

## Requirements

- `graphql` >= 16.0.0
- `typescript` >= 5.0.0
  - `--moduleResolution Bundler`, `--moduleResolution Node16` or `--moduleResolution NodeNext` is required

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
import { defineBookFactory, defineAuthorFactory, dynamic } from '../__generated__/fabbrica';
import { faker } from '@faker-js/faker';

const BookFactory = defineBookFactory({
  defaultFields: {
    __typename: 'Book',
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: dynamic(() => faker.word.noun()),
    author: undefined,
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    __typename: 'Author',
    id: dynamic(({ seq }) => `Author-${seq}`),
    name: dynamic(() => faker.person.firstName()),
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
  title: expect.any(String),
  author: undefined,
});
expectTypeOf(book0).toEqualTypeOf<{
  __typename: 'Book';
  id: string;
  title: string;
  author: undefined;
}>();

// nested
const book1 = await BookFactory.build({
  author: await AuthorFactory.build(),
});
expect(book1).toStrictEqual({
  __typename: 'Book',
  id: 'Book-1',
  title: expect.any(String),
  author: {
    __typename: 'Author',
    id: 'Author-0',
    name: expect.any(String),
    books: undefined,
  },
});
expectTypeOf(book1).toEqualTypeOf<{
  __typename: 'Book';
  id: string;
  title: string;
  author: {
    __typename: 'Author';
    id: string;
    name: string;
    books: undefined;
  };
}>();
```

## Notable features

The library has several notable features. And many of them are inspired by [FactoryBot](https://thoughtbot.github.io/factory_bot/).

### Dynamic Fields

The `dynamic` function allows you to define fields with a dynamic value.

```ts
import { dynamic } from '../__generated__/fabbrica';
const BookFactory = defineBookFactory({
  defaultFields: {
    id: dynamic(() => faker.datatype.uuid()),
    title: 'Yuyushiki',
  },
});
expect(await BookFactory.build()).toStrictEqual({
  id: expect.any(String), // Randomly generated UUID
  title: 'Yuyushiki',
});
```

### Sequences

Sequences allow you to build sequentially numbered data.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: dynamic(async ({ seq }) => Promise.resolve(`Yuyushiki Vol.${seq}`)),
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
    id: dynamic(({ seq }) => `User-${seq}`),
    name: 'yukari',
    email: dynamic(async ({ get }) => `${(await get('name')) ?? 'defaultName'}@yuyushiki.net`),
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

You can build a list of mock data with the `buildList` method.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: dynamic(({ seq }) => `Yuyushiki Vol.${seq}`),
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
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: dynamic(({ seq }) => `Yuyushiki Vol.${seq}`),
    author: undefined,
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Author-${seq}`),
    name: 'Komata Mikami',
    books: dynamic(async () => BookFactory.buildList(1)), // Build mock data of related types
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
  dynamic,
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
    id: dynamic(({ seq }) => `Author-${seq}`),
    name: 'Komata Mikami',
    books: dynamic(async ({ get }) => {
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
    id: dynamic(({ seq }) => `Image-${seq}`),
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

Does not add `__typename` to the fields that can be passed to factory.

```ts
import { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      config: {
        // ...
      },
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        // ...
        skipTypename: true,
      },
    },
  },
};
module.exports = config;
```

### `skipIsAbstractType`

type: `boolean`, default: `true`

Does not add `__is<AbstractType>` to the fields that can be passed to factory. `__is<AbstractType>` is a field that relay-compiler automatically adds to the query[^1][^2]. It is recommended for Relay users to set this option to `false`.

[^1]: https://github.com/facebook/relay/issues/3129#issuecomment-659439154
[^2]: https://github.com/search?q=repo%3Afacebook%2Frelay%20%2F__is%3CAbstractType%3E%2F&type=code

```ts
import { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      config: {
        // ...
      },
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        // ...
        skipIsAbstractType: false,
      },
    },
  },
};
module.exports = config;
```

### `nonOptionalFields`

type: `boolean`, default: `false`

Make it mandatory to pass all fields to `defaultFields`. This is useful to force the `defaultFields` to be updated when new fields are added to the schema.

```ts
import { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: './schema.graphql',
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      config: {
        // ...
      },
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      config: {
        // ...
        nonOptionalFields: true,
      },
    },
  },
};
module.exports = config;
```

### `namingConvention`

type: `NamingConvention`, default: `change-case-all#pascalCase`

Allow you to override the naming convention of the output.

This option is compatible with [the one for typescript plugin](https://the-guild.dev/graphql/codegen/docs/config-reference/naming-convention#namingconvention). If you specify it for the typescript plugin, you must set the same value for graphql-fabbrica.

```ts
import { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: './schema.graphql',
  config: {
    namingConvention: 'change-case-all#lowerCase',
  },
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      // ...
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      // ...
    },
  },
};
module.exports = config;
```

### `typesPrefix`

type: `string`, default: `''`

Prefixes all the generated types.

This option is compatible with [the one for typescript plugin](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#typesprefix). If you specify it for the typescript plugin, you must set the same value for graphql-fabbrica.

```ts
import { CodegenConfig } from '@graphql-codegen/cli';
const config: CodegenConfig = {
  schema: './schema.graphql',
  config: {
    typesPrefix: 'I',
  },
  generates: {
    '__generated__/types.ts': {
      plugins: ['typescript'],
      // ...
    },
    './__generated__/fabbrica.ts': {
      plugins: ['@mizdra/graphql-fabbrica'],
      // ...
    },
  },
};
module.exports = config;
```

### `typesSuffix`

type: `string`, default: `''`

Suffixes all the generated types.

This option is compatible with [the one for typescript plugin](https://the-guild.dev/graphql/codegen/plugins/typescript/typescript#typessuffix). If you specify it for the typescript plugin, you must set the same value for graphql-fabbrica.

## Troubleshooting

### `error TS7022: '<Type>Factory' implicitly has type 'any' because ...`

Creating a circular type with [Associations](#build-mock-data-of-related-types-aka-associations) may cause compile errors.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: dynamic(({ seq }) => `ゆゆ式 ${seq}巻`),
    author: dynamic(({ seq }) => AuthorFactory.build()),
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Author-${seq}`),
    name: dynamic(({ seq }) => `${seq}上小又`),
    books: dynamic(({ seq }) => BookFactory.buildList()),
  },
});
```

```console
$ npx tsc --noEmit
example.ts:1:7 - error TS7022: 'BookFactory' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

1     const BookFactory = defineBookFactory({
            ~~~~~~~~~~~

example.ts:8:7 - error TS7022: 'AuthorFactory' implicitly has type 'any' because it does not have a type annotation and is referenced directly or indirectly in its own initializer.

8     const AuthorFactory = defineAuthorFactory({
            ~~~~~~~~~~~~~
```

This error is due to the type of each field being cycled, making the type undecidable. To avoid this, you can pass `undefined` to any field.

```ts
const BookFactory = defineBookFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Book-${seq}`),
    title: dynamic(({ seq }) => `ゆゆ式 ${seq}巻`),
    author: dynamic(({ seq }) => AuthorFactory.build()),
  },
});
const AuthorFactory = defineAuthorFactory({
  defaultFields: {
    id: dynamic(({ seq }) => `Author-${seq}`),
    name: dynamic(({ seq }) => `${seq}上小又`),
    // Pass `undefined` to avoid type being undecidable.
    books: undefined,
  },
});
```

## License

This library is licensed under the MIT license.

The copyright contains two names. The first is [@mizdra](https://github.com/mizdra), author of graphql-fabbrica. The second is [@Quramy](https://github.com/Quramy), author of [prisma-fabbrica](https://github.com/Quramy/prisma-fabbrica).

The name of the author of prisma-fabbrica is written because graphql-fabbrica reuses some of prisma-fabbrica's code.

import { TypeFactoryDefineOptions, TypeFactoryInterface, defineTypeFactoryInternal } from './factory.js';
import { lazy } from './field-resolver.js';
import { resetAllSequence } from './sequence.js';

export { resetAllSequence, lazy };

export type Book = {
  id: string;
  title: string;
  author: Author;
};
export type Author = {
  id: string;
  name: string;
  books: Book[];
};
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
};
export type Image = {
  id: string;
  url: string;
  width: number | null;
  height: number | null;
};
const BookFieldNames = ['id', 'title', 'author'] as const;
const AuthorFieldNames = ['id', 'name', 'books'] as const;
const UserFieldNames = ['id', 'firstName', 'lastName', 'fullName'] as const;
const ImageFieldNames = ['id', 'url', 'width', 'height'] as const;

// ---------- Book ----------

export type BookFactoryDefineOptions<TransientFields extends Record<string, unknown>> = TypeFactoryDefineOptions<
  Book,
  TransientFields
>;
export type BookFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends BookFactoryDefineOptions<TransientFields>,
> = TypeFactoryInterface<Book, TransientFields, Options>;

/**
 * Define factory for {@link Book} model.
 *
 * @param options
 * @returns factory {@link BookFactoryInterface}
 */
export function defineBookFactory<Options extends BookFactoryDefineOptions<{}>>(
  options: Options,
): BookFactoryInterface<{}, Options> {
  return defineTypeFactoryInternal<Book, {}, Options>(BookFieldNames, options);
}

// ---------- Author ----------

export type AuthorFactoryDefineOptions<TransientFields extends Record<string, unknown>> = TypeFactoryDefineOptions<
  Author,
  TransientFields
>;
export type AuthorFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends AuthorFactoryDefineOptions<TransientFields>,
> = TypeFactoryInterface<Author, TransientFields, Options>;

/**
 * Define factory for {@link Author} model.
 *
 * @param options
 * @returns factory {@link AuthorFactoryInterface}
 */
export function defineAuthorFactory<Options extends AuthorFactoryDefineOptions<{}>>(
  options: Options,
): AuthorFactoryInterface<{}, Options> {
  return defineTypeFactoryInternal<Author, {}, Options>(AuthorFieldNames, options);
}

// ---------- User ----------

export type UserFactoryDefineOptions<TransientFields extends Record<string, unknown>> = TypeFactoryDefineOptions<
  User,
  TransientFields
>;
export type UserFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends UserFactoryDefineOptions<TransientFields>,
> = TypeFactoryInterface<User, TransientFields, Options>;

/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export function defineUserFactory<Options extends UserFactoryDefineOptions<{}>>(
  options: Options,
): UserFactoryInterface<{}, Options> {
  return defineTypeFactoryInternal<User, {}, Options>(UserFieldNames, options);
}

// ---------- Image ----------

export type ImageFactoryDefineOptions<TransientFields extends Record<string, unknown>> = TypeFactoryDefineOptions<
  Image,
  TransientFields
>;
export type ImageFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends ImageFactoryDefineOptions<TransientFields>,
> = TypeFactoryInterface<Image, TransientFields, Options>;

/**
 * Define factory for {@link Image} model.
 *
 * @param options
 * @returns factory {@link ImageFactoryInterface}
 */
export function defineImageFactory<Options extends ImageFactoryDefineOptions<{}>>(
  options: Options,
): ImageFactoryInterface<{}, Options> {
  return defineTypeFactoryInternal<Image, {}, Options>(ImageFieldNames, options);
}

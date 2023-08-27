import { Traits, TypeFactoryDefineOptions, TypeFactoryInterface, defineTypeFactoryInternal } from './factory.js';
import { DefaultFieldsResolver, lazy } from './field-resolver.js';
import { resetAllSequence } from './sequence.js';

export { resetAllSequence, lazy, DefaultFieldsResolver, Traits };

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

export type BookFactoryDefineOptions<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Book & TransientFields>,
  _Traits extends Traits<Book, TransientFields>,
> = TypeFactoryDefineOptions<Book, TransientFields, _DefaultFieldsResolver, _Traits>;
export type BookFactoryInterface<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Book & TransientFields>,
  _Traits extends Traits<Book, TransientFields>,
> = TypeFactoryInterface<Book, TransientFields, _DefaultFieldsResolver, _Traits>;

export function defineBookFactoryInternal<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Book & TransientFields>,
  _Traits extends Traits<Book, TransientFields>,
>(
  options: BookFactoryDefineOptions<TransientFields, _DefaultFieldsResolver, _Traits>,
): BookFactoryInterface<TransientFields, _DefaultFieldsResolver, _Traits> {
  return defineTypeFactoryInternal(BookFieldNames, options);
}

/**
 * Define factory for {@link Book} model.
 *
 * @param options
 * @returns factory {@link BookFactoryInterface}
 */
export function defineBookFactory<
  _DefaultFieldsResolver extends DefaultFieldsResolver<Book>,
  _Traits extends Traits<Book, {}>,
>(
  options: BookFactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
): BookFactoryInterface<{}, _DefaultFieldsResolver, _Traits> {
  return defineBookFactoryInternal(options);
}

// ---------- Author ----------

export type AuthorFactoryDefineOptions<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Author & TransientFields>,
  _Traits extends Traits<Author, TransientFields>,
> = TypeFactoryDefineOptions<Author, TransientFields, _DefaultFieldsResolver, _Traits>;
export type AuthorFactoryInterface<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Author & TransientFields>,
  _Traits extends Traits<Author, TransientFields>,
> = TypeFactoryInterface<Author, TransientFields, _DefaultFieldsResolver, _Traits>;

export function defineAuthorFactoryInternal<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Author & TransientFields>,
  _Traits extends Traits<Author, TransientFields>,
>(
  options: AuthorFactoryDefineOptions<TransientFields, _DefaultFieldsResolver, _Traits>,
): AuthorFactoryInterface<TransientFields, _DefaultFieldsResolver, _Traits> {
  return defineTypeFactoryInternal(AuthorFieldNames, options);
}

/**
 * Define factory for {@link Author} model.
 *
 * @param options
 * @returns factory {@link AuthorFactoryInterface}
 */
export function defineAuthorFactory<
  _DefaultFieldsResolver extends DefaultFieldsResolver<Author>,
  _Traits extends Traits<Author, {}>,
>(
  options: AuthorFactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
): AuthorFactoryInterface<{}, _DefaultFieldsResolver, _Traits> {
  return defineAuthorFactoryInternal(options);
}

// ---------- User ----------

export type UserFactoryDefineOptions<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<User & TransientFields>,
  _Traits extends Traits<User, TransientFields>,
> = TypeFactoryDefineOptions<User, TransientFields, _DefaultFieldsResolver, _Traits>;
export type UserFactoryInterface<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<User & TransientFields>,
  _Traits extends Traits<User, TransientFields>,
> = TypeFactoryInterface<User, TransientFields, _DefaultFieldsResolver, _Traits>;

export function defineUserFactoryInternal<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<User & TransientFields>,
  _Traits extends Traits<User, TransientFields>,
>(
  options: UserFactoryDefineOptions<TransientFields, _DefaultFieldsResolver, _Traits>,
): UserFactoryInterface<TransientFields, _DefaultFieldsResolver, _Traits> {
  return defineTypeFactoryInternal(UserFieldNames, options);
}

/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export function defineUserFactory<
  _DefaultFieldsResolver extends DefaultFieldsResolver<User>,
  _Traits extends Traits<User, {}>,
>(
  options: UserFactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
): UserFactoryInterface<{}, _DefaultFieldsResolver, _Traits> {
  return defineUserFactoryInternal(options);
}

// ---------- Image ----------

export type ImageFactoryDefineOptions<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Image & TransientFields>,
  _Traits extends Traits<Image, TransientFields>,
> = TypeFactoryDefineOptions<Image, TransientFields, _DefaultFieldsResolver, _Traits>;
export type ImageFactoryInterface<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Image & TransientFields>,
  _Traits extends Traits<Image, TransientFields>,
> = TypeFactoryInterface<Image, TransientFields, _DefaultFieldsResolver, _Traits>;

export function defineImageFactoryInternal<
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Image & TransientFields>,
  _Traits extends Traits<Image, TransientFields>,
>(
  options: ImageFactoryDefineOptions<TransientFields, _DefaultFieldsResolver, _Traits>,
): ImageFactoryInterface<TransientFields, _DefaultFieldsResolver, _Traits> {
  return defineTypeFactoryInternal(ImageFieldNames, options);
}

/**
 * Define factory for {@link Image} model.
 *
 * @param options
 * @returns factory {@link ImageFactoryInterface}
 */
export function defineImageFactory<
  _DefaultFieldsResolver extends DefaultFieldsResolver<Image>,
  _Traits extends Traits<Image, {}>,
>(
  options: ImageFactoryDefineOptions<{}, _DefaultFieldsResolver, _Traits>,
): ImageFactoryInterface<{}, _DefaultFieldsResolver, _Traits> {
  return defineImageFactoryInternal(options);
}

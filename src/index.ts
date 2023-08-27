import {
  type ResolvedFields,
  type DefaultFieldsResolver,
  type InputFieldsResolver,
  resolveFields,
  lazy,
} from './field-resolver.js';
import { getSequenceCounter, resetSequence, resetAllSequence } from './sequence.js';
import { type Merge } from './util.js';

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
const BookFieldNames = ['id', 'title', 'author'] as const;
const AuthorFieldNames = ['id', 'name', 'books'] as const;
const UserFieldNames = ['id', 'firstName', 'lastName', 'fullName'] as const;

// ---------- Book ----------

export interface BookFactoryDefineOptions<TransientFields extends Record<string, unknown>> {
  defaultFields: DefaultFieldsResolver<Book, TransientFields>;
}
export interface BookFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends BookFactoryDefineOptions<TransientFields>,
> {
  build(): Promise<ResolvedFields<Options['defaultFields']>>;
  build<const T extends InputFieldsResolver<Book, TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<Options['defaultFields']>, ResolvedFields<T>>, keyof Book>>;
  resetSequence(): void;
}

function defineBookFactoryInternal<
  TransientFields extends Record<string, unknown>,
  Options extends BookFactoryDefineOptions<TransientFields>,
>({ defaultFields: defaultFieldsResolver }: Options): BookFactoryInterface<TransientFields, Options> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Book, TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<Options['defaultFields']>, Pick<ResolvedFields<T>, keyof Book>>> {
      const seq = getSeq();
      return resolveFields(BookFieldNames, seq, defaultFieldsResolver, inputFieldsResolver ?? ({} as T));
    },
    resetSequence() {
      resetSequence(seqKey);
    },
  };
}

/**
 * Define factory for {@link Book} model.
 *
 * @param options
 * @returns factory {@link BookFactoryInterface}
 */
export function defineBookFactory<Options extends BookFactoryDefineOptions<{}>>(
  options: Options,
): BookFactoryInterface<{}, Options> {
  return defineBookFactoryInternal(options);
}

// ---------- Author ----------

export interface AuthorFactoryDefineOptions<TransientFields extends Record<string, unknown>> {
  defaultFields: DefaultFieldsResolver<Author, TransientFields>;
}
export interface AuthorFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends AuthorFactoryDefineOptions<TransientFields>,
> {
  build(): Promise<ResolvedFields<Options['defaultFields']>>;
  build<const T extends InputFieldsResolver<Author, TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<Options['defaultFields']>, ResolvedFields<T>>, keyof Author>>;
  resetSequence(): void;
}

function defineAuthorFactoryInternal<
  TransientFields extends Record<string, unknown>,
  Options extends AuthorFactoryDefineOptions<TransientFields>,
>({ defaultFields: defaultFieldsResolver }: Options): AuthorFactoryInterface<TransientFields, Options> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Author, TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<Options['defaultFields']>, Pick<ResolvedFields<T>, keyof Author>>> {
      const seq = getSeq();
      return resolveFields(AuthorFieldNames, seq, defaultFieldsResolver, inputFieldsResolver ?? ({} as T));
    },
    resetSequence() {
      resetSequence(seqKey);
    },
  };
}

/**
 * Define factory for {@link Author} model.
 *
 * @param options
 * @returns factory {@link AuthorFactoryInterface}
 */
export function defineAuthorFactory<Options extends AuthorFactoryDefineOptions<{}>>(
  options: Options,
): AuthorFactoryInterface<{}, Options> {
  return defineAuthorFactoryInternal(options);
}

// ---------- User ----------

export interface UserFactoryDefineOptions<TransientFields extends Record<string, unknown>> {
  defaultFields: DefaultFieldsResolver<User, TransientFields>;
}
export interface UserFactoryInterface<
  TransientFields extends Record<string, unknown>,
  Options extends UserFactoryDefineOptions<TransientFields>,
> {
  build(): Promise<ResolvedFields<Options['defaultFields']>>;
  build<const T extends InputFieldsResolver<User, TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<Options['defaultFields']>, ResolvedFields<T>>, keyof User>>;
  resetSequence(): void;
}

function defineUserFactoryInternal<
  TransientFields extends Record<string, unknown>,
  Options extends UserFactoryDefineOptions<TransientFields>,
>({ defaultFields: defaultFieldsResolver }: Options): UserFactoryInterface<TransientFields, Options> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<User, TransientFields>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<Options['defaultFields']>, Pick<ResolvedFields<T>, keyof User>>> {
      const seq = getSeq();
      return resolveFields(UserFieldNames, seq, defaultFieldsResolver, inputFieldsResolver ?? ({} as T));
    },
    resetSequence() {
      resetSequence(seqKey);
    },
  };
}

/**
 * Define factory for {@link User} model.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export function defineUserFactory<Options extends UserFactoryDefineOptions<{}>>(
  options: Options,
): UserFactoryInterface<{}, Options> {
  return defineUserFactoryInternal(options);
}

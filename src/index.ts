import {
  type ResolvedFields,
  type DefaultFieldsResolver,
  type TransientFieldsResolver,
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

// ---------- Book ----------

interface BookFactoryDefineOptions<TransientFields extends Record<string, unknown>> {
  defaultFields: DefaultFieldsResolver<Book, TransientFields>;
  // TODO: add transientFields to here
}
interface BookFactoryInterface<
  TransientFields extends Record<string, unknown>,
  TOptions extends BookFactoryDefineOptions<TransientFields>,
> {
  build(): Promise<ResolvedFields<TOptions['defaultFields']>>;
  build<const T extends InputFieldsResolver<Book, TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>, keyof Book>>;
  resetSequence(): void;
}

function defineBookFactoryInternal<
  _TransientFieldsResolver extends TransientFieldsResolver<Book, Record<string, unknown>>,
  TOptions extends BookFactoryDefineOptions<ResolvedFields<_TransientFieldsResolver>>,
>(
  transientFieldsResolver: _TransientFieldsResolver,
  { defaultFields: defaultFieldsResolver }: TOptions,
): BookFactoryInterface<ResolvedFields<_TransientFieldsResolver>, TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Book, ResolvedFields<_TransientFieldsResolver>>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, Pick<ResolvedFields<T>, keyof Book>>> {
      const seq = getSeq();
      return resolveFields(seq, defaultFieldsResolver, transientFieldsResolver ?? {}, inputFieldsResolver ?? ({} as T));
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
export function defineBookFactory<TOptions extends BookFactoryDefineOptions<{}>>(
  options: TOptions,
): BookFactoryInterface<{}, TOptions> {
  return defineBookFactoryInternal({}, options);
}

/**
 * Define factory for {@link Book} model with transient fields.
 *
 * @param options
 * @returns factory {@link BookFactoryInterface}
 */
export function defineBookFactoryWithTransientFields<
  _TransientFieldsResolver extends TransientFieldsResolver<Book, Record<string, unknown>>,
  TOptions extends BookFactoryDefineOptions<ResolvedFields<_TransientFieldsResolver>>,
>(
  transientFields: _TransientFieldsResolver,
  options: TOptions,
): BookFactoryInterface<ResolvedFields<_TransientFieldsResolver>, TOptions> {
  return defineBookFactoryInternal(transientFields, options);
}

// ---------- Author ----------

interface AuthorFactoryDefineOptions<TransientFields extends Record<string, unknown>> {
  defaultFields: DefaultFieldsResolver<Author, TransientFields>;
  // TODO: add transientFields to here
}
interface AuthorFactoryInterface<
  TransientFields extends Record<string, unknown>,
  TOptions extends AuthorFactoryDefineOptions<TransientFields>,
> {
  build(): Promise<ResolvedFields<TOptions['defaultFields']>>;
  build<const T extends InputFieldsResolver<Author, TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>, keyof Author>>;
  resetSequence(): void;
}

function defineAuthorFactoryInternal<
  _TransientFieldsResolver extends TransientFieldsResolver<Author, Record<string, unknown>>,
  TOptions extends AuthorFactoryDefineOptions<ResolvedFields<_TransientFieldsResolver>>,
>(
  transientFieldsResolver: _TransientFieldsResolver,
  { defaultFields: defaultFieldsResolver }: TOptions,
): AuthorFactoryInterface<ResolvedFields<_TransientFieldsResolver>, TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Author, ResolvedFields<_TransientFieldsResolver>>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, Pick<ResolvedFields<T>, keyof Author>>> {
      const seq = getSeq();
      return resolveFields(seq, defaultFieldsResolver, transientFieldsResolver ?? {}, inputFieldsResolver ?? ({} as T));
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
export function defineAuthorFactory<TOptions extends AuthorFactoryDefineOptions<{}>>(
  options: TOptions,
): AuthorFactoryInterface<{}, TOptions> {
  return defineAuthorFactoryInternal({}, options);
}

/**
 * Define factory for {@link Author} model with transient fields.
 *
 * @param options
 * @returns factory {@link AuthorFactoryInterface}
 */
export function defineAuthorFactoryWithTransientFields<
  _TransientFieldsResolver extends TransientFieldsResolver<Author, Record<string, unknown>>,
  TOptions extends AuthorFactoryDefineOptions<ResolvedFields<_TransientFieldsResolver>>,
>(
  transientFields: _TransientFieldsResolver,
  options: TOptions,
): AuthorFactoryInterface<ResolvedFields<_TransientFieldsResolver>, TOptions> {
  return defineAuthorFactoryInternal(transientFields, options);
}

// ---------- User ----------

interface UserFactoryDefineOptions<TransientFields extends Record<string, unknown>> {
  defaultFields: DefaultFieldsResolver<User, TransientFields>;
  // TODO: add transientFields to here
}
interface UserFactoryInterface<
  TransientFields extends Record<string, unknown>,
  TOptions extends UserFactoryDefineOptions<TransientFields>,
> {
  build(): Promise<ResolvedFields<TOptions['defaultFields']>>;
  build<const T extends InputFieldsResolver<User, TransientFields>>(
    inputFieldsResolver: T,
  ): Promise<Pick<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>, keyof User>>;
  resetSequence(): void;
}

function defineUserFactoryInternal<
  _TransientFieldsResolver extends TransientFieldsResolver<User, Record<string, unknown>>,
  TOptions extends UserFactoryDefineOptions<ResolvedFields<_TransientFieldsResolver>>,
>(
  transientFieldsResolver: _TransientFieldsResolver,
  { defaultFields: defaultFieldsResolver }: TOptions,
): UserFactoryInterface<ResolvedFields<_TransientFieldsResolver>, TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<User, ResolvedFields<_TransientFieldsResolver>>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, Pick<ResolvedFields<T>, keyof User>>> {
      const seq = getSeq();
      return resolveFields(seq, defaultFieldsResolver, transientFieldsResolver ?? {}, inputFieldsResolver ?? ({} as T));
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
export function defineUserFactory<TOptions extends UserFactoryDefineOptions<{}>>(
  options: TOptions,
): UserFactoryInterface<{}, TOptions> {
  return defineUserFactoryInternal({}, options);
}

/**
 * Define factory for {@link User} model with transient fields.
 *
 * @param options
 * @returns factory {@link UserFactoryInterface}
 */
export function defineUserFactoryWithTransientFields<
  _TransientFieldsResolver extends TransientFieldsResolver<User, Record<string, unknown>>,
  TOptions extends UserFactoryDefineOptions<ResolvedFields<_TransientFieldsResolver>>,
>(
  transientFields: _TransientFieldsResolver,
  options: TOptions,
): UserFactoryInterface<ResolvedFields<_TransientFieldsResolver>, TOptions> {
  return defineUserFactoryInternal(transientFields, options);
}

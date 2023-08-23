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

// ---------- Book ----------

interface BookFactoryDefineOptions {
  defaultFields: DefaultFieldsResolver<Book>;
}
interface BookFactoryInterface<TOptions extends BookFactoryDefineOptions> {
  build(): Promise<ResolvedFields<TOptions['defaultFields']>>;
  build<const T extends InputFieldsResolver<Book>>(
    inputFieldsResolver: T,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>>;
  resetSequence(): void;
}

function defineBookFactoryInternal<TOptions extends BookFactoryDefineOptions>({
  defaultFields: defaultFieldsResolver,
}: TOptions): BookFactoryInterface<TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Book>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>> {
      const seq = getSeq();
      return resolveFields(seq, defaultFieldsResolver, inputFieldsResolver ?? ({} as T));
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
export function defineBookFactory<TOptions extends BookFactoryDefineOptions>(
  options: TOptions,
): BookFactoryInterface<TOptions> {
  return defineBookFactoryInternal(options);
}

// ---------- Author ----------

interface AuthorFactoryDefineOptions {
  defaultFields: DefaultFieldsResolver<Author>;
}
interface AuthorFactoryInterface<TOptions extends AuthorFactoryDefineOptions> {
  build(): Promise<ResolvedFields<TOptions['defaultFields']>>;
  build<const T extends InputFieldsResolver<Author>>(
    inputFieldsResolver: T,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>>;
  resetSequence(): void;
}

function defineAuthorFactoryInternal<TOptions extends AuthorFactoryDefineOptions>({
  defaultFields: defaultFieldsResolver,
}: TOptions): AuthorFactoryInterface<TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<Author>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>> {
      const seq = getSeq();
      return resolveFields(seq, defaultFieldsResolver, inputFieldsResolver ?? ({} as T));
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
export function defineAuthorFactory<TOptions extends AuthorFactoryDefineOptions>(
  options: TOptions,
): AuthorFactoryInterface<TOptions> {
  return defineAuthorFactoryInternal(options);
}

// ---------- User ----------

interface UserFactoryDefineOptions {
  defaultFields: DefaultFieldsResolver<User>;
}
interface UserFactoryInterface<TOptions extends UserFactoryDefineOptions> {
  build(): Promise<ResolvedFields<TOptions['defaultFields']>>;
  build<const T extends InputFieldsResolver<User>>(
    inputFieldsResolver: T,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>>;
  resetSequence(): void;
}

function defineUserFactoryInternal<TOptions extends UserFactoryDefineOptions>({
  defaultFields: defaultFieldsResolver,
}: TOptions): UserFactoryInterface<TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build<const T extends InputFieldsResolver<User>>(
      inputFieldsResolver?: T,
    ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>> {
      const seq = getSeq();
      return resolveFields(seq, defaultFieldsResolver, inputFieldsResolver ?? ({} as T));
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
export function defineUserFactory<TOptions extends UserFactoryDefineOptions>(
  options: TOptions,
): UserFactoryInterface<TOptions> {
  return defineUserFactoryInternal(options);
}

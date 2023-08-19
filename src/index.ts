import { getSequenceCounter, resetSequence, resetAllSequence } from './sequence.js';
import {
  type ResolvedFields,
  type Merge,
  type DefaultFieldsResolver,
  type InputFieldsResolver,
  resolveFields,
} from './util.js';

export { resetAllSequence };

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

interface BookFactoryDefineOptions {
  defaultFields: DefaultFieldsResolver<Book>;
}
interface BookFactoryInterface<TOptions extends BookFactoryDefineOptions> {
  build<const T extends InputFieldsResolver<Book>>(
    inputFieldResolvers: T,
    // eslint-disable-next-line @typescript-eslint/ban-types
  ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, ResolvedFields<T>>>;
  resetSequence(): void;
}

function defineBookFactoryInternal<const TOptions extends BookFactoryDefineOptions>({
  defaultFields: defaultFieldResolvers,
}: TOptions): BookFactoryInterface<TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build(inputFieldResolvers) {
      const seq = getSeq();
      const fields = await resolveFields(seq, defaultFieldResolvers, inputFieldResolvers);
      return fields;
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

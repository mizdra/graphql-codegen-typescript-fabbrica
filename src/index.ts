import { getSequenceCounter, resetSequence, resetAllSequence } from './sequence.js';
import type { DeepOptional, FieldResolver, ResolvedFields, Merge, ResolvedField } from './util.js';

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
  defaultFields: {
    [Key in keyof Book]: FieldResolver<DeepOptional<Book>[Key]>;
  };
}
interface BookFactoryInterface<TOptions extends BookFactoryDefineOptions> {
  // eslint-disable-next-line @typescript-eslint/ban-types
  build<const T extends Partial<DeepOptional<Book>> = {}>(
    inputFields?: T,
  ): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, T>>;
  resetSequence(): void;
}

async function resolveField<T extends FieldResolver<unknown>>(
  seq: number,
  fieldResolver: T,
): Promise<ResolvedField<T>> {
  if (typeof fieldResolver === 'function') {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await fieldResolver({ seq });
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fieldResolver as any;
  }
}

async function resolveFields<
  TOptions extends BookFactoryDefineOptions,
  InputFields extends Partial<DeepOptional<Book>>,
>(
  seq: number,
  defaultFieldResolvers: TOptions['defaultFields'],
  inputFields: InputFields,
): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, InputFields>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: any = {};
  for (const [key, defaultFieldResolver] of Object.entries(defaultFieldResolvers)) {
    if (key in inputFields) {
      fields[key] = inputFields[key as keyof InputFields];
    } else {
      // eslint-disable-next-line no-await-in-loop
      fields[key] = await resolveField(seq, defaultFieldResolver);
    }
  }
  return fields;
}

function defineBookFactoryInternal<const TOptions extends BookFactoryDefineOptions>({
  defaultFields: defaultFieldResolvers,
}: TOptions): BookFactoryInterface<TOptions> {
  const seqKey = {};
  const getSeq = () => getSequenceCounter(seqKey);
  return {
    async build(inputFields) {
      const seq = getSeq();
      const fields = await resolveFields(
        seq,
        defaultFieldResolvers,
        inputFields ?? ({} as Exclude<typeof inputFields, undefined>),
      );
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

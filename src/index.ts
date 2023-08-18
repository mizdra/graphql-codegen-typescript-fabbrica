import type { DeepOptional, FieldResolver, ResolvedFields, Merge, ResolvedField } from './util.js';

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
}

async function resolveField<T extends FieldResolver<unknown>>(fieldResolver: T): Promise<ResolvedField<T>> {
  if (typeof fieldResolver === 'function') {
    // eslint-disable-next-line @typescript-eslint/return-await
    return await fieldResolver();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return fieldResolver as any;
  }
}

async function resolveFields<
  TOptions extends BookFactoryDefineOptions,
  InputFields extends Partial<DeepOptional<Book>>,
>(
  defaultFieldResolvers: TOptions['defaultFields'],
  inputFields: InputFields,
): Promise<Merge<ResolvedFields<TOptions['defaultFields']>, InputFields>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: any = {};
  for (const [key, defaultFieldResolver] of Object.entries(defaultFieldResolvers)) {
    // eslint-disable-next-line no-await-in-loop
    fields[key] = key in inputFields ? inputFields[key as keyof InputFields] : await resolveField(defaultFieldResolver);
  }
  return fields;
}

function defineBookFactoryInternal<const TOptions extends BookFactoryDefineOptions>({
  defaultFields: defaultFieldResolvers,
}: TOptions): BookFactoryInterface<TOptions> {
  return {
    async build(inputFields) {
      const fields = await resolveFields(
        defaultFieldResolvers,
        inputFields ?? ({} as Exclude<typeof inputFields, undefined>),
      );
      return fields;
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

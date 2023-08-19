import { DeepOptional, Merge } from './util.js';

export class Lazy<T> {
  constructor(private readonly factory: (options: FieldResolverOptions) => T | Promise<T>) {}
  async get(options: FieldResolverOptions): Promise<T> {
    return this.factory(options);
  }
}
/** Wrapper to delay field generation until needed. */
export function lazy<T>(factory: (options: FieldResolverOptions) => T | Promise<T>): Lazy<T> {
  return new Lazy(factory);
}

export type FieldResolverOptions = {
  seq: number;
};
export type FieldResolver<Field> = Field | Lazy<Field>;

/** The type of `inputFields` option of `build` method. */
export type InputFieldsResolver<Type> = {
  [Key in keyof Type]?: FieldResolver<DeepOptional<Type>[Key]>;
};

/** The type of `defaultFields` option of `defineFactory` function. */
export type DefaultFieldsResolver<Type> = {
  [Key in keyof Type]: FieldResolver<DeepOptional<Type>[Key]>;
};

export type ResolvedField<T extends FieldResolver<unknown>> = T extends FieldResolver<infer R> ? R : never;

/** Convert `{ a: number, b: () => number, c: () => Promise<number> }` into `{ a: number, b: number, c: number }`. */
export type ResolvedFields<FieldsResolver extends Record<string, FieldResolver<unknown>>> = {
  [FieldName in keyof FieldsResolver]: ResolvedField<FieldsResolver[FieldName]>;
};
async function resolveField<T>(seq: number, fieldResolver: FieldResolver<T>): Promise<T> {
  if (fieldResolver instanceof Lazy) {
    return fieldResolver.get({ seq });
  } else {
    return fieldResolver;
  }
}

export async function resolveFields<
  _DefaultFieldsResolver extends DefaultFieldsResolver<unknown>,
  _InputFieldResolvers extends InputFieldsResolver<unknown>,
>(
  seq: number,
  defaultFieldResolvers: _DefaultFieldsResolver,
  inputFieldResolvers: _InputFieldResolvers,
): Promise<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<_InputFieldResolvers>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fields: any = {};
  for (const [key, defaultFieldResolver] of Object.entries(defaultFieldResolvers)) {
    if (key in inputFieldResolvers) {
      // eslint-disable-next-line no-await-in-loop
      fields[key] = await resolveField(seq, inputFieldResolvers[key as keyof _InputFieldResolvers]);
    } else {
      // eslint-disable-next-line no-await-in-loop
      fields[key] = await resolveField(seq, defaultFieldResolver);
    }
  }
  return fields;
}

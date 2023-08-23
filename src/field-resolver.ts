import { DeepOptional, DeepReadonly, Merge } from './util.js';

export type FieldResolverOptions<Type> = {
  seq: number;
  get: <FieldName extends keyof Type>(fieldName: FieldName) => Promise<Type[FieldName]>;
};

export class Lazy<Type, Field> {
  constructor(private readonly factory: (options: FieldResolverOptions<Type>) => Field | Promise<Field>) {}
  async get(options: FieldResolverOptions<Type>): Promise<Field> {
    return this.factory(options);
  }
}
/** Wrapper to delay field generation until needed. */
export function lazy<Type, Field>(
  factory: (options: FieldResolverOptions<Type>) => Field | Promise<Field>,
): Lazy<Type, Field> {
  return new Lazy(factory);
}

export type FieldResolver<Type, Field> = Field | Lazy<Type, Field>;
/** The type of `defaultFields` option of `defineFactory` function. */
export type DefaultFieldsResolver<Type> = {
  [FieldName in keyof Type]: FieldResolver<Type, DeepReadonly<DeepOptional<Type>[FieldName]>>;
};
/** The type of `inputFields` option of `build` method. */
export type InputFieldsResolver<Type> = {
  [FieldName in keyof Type]?: FieldResolver<Type, DeepReadonly<DeepOptional<Type>[FieldName]>>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type ResolvedField<T extends FieldResolver<unknown, unknown>> = T extends FieldResolver<infer _, infer R>
  ? R
  : never;
/** Convert `{ a: number, b: () => number, c: () => Promise<number> }` into `{ a: number, b: number, c: number }`. */
export type ResolvedFields<FieldsResolver extends Record<string, FieldResolver<unknown, unknown>>> = {
  [FieldName in keyof FieldsResolver]: ResolvedField<FieldsResolver[FieldName]>;
};

export async function resolveFields<
  Type extends Record<string, unknown>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Type> = DefaultFieldsResolver<Type>,
  _InputFieldsResolver extends InputFieldsResolver<Type> = InputFieldsResolver<Type>,
>(
  seq: number,
  defaultFieldsResolver: _DefaultFieldsResolver,
  inputFieldsResolver: _InputFieldsResolver,
): Promise<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<_InputFieldsResolver>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  const fields: any = {};

  async function resolveField<Field>(
    options: FieldResolverOptions<Type>,
    fieldResolver: FieldResolver<Type, Field>,
  ): Promise<Field> {
    if (fieldResolver instanceof Lazy) {
      return fieldResolver.get(options);
    } else {
      return fieldResolver;
    }
  }

  async function resolveFieldAndUpdateCache<FieldName extends keyof Type>(
    fieldName: FieldName,
  ): Promise<Type[FieldName]> {
    if (fieldName in fields) return fields[fieldName];

    if (fieldName in inputFieldsResolver) {
      // eslint-disable-next-line require-atomic-updates, no-await-in-loop -- The fields are resolved sequentially, so there is no possibility of a race condition.
      fields[fieldName] = await resolveField(options, inputFieldsResolver[fieldName]);
    } else {
      // eslint-disable-next-line require-atomic-updates, no-await-in-loop -- The fields are resolved sequentially, so there is no possibility of a race condition.
      fields[fieldName] = await resolveField(options, defaultFieldsResolver[fieldName]);
    }
    return fields[fieldName];
  }

  const options: FieldResolverOptions<Type> = {
    seq,
    get: resolveFieldAndUpdateCache,
  };

  for (const fieldName of Object.keys(defaultFieldsResolver) as (keyof Type)[]) {
    // eslint-disable-next-line no-await-in-loop
    await resolveFieldAndUpdateCache(fieldName);
  }

  return fields;
}

import { DeepOptional, DeepReadonly, Merge } from './util.js';

export type FieldResolverOptions<TypeWithTransientFields> = {
  seq: number;
  get: <FieldName extends keyof TypeWithTransientFields>(
    fieldName: FieldName,
  ) => Promise<TypeWithTransientFields[FieldName]>; // FIXME: return type is wrong
};

export class Lazy<TypeWithTransientFields, Field> {
  constructor(
    private readonly factory: (options: FieldResolverOptions<TypeWithTransientFields>) => Field | Promise<Field>,
  ) {}
  async get(options: FieldResolverOptions<TypeWithTransientFields>): Promise<Field> {
    return this.factory(options);
  }
}
/** Wrapper to delay field generation until needed. */
export function lazy<TypeWithTransientFields, Field>(
  factory: (options: FieldResolverOptions<TypeWithTransientFields>) => Field | Promise<Field>,
): Lazy<TypeWithTransientFields, Field> {
  return new Lazy(factory);
}

export type FieldResolver<TypeWithTransientFields, Field> = Field | Lazy<TypeWithTransientFields, Field>;
/** The type of `defaultFields` option of `defineFactory` function. */
export type DefaultFieldsResolver<Type, TransientFields> = {
  [FieldName in keyof Type]: FieldResolver<Type & TransientFields, DeepReadonly<DeepOptional<Type>[FieldName]>>;
};
/** The type of `transientFields` option of `defineFactory` function. */
export type TransientFieldsResolver<Type, TransientFields> = {
  [FieldName in keyof TransientFields]: FieldResolver<
    Type & TransientFields,
    DeepReadonly<DeepOptional<TransientFields>[FieldName]>
  >;
};
/** The type of `inputFields` option of `build` method. */
export type InputFieldsResolver<Type, TransientFields> = {
  [FieldName in keyof (Type & TransientFields)]?: FieldResolver<
    Type & TransientFields,
    DeepReadonly<DeepOptional<Type & TransientFields>[FieldName]>
  >;
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
  TransientFields extends Record<string, unknown>,
  _TransientFieldsResolver extends TransientFieldsResolver<Type, TransientFields>,
  _DefaultFieldsResolver extends DefaultFieldsResolver<Type, TransientFields>,
  _InputFieldsResolver extends InputFieldsResolver<Type, TransientFields>,
>(
  seq: number,
  defaultFieldsResolver: _DefaultFieldsResolver,
  transientFieldsResolver: _TransientFieldsResolver,
  inputFieldsResolver: _InputFieldsResolver,
): Promise<Merge<ResolvedFields<_DefaultFieldsResolver>, Pick<ResolvedFields<_InputFieldsResolver>, keyof Type>>> {
  type TypeWithTransientFields = Type & TransientFields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  const fields = {} as any;

  async function resolveField<
    _FieldResolverOptions extends FieldResolverOptions<TypeWithTransientFields>,
    _FieldResolver extends FieldResolver<TypeWithTransientFields, unknown>,
  >(options: _FieldResolverOptions, fieldResolver: _FieldResolver): Promise<ResolvedField<_FieldResolver>> {
    if (fieldResolver instanceof Lazy) {
      return fieldResolver.get(options);
    } else {
      return fieldResolver as ResolvedField<_FieldResolver>;
    }
  }

  async function resolveFieldAndUpdateCache<FieldName extends keyof TypeWithTransientFields>(
    fieldName: FieldName,
  ): Promise<(ResolvedFields<_DefaultFieldsResolver> & ResolvedFields<_InputFieldsResolver>)[FieldName]> {
    if (fieldName in fields) return fields[fieldName];

    const fieldResolver =
      fieldName in inputFieldsResolver
        ? inputFieldsResolver[fieldName as keyof _InputFieldsResolver]
        : fieldName in transientFieldsResolver
        ? transientFieldsResolver[fieldName as keyof _TransientFieldsResolver]
        : defaultFieldsResolver[fieldName as keyof _DefaultFieldsResolver];

    // eslint-disable-next-line require-atomic-updates
    fields[fieldName] = await resolveField(options, fieldResolver);
    return fields[fieldName];
  }

  const options: FieldResolverOptions<TypeWithTransientFields> = {
    seq,
    // @ts-expect-error -- FIXME: return type is wrong
    get: resolveFieldAndUpdateCache,
  };

  for (const fieldName of Object.keys(defaultFieldsResolver) as (keyof Type)[]) {
    // eslint-disable-next-line no-await-in-loop
    await resolveFieldAndUpdateCache(fieldName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  return Object.fromEntries(Object.entries(fields).filter(([key]) => key in defaultFieldsResolver)) as any;
}

import type { DeepReadonly, Merge } from './util.js';

export type FieldResolverOptions<TypeWithTransientFields> = {
  seq: number;
  get: <FieldName extends keyof TypeWithTransientFields>(
    fieldName: FieldName,
  ) => Promise<DeepReadonly<TypeWithTransientFields[FieldName]> | undefined>;
};

export class Dynamic<TypeWithTransientFields, Field> {
  constructor(
    private readonly factory: (options: FieldResolverOptions<TypeWithTransientFields>) => Field | Promise<Field>,
  ) {}
  async get(options: FieldResolverOptions<TypeWithTransientFields>): Promise<Field> {
    return this.factory(options);
  }
}
/** Wrapper to delay field generation until needed. */
export function dynamic<TypeWithTransientFields, Field>(
  factory: (options: FieldResolverOptions<TypeWithTransientFields>) => Field | Promise<Field>,
): Dynamic<TypeWithTransientFields, Field> {
  return new Dynamic(factory);
}

export type FieldResolver<TypeWithTransientFields, Field> = Field | Dynamic<TypeWithTransientFields, Field>;

/** The type of `defaultFields` or `inputFields` option. */
export type FieldsResolver<TypeWithTransientFields> = {
  [FieldName in keyof TypeWithTransientFields]?: FieldResolver<
    TypeWithTransientFields,
    DeepReadonly<TypeWithTransientFields[FieldName]>
  >;
};

export type ResolvedField<T extends FieldResolver<unknown, unknown>> =
  T extends FieldResolver<infer _, infer R> ? R : never;
/** Convert `{ a: number, b: () => number, c: () => Promise<number> }` into `{ a: number, b: number, c: number }`. */
export type ResolvedFields<FieldsResolver extends Record<string, FieldResolver<unknown, unknown>>> = {
  [FieldName in keyof FieldsResolver]: ResolvedField<FieldsResolver[FieldName]>;
};

export async function resolveFields<
  Type extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<Type & TransientFields>,
  _InputFieldsResolver extends FieldsResolver<Type & TransientFields>,
>(
  transientFieldNames: (keyof TransientFields)[],
  seq: number,
  defaultFieldsResolver: _DefaultFieldsResolver,
  inputFieldsResolver: _InputFieldsResolver,
): Promise<
  Omit<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<_InputFieldsResolver>>, keyof TransientFields>
> {
  type TypeWithTransientFields = Type & TransientFields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  const fields = {} as any;

  async function resolveField<
    _FieldResolverOptions extends FieldResolverOptions<TypeWithTransientFields>,
    _FieldResolver extends FieldResolver<TypeWithTransientFields, unknown>,
  >(options: _FieldResolverOptions, fieldResolver: _FieldResolver): Promise<ResolvedField<_FieldResolver>> {
    if (fieldResolver instanceof Dynamic) {
      return fieldResolver.get(options);
    } else {
      return fieldResolver as ResolvedField<_FieldResolver>;
    }
  }

  async function resolveFieldAndUpdateCache<FieldName extends keyof TypeWithTransientFields>(
    fieldName: FieldName,
  ): Promise<DeepReadonly<TypeWithTransientFields[FieldName]> | undefined> {
    if (fieldName in fields) return fields[fieldName];

    let fieldResolver: FieldResolver<Type & TransientFields, unknown>;
    if (fieldName in inputFieldsResolver) {
      fieldResolver = inputFieldsResolver[fieldName as keyof _InputFieldsResolver];
    } else if (fieldName in defaultFieldsResolver) {
      fieldResolver = defaultFieldsResolver[fieldName as keyof _DefaultFieldsResolver];
    } else {
      return undefined;
    }

    // eslint-disable-next-line require-atomic-updates
    fields[fieldName] = await resolveField(options, fieldResolver);
    return fields[fieldName];
  }

  const options: FieldResolverOptions<TypeWithTransientFields> = {
    seq,
    get: resolveFieldAndUpdateCache,
  };

  for (const fieldName of [...Object.keys(defaultFieldsResolver), ...Object.keys(inputFieldsResolver)]) {
    // eslint-disable-next-line no-await-in-loop
    await resolveFieldAndUpdateCache(fieldName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  return Object.fromEntries(Object.entries(fields).filter(([key]) => !transientFieldNames.includes(key))) as any;
}

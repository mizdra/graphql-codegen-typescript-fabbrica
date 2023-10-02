import { DeepReadonly, Merge, StrictlyPick } from './util.js';

export type FieldResolverOptions<OptionalTypeWithTransientFields> = {
  seq: number;
  get: <FieldName extends keyof OptionalTypeWithTransientFields>(
    fieldName: FieldName,
  ) => Promise<DeepReadonly<OptionalTypeWithTransientFields[FieldName]> | undefined>;
};

export class Dynamic<OptionalTypeWithTransientFields, Field> {
  constructor(
    private readonly factory: (
      options: FieldResolverOptions<OptionalTypeWithTransientFields>,
    ) => Field | Promise<Field>,
  ) {}
  async get(options: FieldResolverOptions<OptionalTypeWithTransientFields>): Promise<Field> {
    return this.factory(options);
  }
}
/** Wrapper to delay field generation until needed. */
export function dynamic<OptionalTypeWithTransientFields, Field>(
  factory: (options: FieldResolverOptions<OptionalTypeWithTransientFields>) => Field | Promise<Field>,
): Dynamic<OptionalTypeWithTransientFields, Field> {
  return new Dynamic(factory);
}

export type FieldResolver<OptionalTypeWithTransientFields, Field> =
  | Field
  | Dynamic<OptionalTypeWithTransientFields, Field>;

/** The type of `defaultFields` or `inputFields` option. */
export type FieldsResolver<OptionalTypeWithTransientFields> = {
  [FieldName in keyof OptionalTypeWithTransientFields]?: FieldResolver<
    OptionalTypeWithTransientFields,
    DeepReadonly<OptionalTypeWithTransientFields[FieldName]>
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
  OptionalType extends Record<string, unknown>,
  TransientFields extends Record<string, unknown>,
  _DefaultFieldsResolver extends FieldsResolver<OptionalType & TransientFields>,
  _InputFieldsResolver extends FieldsResolver<OptionalType & TransientFields>,
>(
  fieldNames: readonly (keyof OptionalType)[],
  seq: number,
  defaultFieldsResolver: _DefaultFieldsResolver,
  inputFieldsResolver: _InputFieldsResolver,
): Promise<
  StrictlyPick<Merge<ResolvedFields<_DefaultFieldsResolver>, ResolvedFields<_InputFieldsResolver>>, keyof OptionalType>
> {
  type OptionalTypeWithTransientFields = OptionalType & TransientFields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  const fields = {} as any;

  async function resolveField<
    _FieldResolverOptions extends FieldResolverOptions<OptionalTypeWithTransientFields>,
    _FieldResolver extends FieldResolver<OptionalTypeWithTransientFields, unknown>,
  >(options: _FieldResolverOptions, fieldResolver: _FieldResolver): Promise<ResolvedField<_FieldResolver>> {
    if (fieldResolver instanceof Dynamic) {
      return fieldResolver.get(options);
    } else {
      return fieldResolver as ResolvedField<_FieldResolver>;
    }
  }

  async function resolveFieldAndUpdateCache<FieldName extends keyof OptionalTypeWithTransientFields>(
    fieldName: FieldName,
  ): Promise<DeepReadonly<OptionalTypeWithTransientFields[FieldName]> | undefined> {
    if (fieldName in fields) return fields[fieldName];

    let fieldResolver: FieldResolver<OptionalType & TransientFields, unknown>;
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

  const options: FieldResolverOptions<OptionalTypeWithTransientFields> = {
    seq,
    get: resolveFieldAndUpdateCache,
  };

  for (const fieldName of fieldNames) {
    // eslint-disable-next-line no-await-in-loop
    await resolveFieldAndUpdateCache(fieldName);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Use any type as it is impossible to match types.
  return Object.fromEntries(Object.entries(fields).filter(([key]) => fieldNames.includes(key))) as any;
}

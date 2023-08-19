/** Convert `{ a: number, b: { c: number } }` into `{ a: number | undefined, b: { c: number | undefined } | undefined }`. */
export type DeepOptional<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepOptional<T[K]> | undefined : T[K] | undefined;
};

export type FieldResolverOptions = {
  seq: number;
};
export type FieldResolver<Field> =
  | Field
  | ((options: FieldResolverOptions) => Field)
  | ((options: FieldResolverOptions) => Promise<Field>);

/** The type of `inputFields` option of `build` method. */
export type InputFieldsResolver<Type> = {
  [Key in keyof Type]?: FieldResolver<DeepOptional<Type>[Key]>;
};

/** The type of `defaultFields` option of `defineFactory` function. */
export type DefaultFieldsResolver<Type> = {
  [Key in keyof Type]: FieldResolver<DeepOptional<Type>[Key]>;
};

export type ResolvedField<T extends FieldResolver<unknown>> = T extends () => Promise<infer Field>
  ? Field
  : T extends () => infer Field
  ? Field
  : T;

/** Convert `{ a: number, b: () => number, c: () => Promise<number> }` into `{ a: number, b: number, c: number }`. */
export type ResolvedFields<FieldsResolver extends Record<string, FieldResolver<unknown>>> = {
  [FieldName in keyof FieldsResolver]: ResolvedField<FieldsResolver[FieldName]>;
};

/** Convert `{ a: number, b: string }` and `{ b: boolean, c: symbol }` into `{ a: number, b: boolean, c: symbol }`. */
export type Merge<F, S> = Omit<F, keyof S> & S;

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

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

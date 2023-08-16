/** Convert `{ a: number, b: { c: number } }` into `{ a: number | undefined, b: { c: number | undefined } | undefined }`. */
export type DeepOptional<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? DeepOptional<T[K]> | undefined : T[K] | undefined;
};

export type FieldResolver<Field> = () => Promise<Field>;

/** Convert `{ a: () => number }` into `{ a: number }`. */
export type ResolvedFields<FieldsResolver> = {
  [FieldName in keyof FieldsResolver]: FieldsResolver[FieldName] extends FieldResolver<infer Field> ? Field : never;
};

/** Convert `{ a: number, b: string }` and `{ b: boolean, c: symbol }` into `{ a: number, b: boolean, c: symbol }`. */
export type Merge<F, S> = Omit<F, keyof S> & S;

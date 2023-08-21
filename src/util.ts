/** Convert `{ a: number, b: { c: number } }` into `{ a: number | undefined, b: { c: number | undefined } | undefined }`. */
export type DeepOptional<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepOptional<T[K]> | undefined // object
    : T[K] extends (infer E)[]
    ? DeepOptional<E>[] | undefined // array
    : T[K] | undefined; // other
};

/** Convert `{ a: number, b: string }` and `{ b: boolean, c: symbol }` into `{ a: number, b: boolean, c: symbol }`. */
export type Merge<F, S> = {
  [K in keyof F | keyof S]: K extends keyof S ? S[K] : K extends keyof F ? F[K] : never;
};

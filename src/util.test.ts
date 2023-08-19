import { expectType, type TypeOf } from 'ts-expect';
import { it } from 'vitest';
import { type DeepOptional, type FieldResolver, type ResolvedFields, type Merge, type ResolvedField } from './util.js';

it('DeepOptional', () => {
  type Input = { a: number; b: { c: number }; d: undefined };
  type Actual = DeepOptional<Input>;
  type Expected = { a: number | undefined; b: { c: number | undefined } | undefined; d: undefined };
  expectType<TypeOf<Actual, Expected>>(true);
});

it('FieldResolver', () => {
  expectType<TypeOf<FieldResolver<number>, number | (() => number) | (() => Promise<number>)>>(true);
  expectType<TypeOf<FieldResolver<undefined>, undefined | (() => undefined) | (() => Promise<undefined>)>>(true);
  expectType<
    TypeOf<
      FieldResolver<number | undefined>,
      (number | undefined) | (() => number | undefined) | (() => Promise<number | undefined>)
    >
  >(true);
});

it('ResolvedField', () => {
  expectType<
    TypeOf<
      ResolvedField<{ a: FieldResolver<number>; b: FieldResolver<string | undefined> }>,
      { a: number; b: string | undefined }
    >
  >(true);
});

it('ResolvedFields', () => {
  expectType<
    TypeOf<
      ResolvedFields<{
        a: FieldResolver<number>;
        b: FieldResolver<undefined>;
        c: FieldResolver<number | undefined>;
      }>,
      {
        a: number;
        b: undefined;
        c: number | undefined;
      }
    >
  >(true);
});

it('Merge', () => {
  expectType<TypeOf<Merge<{ a: number; b: string }, { b: boolean; c: symbol }>, { a: number; b: boolean; c: symbol }>>(
    true,
  );
});
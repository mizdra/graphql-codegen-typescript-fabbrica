import { expectTypeOf, it } from 'vitest';
import {
  type DeepOptional,
  type FieldResolver,
  type ResolvedFields,
  type Merge,
  type ResolvedField,
  FieldResolverOptions,
} from './util.js';

it('DeepOptional', () => {
  type Input = { a: number; b: { c: number }; d: undefined };
  type Actual = DeepOptional<Input>;
  type Expected = { a: number | undefined; b: { c: number | undefined } | undefined; d: undefined };
  expectTypeOf<Actual>().toEqualTypeOf<Expected>();
});

it('FieldResolver', () => {
  expectTypeOf<FieldResolver<number>>().toEqualTypeOf<
    number | ((options: FieldResolverOptions) => number) | ((options: FieldResolverOptions) => Promise<number>)
  >();
});

it('ResolvedField', () => {
  expectTypeOf<ResolvedField<FieldResolver<number>>>().toEqualTypeOf<number>();
});

it('ResolvedFields', () => {
  expectTypeOf<
    ResolvedFields<{
      a: FieldResolver<number>;
      b: FieldResolver<undefined>;
      c: FieldResolver<number | undefined>;
    }>
  >().toEqualTypeOf<{
    a: number;
    b: undefined;
    c: number | undefined;
  }>();
});

it('Merge', () => {
  expectTypeOf<Merge<{ a: number; b: string }, { b: boolean; c: symbol }>>().toEqualTypeOf<{
    a: number;
    b: boolean;
    c: symbol;
  }>();
});

it.todo('resolveField');
it.todo('resolveFields');

import { expect, expectTypeOf, it } from 'vitest';
import {
  type DeepOptional,
  type FieldResolver,
  type ResolvedFields,
  type Merge,
  type ResolvedField,
  Lazy,
  lazy,
} from './util.js';

it('DeepOptional', () => {
  type Input = { a: number; b: { c: number }; d: undefined };
  type Actual = DeepOptional<Input>;
  type Expected = { a: number | undefined; b: { c: number | undefined } | undefined; d: undefined };
  expectTypeOf<Actual>().toEqualTypeOf<Expected>();
});

it('Lazy', async () => {
  const lazy1 = new Lazy(({ seq }) => `Book-${seq}`);
  expect(await lazy1.get({ seq: 0 })).toBe('Book-0');

  const lazy2 = new Lazy(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(await lazy2.get({ seq: 0 })).toBe('Book-0');
});

it('lazy', async () => {
  const l1 = lazy(({ seq }) => `Book-${seq}`);
  expect(l1).instanceOf(Lazy);
  expect(await l1.get({ seq: 0 })).toBe('Book-0');

  const l2 = lazy(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(l2).instanceOf(Lazy);
  expect(await l2.get({ seq: 0 })).toBe('Book-0');
});

it('FieldResolver', () => {
  expectTypeOf<FieldResolver<number>>().toEqualTypeOf<number | Lazy<number>>();
});

it('ResolvedField', () => {
  expectTypeOf<ResolvedField<number>>().toEqualTypeOf<number>();
  expectTypeOf<ResolvedField<Lazy<number>>>().toEqualTypeOf<number>();
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

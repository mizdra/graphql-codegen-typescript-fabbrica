import { expect, expectTypeOf, it } from 'vitest';
import { type FieldResolver, type ResolvedFields, type ResolvedField, Lazy, lazy } from './field-resolver.js';

it('Lazy', async () => {
  const lazy1 = new Lazy(({ seq }) => `Book-${seq}`);
  expect(await lazy1.get({ seq: 0, get: async () => Promise.resolve() })).toBe('Book-0');

  const lazy2 = new Lazy(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(await lazy2.get({ seq: 0, get: async () => Promise.resolve() })).toBe('Book-0');
});

it('lazy', async () => {
  const l1 = lazy(({ seq }) => `Book-${seq}`);
  expect(l1).instanceOf(Lazy);
  expect(await l1.get({ seq: 0, get: async () => Promise.resolve() })).toBe('Book-0');

  const l2 = lazy(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(l2).instanceOf(Lazy);
  expect(await l2.get({ seq: 0, get: async () => Promise.resolve() })).toBe('Book-0');
});

it('FieldResolver', () => {
  type Type = { a: number };
  expectTypeOf<FieldResolver<Type, Type['a']>>().toEqualTypeOf<number | Lazy<{ a: number }, number>>();
});

it('ResolvedField', () => {
  type Type = { a: number };
  expectTypeOf<ResolvedField<number>>().toEqualTypeOf<number>();
  expectTypeOf<ResolvedField<Lazy<Type, Type['a']>>>().toEqualTypeOf<number>();
});

it('ResolvedFields', () => {
  type Type = { a: number };
  expectTypeOf<
    ResolvedFields<{
      a: FieldResolver<Type, number>;
      b: FieldResolver<Type, undefined>;
      c: FieldResolver<Type, number | undefined>;
    }>
  >().toEqualTypeOf<{
    a: number;
    b: undefined;
    c: number | undefined;
  }>();
});

it.todo('resolveFields');

import { expect, expectTypeOf, it } from 'vitest';

import type {
  FieldsResolver} from './field-resolver.js';
import {
  Dynamic,
  dynamic,
  type FieldResolver,
  type ResolvedField,
  type ResolvedFields,
} from './field-resolver.js';
import type { DeepOptional, DeepReadonly } from './util.js';

it('Dynamic', async () => {
  type TypeWithTransientFields = { id: string | undefined; a: number | undefined };
  type Field = string;
  const readonlyType: DeepReadonly<DeepOptional<TypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof TypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyType[fieldName]);

  const dynamic1 = new Dynamic<TypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(await dynamic1.get({ seq: 0, get })).toBe('Book-0');

  const dynamic2 = new Dynamic(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(await dynamic2.get({ seq: 0, get })).toBe('Book-0');
});

it('dynamic', async () => {
  type TypeWithTransientFields = { id: string | undefined; a: number | undefined };
  type Field = string;
  const readonlyType: DeepReadonly<DeepOptional<TypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof TypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyType[fieldName]);

  const l1 = dynamic<TypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(l1).instanceOf(Dynamic);
  expect(await l1.get({ seq: 0, get })).toBe('Book-0');

  const l2 = dynamic<TypeWithTransientFields, Field>(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(l2).instanceOf(Dynamic);
  expect(await l2.get({ seq: 0, get })).toBe('Book-0');
});

it('FieldResolver', () => {
  type TypeWithTransientFields = { a: number };
  expectTypeOf<FieldResolver<TypeWithTransientFields, TypeWithTransientFields['a']>>().toEqualTypeOf<
    number | Dynamic<{ a: number }, number>
  >();
});

it('FieldsResolver', () => {
  type TypeWithTransientFields = { a: number | undefined; b: OptionalSubType[] | undefined };
  type OptionalSubType = { c: number | undefined };
  expectTypeOf<FieldsResolver<TypeWithTransientFields>>().toEqualTypeOf<{
    a?: number | undefined | Dynamic<TypeWithTransientFields, number | undefined>;
    b?:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Dynamic<TypeWithTransientFields, readonly { readonly c: number | undefined }[] | undefined>;
  }>();
});

it('ResolvedField', () => {
  type TypeWithTransientFields = { a: number | undefined };
  expectTypeOf<ResolvedField<number>>().toEqualTypeOf<number>();
  expectTypeOf<ResolvedField<Dynamic<TypeWithTransientFields, TypeWithTransientFields['a']>>>().toEqualTypeOf<
    number | undefined
  >();
});

it('ResolvedFields', () => {
  type TypeWithTransientFields = { a: number | undefined };
  expectTypeOf<
    ResolvedFields<{
      a: FieldResolver<TypeWithTransientFields, number>;
      b: FieldResolver<TypeWithTransientFields, undefined>;
      c: FieldResolver<TypeWithTransientFields, number | undefined>;
    }>
  >().toEqualTypeOf<{
    a: number;
    b: undefined;
    c: number | undefined;
  }>();
});

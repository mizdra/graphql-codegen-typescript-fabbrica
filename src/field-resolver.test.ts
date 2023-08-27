import { expect, expectTypeOf, it } from 'vitest';
import {
  type FieldResolver,
  type ResolvedFields,
  type ResolvedField,
  Lazy,
  lazy,
  InputFieldsResolver,
  DefaultFieldsResolver,
} from './field-resolver.js';
import { DeepOptional, DeepReadonly } from './util.js';

it('Lazy', async () => {
  type TypeWithTransientFields = { id: string; a: number };
  type Field = string;
  const readonlyOptionalType: DeepReadonly<DeepOptional<TypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof TypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyOptionalType[fieldName]);

  const lazy1 = new Lazy<TypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(await lazy1.get({ seq: 0, get })).toBe('Book-0');

  const lazy2 = new Lazy(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(await lazy2.get({ seq: 0, get })).toBe('Book-0');
});

it('lazy', async () => {
  type TypeWithTransientFields = { id: string; a: number };
  type Field = string;
  const readonlyOptionalType: DeepReadonly<DeepOptional<TypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof TypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyOptionalType[fieldName]);

  const l1 = lazy<TypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(l1).instanceOf(Lazy);
  expect(await l1.get({ seq: 0, get })).toBe('Book-0');

  const l2 = lazy<TypeWithTransientFields, Field>(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(l2).instanceOf(Lazy);
  expect(await l2.get({ seq: 0, get })).toBe('Book-0');
});

it('FieldResolver', () => {
  type TypeWithTransientFields = { a: number };
  expectTypeOf<FieldResolver<TypeWithTransientFields, TypeWithTransientFields['a']>>().toEqualTypeOf<
    number | Lazy<{ a: number }, number>
  >();
});

it('DefaultFieldsResolver', () => {
  type Type = { a: number; b: SubType[] };
  type SubType = { c: number };
  type TransientFields = { _a: number };
  expectTypeOf<DefaultFieldsResolver<Type, TransientFields>>().toEqualTypeOf<{
    a: number | undefined | Lazy<Type & TransientFields, number | undefined>;
    b:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Lazy<Type & TransientFields, readonly { readonly c: number | undefined }[] | undefined>;
    _a: number | undefined | Lazy<Type & TransientFields, number | undefined>;
  }>();
});

it('InputFieldsResolver', () => {
  type Type = { a: number; b: SubType[] };
  type SubType = { c: number };
  type TransientFields = { _a: number };
  expectTypeOf<InputFieldsResolver<Type, TransientFields>>().toEqualTypeOf<{
    a?: number | undefined | Lazy<Type & TransientFields, number | undefined>;
    b?:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Lazy<Type & TransientFields, readonly { readonly c: number | undefined }[] | undefined>;
    _a?: number | undefined | Lazy<Type & TransientFields, number | undefined>;
  }>();
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

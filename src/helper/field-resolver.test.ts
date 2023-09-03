import { expect, expectTypeOf, it } from 'vitest';
import {
  type FieldResolver,
  type ResolvedFields,
  type ResolvedField,
  Dynamic,
  dynamic,
  InputFieldsResolver,
  DefaultFieldsResolver,
} from './field-resolver.js';
import { DeepOptional, DeepReadonly } from './util.js';

it('Dynamic', async () => {
  type TypeWithTransientFields = { id: string; a: number };
  type Field = string;
  const readonlyOptionalType: DeepReadonly<DeepOptional<TypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof TypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyOptionalType[fieldName]);

  const dynamic1 = new Dynamic<TypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(await dynamic1.get({ seq: 0, get })).toBe('Book-0');

  const dynamic2 = new Dynamic(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(await dynamic2.get({ seq: 0, get })).toBe('Book-0');
});

it('dynamic', async () => {
  type TypeWithTransientFields = { id: string; a: number };
  type Field = string;
  const readonlyOptionalType: DeepReadonly<DeepOptional<TypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof TypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyOptionalType[fieldName]);

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

it('DefaultFieldsResolver', () => {
  type TypeWithTransientFields = { a: number; b: SubType[] };
  type SubType = { c: number };
  expectTypeOf<DefaultFieldsResolver<TypeWithTransientFields>>().toEqualTypeOf<{
    a: number | undefined | Dynamic<TypeWithTransientFields, number | undefined>;
    b:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Dynamic<TypeWithTransientFields, readonly { readonly c: number | undefined }[] | undefined>;
  }>();
});

it('InputFieldsResolver', () => {
  type TypeWithTransientFields = { a: number; b: SubType[] };
  type SubType = { c: number };
  expectTypeOf<InputFieldsResolver<TypeWithTransientFields>>().toEqualTypeOf<{
    a?: number | undefined | Dynamic<TypeWithTransientFields, number | undefined>;
    b?:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Dynamic<TypeWithTransientFields, readonly { readonly c: number | undefined }[] | undefined>;
  }>();
});

it('ResolvedField', () => {
  type Type = { a: number };
  expectTypeOf<ResolvedField<number>>().toEqualTypeOf<number>();
  expectTypeOf<ResolvedField<Dynamic<Type, Type['a']>>>().toEqualTypeOf<number>();
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

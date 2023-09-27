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
  type OptionalTypeWithTransientFields = { id: string | undefined; a: number | undefined };
  type Field = string;
  const readonlyOptionalType: DeepReadonly<DeepOptional<OptionalTypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof OptionalTypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyOptionalType[fieldName]);

  const dynamic1 = new Dynamic<OptionalTypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(await dynamic1.get({ seq: 0, get })).toBe('Book-0');

  const dynamic2 = new Dynamic(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(await dynamic2.get({ seq: 0, get })).toBe('Book-0');
});

it('dynamic', async () => {
  type OptionalTypeWithTransientFields = { id: string | undefined; a: number | undefined };
  type Field = string;
  const readonlyOptionalType: DeepReadonly<DeepOptional<OptionalTypeWithTransientFields>> = {
    id: '',
    a: 1,
  };
  const get = async <FieldName extends keyof OptionalTypeWithTransientFields>(fieldName: FieldName) =>
    Promise.resolve(readonlyOptionalType[fieldName]);

  const l1 = dynamic<OptionalTypeWithTransientFields, Field>(({ seq }) => `Book-${seq}`);
  expect(l1).instanceOf(Dynamic);
  expect(await l1.get({ seq: 0, get })).toBe('Book-0');

  const l2 = dynamic<OptionalTypeWithTransientFields, Field>(async ({ seq }) => Promise.resolve(`Book-${seq}`));
  expect(l2).instanceOf(Dynamic);
  expect(await l2.get({ seq: 0, get })).toBe('Book-0');
});

it('FieldResolver', () => {
  type OptionalTypeWithTransientFields = { a: number };
  expectTypeOf<FieldResolver<OptionalTypeWithTransientFields, OptionalTypeWithTransientFields['a']>>().toEqualTypeOf<
    number | Dynamic<{ a: number }, number>
  >();
});

it('DefaultFieldsResolver', () => {
  type OptionalTypeWithTransientFields = { a: number | undefined; b: OptionalSubType[] | undefined };
  type OptionalSubType = { c: number | undefined };
  expectTypeOf<DefaultFieldsResolver<OptionalTypeWithTransientFields>>().toEqualTypeOf<{
    a?: number | undefined | Dynamic<OptionalTypeWithTransientFields, number | undefined>;
    b?:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Dynamic<OptionalTypeWithTransientFields, readonly { readonly c: number | undefined }[] | undefined>;
  }>();
});

it('InputFieldsResolver', () => {
  type OptionalTypeWithTransientFields = { a: number | undefined; b: OptionalSubType[] | undefined };
  type OptionalSubType = { c: number | undefined };
  expectTypeOf<InputFieldsResolver<OptionalTypeWithTransientFields>>().toEqualTypeOf<{
    a?: number | undefined | Dynamic<OptionalTypeWithTransientFields, number | undefined>;
    b?:
      | readonly { readonly c: number | undefined }[]
      | undefined
      | Dynamic<OptionalTypeWithTransientFields, readonly { readonly c: number | undefined }[] | undefined>;
  }>();
});

it('ResolvedField', () => {
  type OptionalTypeWithTransientFields = { a: number | undefined };
  expectTypeOf<ResolvedField<number>>().toEqualTypeOf<number>();
  expectTypeOf<
    ResolvedField<Dynamic<OptionalTypeWithTransientFields, OptionalTypeWithTransientFields['a']>>
  >().toEqualTypeOf<number | undefined>();
});

it('ResolvedFields', () => {
  type OptionalTypeWithTransientFields = { a: number | undefined };
  expectTypeOf<
    ResolvedFields<{
      a: FieldResolver<OptionalTypeWithTransientFields, number>;
      b: FieldResolver<OptionalTypeWithTransientFields, undefined>;
      c: FieldResolver<OptionalTypeWithTransientFields, number | undefined>;
    }>
  >().toEqualTypeOf<{
    a: number;
    b: undefined;
    c: number | undefined;
  }>();
});

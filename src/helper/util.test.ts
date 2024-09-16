import { expectTypeOf, it } from 'vitest';

import { type DeepOptional, DeepReadonly, type Merge } from './util.js';

it('DeepOptional', () => {
  type Input = {
    a: number;
    b: { c: number };
    d: undefined;
    e: { f: number }[];
    g: ({ h: number } | undefined)[];
  };
  type Actual = DeepOptional<Input>;
  type Expected = {
    a: number | undefined;
    b: { c: number | undefined } | undefined;
    d: undefined;
    e: { f: number | undefined }[] | undefined;
    g: ({ h: number | undefined } | undefined)[] | undefined;
  };
  expectTypeOf<Actual>().toEqualTypeOf<Expected>();
});

it('DeepReadonly', () => {
  type Input = {
    a: number;
    b: { a: number };
    c: number[];
    d: { a: number }[];
  };
  type Actual = DeepReadonly<Input>;
  type Expected = {
    readonly a: number;
    readonly b: { readonly a: number };
    readonly c: readonly number[];
    readonly d: readonly { readonly a: number }[];
  };
  expectTypeOf<Actual>().toEqualTypeOf<Expected>();
});

it('Merge', () => {
  expectTypeOf<Merge<{ a: number; b: number; c: number }, { b: string; c?: string; d: string }>>().toEqualTypeOf<{
    a: number;
    b: string;
    c: number | string;
    d: string;
  }>();
});

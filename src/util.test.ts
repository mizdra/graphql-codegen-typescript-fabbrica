import { expectTypeOf, it } from 'vitest';
import { type DeepOptional, type Merge } from './util.js';

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

it('Merge', () => {
  expectTypeOf<Merge<{ a: number; b: string }, { b: boolean; c: symbol }>>().toEqualTypeOf<{
    a: number;
    b: boolean;
    c: symbol;
  }>();
});

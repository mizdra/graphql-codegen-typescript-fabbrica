import { expect, it } from 'vitest';

import { getSequenceCounter, resetAllSequence, resetSequence } from './sequence.js';

it('getSequenceCounter', () => {
  const key1 = {};
  const key2 = {};

  expect(getSequenceCounter(key1)).toBe(0);
  expect(getSequenceCounter(key1)).toBe(1);
  expect(getSequenceCounter(key1)).toBe(2);

  expect(getSequenceCounter(key2)).toBe(0);
  expect(getSequenceCounter(key2)).toBe(1);

  expect(getSequenceCounter(key1)).toBe(3);
});

it('resetSequence', () => {
  const key1 = {};
  const key2 = {};

  expect(getSequenceCounter(key1)).toBe(0);
  expect(getSequenceCounter(key1)).toBe(1);

  expect(getSequenceCounter(key2)).toBe(0);
  expect(getSequenceCounter(key2)).toBe(1);

  resetSequence(key1);

  expect(getSequenceCounter(key1)).toBe(0);
  expect(getSequenceCounter(key2)).toBe(2);
});

it('resetAllSequence', () => {
  const key1 = {};
  const key2 = {};

  expect(getSequenceCounter(key1)).toBe(0);
  expect(getSequenceCounter(key1)).toBe(1);

  expect(getSequenceCounter(key2)).toBe(0);
  expect(getSequenceCounter(key2)).toBe(1);

  resetAllSequence();

  expect(getSequenceCounter(key1)).toBe(0);
  expect(getSequenceCounter(key2)).toBe(0);
});

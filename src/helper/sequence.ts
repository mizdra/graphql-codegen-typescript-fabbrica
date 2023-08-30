let sequenceCounterMap: WeakMap<object, number> = new Map();

export function getSequenceCounter(key: object) {
  const c = sequenceCounterMap.get(key);
  if (c === undefined) {
    sequenceCounterMap.set(key, 0);
    return 0;
  }
  sequenceCounterMap.set(key, c + 1);
  return c + 1;
}

export function resetSequence(key: object) {
  sequenceCounterMap.delete(key);
}

export function resetAllSequence() {
  sequenceCounterMap = new Map();
}

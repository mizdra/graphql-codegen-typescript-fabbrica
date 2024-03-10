import { randomInt } from 'node:crypto';

export function oneOf<const T>(items: T[]): T {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return items[randomInt(items.length)]!;
}

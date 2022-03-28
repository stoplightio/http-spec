import { isPlainObject } from '@stoplight/json';
import isEqualWith = require('lodash.isequalwith');

export function entries<T = Record<string, unknown>>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];
export function entries<T = unknown>(o: T): [string, T][];
export function entries<T = unknown>(o: T): [string, T][] {
  return isPlainObject(o) ? Object.entries(o as T) : [];
}

export function isEqual(left: unknown, right: unknown) {
  return isEqualWith(left, right, (value, other, indexOrKey) => {
    if (indexOrKey === 'id') return true;
    return;
  });
}

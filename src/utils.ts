import { isPlainObject } from '@stoplight/json';

export function entries<T = Record<string, unknown>>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];
export function entries<T = unknown>(o: T): [string, T][];
export function entries<T = unknown>(o: T): [string, T][] {
  return isPlainObject(o) ? Object.entries(o as T) : [];
}

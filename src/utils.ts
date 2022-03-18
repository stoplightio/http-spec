import { hasRef, isLocalRef, isPlainObject, resolveInlineRef } from '@stoplight/json';

export const maybeResolveLocalRef = (document: unknown, target: unknown): unknown => {
  if (isPlainObject(document) && hasRef(target) && isLocalRef(target.$ref)) {
    try {
      return resolveInlineRef(document, target.$ref);
    } catch {
      return target;
    }
  }

  return target;
};

export function entries<T = Record<string, unknown>>(o: { [s: string]: T } | ArrayLike<T>): [string, T][];
export function entries<T = unknown>(o: T): [string, T][];
export function entries<T = unknown>(o: T): [string, T][] {
  return isPlainObject(o) ? Object.entries(o as T) : [];
}

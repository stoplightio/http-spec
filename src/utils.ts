import { hasRef, isLocalRef, resolveInlineRef } from '@stoplight/json';
import { Dictionary, Optional } from '@stoplight/types';
import { isObjectLike, map } from 'lodash';

export function mapToKeys<T>(collection: Optional<T[]>) {
  return map(collection, Object.keys);
}

export const isDictionary = (maybeDictionary: unknown): maybeDictionary is Dictionary<unknown> =>
  isObjectLike(maybeDictionary);

export const maybeResolveLocalRef = (document: unknown, target: unknown): unknown => {
  if (isDictionary(document) && hasRef(target) && isLocalRef(target.$ref)) {
    try {
      return resolveInlineRef(document, target.$ref);
    } catch {
      return target;
    }
  }

  return target;
};

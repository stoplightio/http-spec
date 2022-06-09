import { resolveInlineRefWithLocation } from '@stoplight/json';
import type { JsonPath } from '@stoplight/types';

import type { AvailableContext, RefResolver } from '../types';

export function inferContext(path: JsonPath): AvailableContext {
  if (path.length < 2 || path[0] !== 'paths') return 'service';
  if (path.length === 2 || path[3] === 'parameters' || path[3] === 'servers') return 'path';
  return 'operation';
}

const SHARED_COMPONENTS_KEYS = new WeakMap();

export function getSharedKey(value: object) {
  return SHARED_COMPONENTS_KEYS.get(value);
}

export function setSharedKey(value: unknown, key: string) {
  if (typeof value === 'object' && value !== null) {
    return SHARED_COMPONENTS_KEYS.set(value, key);
  }

  return false;
}

export function getComponentName($ref: string) {
  return $ref.match(/^#\/components\/([A-Za-z]+)\//)?.[1];
}

export const resolveRef: RefResolver = function (target) {
  const { value: resolved, location } = resolveInlineRefWithLocation(this.document, target.$ref);

  const context = inferContext(location);
  if (context !== null && this.context !== context) {
    this.context = context;
  }

  if (typeof resolved === 'object' && resolved !== null && context === 'service') {
    SHARED_COMPONENTS_KEYS.set(resolved, location[0] === 'components' ? location[2] : location[1]);
  }

  return resolved;
};

export const bundleResolveRef: RefResolver = function (target) {
  resolveRef.call(this, target);
  const { $refs } = this;

  return new Proxy(target, {
    get(target, key: string) {
      if (key === '$ref') {
        return $refs[target.$ref] ?? target.$ref;
      }

      return target[key];
    },
  });
};

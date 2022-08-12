import { resolveInlineRefWithLocation } from '@stoplight/json';
import type { JsonPath, Reference } from '@stoplight/types';

import type { AvailableContext, References, RefResolver } from '../types';

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

export function getComponentName(references: References, $ref: string) {
  return getResolved(references, $ref).match(/^#\/components\/([A-Za-z]+)\//)?.[1];
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
  return syncReferenceObject(target, this.references);
};

function getResolved(references: References, $ref: string) {
  const seen = new Set();
  let value = $ref;

  while (value in references) {
    if (seen.has(value)) return value;
    seen.add(value);

    const referenced = references[value];
    ({ value } = referenced);
    if (referenced.resolved) {
      break;
    }
  }

  return value;
}

export function syncReferenceObject<K extends Reference>(target: K, references: References): K {
  const { $ref } = target;
  return Object.defineProperty({ ...target }, '$ref', {
    enumerable: true,
    get() {
      return getResolved(references, $ref);
    },
    set(value) {
      references[$ref] = { value, resolved: true };
    },
  });
}

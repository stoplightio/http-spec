import { resolveInlineRefWithLocation } from '@stoplight/json';
import type { JsonPath, Optional, Reference } from '@stoplight/types';

import type { AvailableContext, References, RefResolver } from '../types';

export function inferContext(path: JsonPath): AvailableContext {
  if (path.length < 2 || path[0] !== 'paths') return 'service';
  if (path.length === 2 || path[3] === 'parameters' || path[3] === 'servers') return 'path';
  return 'operation';
}

const SHARED_COMPONENTS_KEYS = new WeakMap();

export function getSharedKey(value: object, currentKey: Optional<string>) {
  return SHARED_COMPONENTS_KEYS.get(value) ?? currentKey;
}

export function setSharedKey(value: unknown, key: string) {
  if (typeof value === 'object' && value !== null) {
    return SHARED_COMPONENTS_KEYS.set(value, key);
  }

  return false;
}

const COMPONENTS_FRAGMENT_PATTERN = /#\/components\/(?<section>[A-Za-z0-9_-]+)\//;

/**
 * Given a URI, return the name of the components sub-section indicated.  For
 * example, given `#/components/securitySchemes` returns "securitySchemes".
 * @returns the name of the components sub-section, or undefined if none is
 * present
 */
export function getComponentName(references: References, $ref: string): string | undefined {
  const uri = getResolved(references, $ref);
  const match = uri.match(COMPONENTS_FRAGMENT_PATTERN);
  return match?.groups?.['section'];
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

/**
 * Find the nearest resolved reference URI, starting with `$ref` and stepping
 * through all known references.
 * @param references all known references
 * @param startingRefUri the starting reference URI
 * @returns the first resolved reference URI, or unknown reference URI
 */
function getResolved(references: References, startingRefUri: string): string {
  const seen = new Set(); // for cycle detection

  let refUri: string = startingRefUri;
  while (refUri in references) {
    // don't follow cycles; bail out immediately
    if (seen.has(refUri)) {
      return refUri;
    }

    seen.add(refUri);

    // follow the reference one step
    const referenced = references[refUri];
    refUri = referenced.value;

    // return the first resolved reference we encounter
    if (referenced.resolved) {
      return refUri;
    }
  }

  // we've reached a completely unresolved *and* unknown reference URI
  return refUri;
}

/**
 * Replace the $ref property of `reference` with a proxy to one of the known
 * references in `references`, preserving any other properties of `reference`.
 */
export function syncReferenceObject<K extends Reference>(reference: K, references: References): K {
  const { $ref } = reference;
  return Object.defineProperty({ ...reference }, '$ref', {
    enumerable: true,
    get() {
      return getResolved(references, $ref);
    },
    set(value) {
      references[$ref] = { value, resolved: true };
    },
  });
}

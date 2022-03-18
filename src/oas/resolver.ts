import type { JsonPath } from '@stoplight/types';

import type { AvailableContext, RefResolver } from '../types';
import { resolveInlineRef } from './resolveInlineRef';

function inferContext(path: JsonPath): AvailableContext {
  if (path.length < 2 || path[0] !== 'paths') return 'service';
  if (path.length === 2 || path[3] === 'parameters' || path[3] === 'servers') return 'path';
  return 'operation';
}

const SHARED_COMPONENTS_KEYS = new WeakMap();

export function getSharedKey(value: object) {
  return SHARED_COMPONENTS_KEYS.get(value);
}

export const resolveRef: RefResolver = function (target) {
  const location: string[] = [];
  const resolved = resolveInlineRef(this.document, target.$ref, location);

  const context = inferContext(location);
  if (context !== null && this.context !== context) {
    this.context = context;
  }

  if (typeof resolved === 'object' && resolved !== null && context === 'service') {
    SHARED_COMPONENTS_KEYS.set(resolved, location[0] === 'components' ? location[2] : location[1]);
  }

  return resolved;
};

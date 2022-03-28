import { pointerToPath, resolveInlineRef } from '@stoplight/json';
import { JsonPath } from '@stoplight/types';

import { getEdge } from '../track';
import type { AvailableContext, RefResolver } from '../types';

function inferContext(path: JsonPath): AvailableContext {
  if (path.length < 2 || path[0] !== 'paths') return 'service';
  if (path.length === 2 || path[3] === 'parameters' || path[3] === 'servers') return 'path';
  return 'operation';
}

export const resolveRef: RefResolver = function (target) {
  const resolved = resolveInlineRef(this.document, target.$ref);
  const edge = (typeof resolved === 'object' && resolved !== null && getEdge(resolved)) || pointerToPath(target.$ref);

  const context = edge !== undefined ? inferContext(edge) : null;
  if (context !== null && this.context !== context) {
    this.context = context;
  }

  return resolved;
};

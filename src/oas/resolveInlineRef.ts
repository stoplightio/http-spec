import { extractSourceFromRef, isPlainObject, pointerToPath } from '@stoplight/json';
import { Dictionary } from '@stoplight/types';

function _resolveInlineRef(document: Dictionary<unknown>, ref: string, seen: unknown[], location: string[]): unknown {
  const source = extractSourceFromRef(ref);
  if (source !== null) {
    throw new ReferenceError('Cannot resolve external references');
  }

  const path = pointerToPath(ref);
  let value: unknown = document;
  for (const segment of path) {
    if ((!isPlainObject(value) && !Array.isArray(value)) || !(segment in value)) {
      throw new ReferenceError(`Could not resolve '${ref}'`);
    }

    value = value[segment];

    if (isPlainObject(value) && '$ref' in value) {
      if (seen.includes(value)) {
        // circular, let's stop
        return seen[seen.length - 1];
      }

      seen.push(value);

      if (typeof value.$ref !== 'string') {
        throw new TypeError('$ref should be a string');
      }

      location.length = 0;
      value = _resolveInlineRef(document, value.$ref, seen, location);
    } else {
      location.push(String(segment));
    }
  }

  if (seen.length === 0) {
    return value;
  }

  const sourceDocument = seen[seen.length - 1];

  if (isPlainObject(sourceDocument) && ('summary' in sourceDocument || 'description' in sourceDocument)) {
    return {
      ...(value as object),
      ...('description' in sourceDocument ? { description: sourceDocument.description } : null),
      ...('summary' in sourceDocument ? { summary: sourceDocument.summary } : null),
    };
  }

  return value;
}

export function resolveInlineRef(document: Dictionary<unknown>, ref: string, location: string[] = []): unknown {
  return _resolveInlineRef(document, ref, [], location);
}

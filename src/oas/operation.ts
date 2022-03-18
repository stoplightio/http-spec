import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, IHttpOperation } from '@stoplight/types';
import type { OpenAPIObject } from 'openapi3-ts';
import type { Spec } from 'swagger-schema-official';

import type { HttpOperationTransformer, IdGenerator } from '../types';

const DEFAULT_METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'];

export function transformOasOperations(
  document: DeepPartial<Spec | OpenAPIObject>,
  generateId: IdGenerator<typeof document>,
  transformer: HttpOperationTransformer<any>,
  methods: string[] | null = DEFAULT_METHODS,
): IHttpOperation[] {
  const paths = isPlainObject(document.paths) ? Object.keys(document.paths) : [];

  return paths.flatMap(path => {
    const value = document.paths![path];
    if (!isPlainObject(value)) return [];

    let operations = Object.keys(value);
    if (methods !== null) {
      operations = operations.filter(pathKey => methods.includes(pathKey));
    }

    return operations.map(method =>
      transformer({
        document,
        path,
        method,
        generateId,
      }),
    );
  });
}

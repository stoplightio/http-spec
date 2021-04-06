import { IHttpOperation } from '@stoplight/types';
import { flatten, get, keys, map } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { HttpOperationTransformer } from '../types';

const DEFAULT_METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'];

export function transformOasOperations(
  document: Spec | OpenAPIObject,
  transformer: HttpOperationTransformer<any>,
  methods: string[] | null = DEFAULT_METHODS,
): IHttpOperation[] {
  const paths = keys(get(document, 'paths'));

  return flatten(
    map(paths, path => {
      let operations = keys(get(document, ['paths', path]));
      if (methods !== null) {
        operations = operations.filter(pathKey => methods.includes(pathKey));
      }

      return operations.map(method =>
        transformer({
          document,
          path,
          method,
        }),
      );
    }),
  );
}

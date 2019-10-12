import { IHttpOperation } from '@stoplight/types';
import { flatten, get, keys, map } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { HttpOperationTransformer } from '../oas/types';

const methods = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'];

export function computeOasOperations(
  document: Spec | OpenAPIObject,
  transformer: HttpOperationTransformer<any>,
): IHttpOperation[] {
  const paths = keys(get(document, 'paths'));

  return flatten(
    map(paths, path =>
      keys(get(document, ['paths', path]))
        .filter(pathKey => methods.includes(pathKey))
        .map(method =>
          transformer({
            document,
            path,
            method,
          }),
        ),
    ),
  );
}

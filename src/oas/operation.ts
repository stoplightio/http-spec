import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, IHttpOperation } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type { OpenAPIObject, OperationObject, PathsObject } from 'openapi3-ts';
import type { Spec } from 'swagger-schema-official';

import { isBoolean, isString } from '../guards';
import type { Fragment, HttpOperationTransformer } from '../types';
import { TransformerContext, TranslateFunction } from '../types';
import { getExtensions } from './accessors';
import { translateToTags } from './tags';

const DEFAULT_METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'];

export function transformOasOperations<T extends Fragment & DeepPartial<Spec | OpenAPIObject>>(
  document: T,
  transformer: HttpOperationTransformer<any>,
  methods: string[] | null = DEFAULT_METHODS,
  ctx?: TransformerContext<T>,
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
        ctx,
      }),
    );
  });
}

function wipePathParams(p: string) {
  return p.replace(/({)[^}]+(?=})/g, '$1');
}

export const transformOasOperation: TranslateFunction<
  DeepPartial<OpenAPIObject> | DeepPartial<Spec>,
  [path: string, method: string],
  Omit<IHttpOperation, 'responses' | 'request' | 'servers' | 'security' | 'callbacks'>
> = function (path: string, method: string) {
  const pathObj = this.maybeResolveLocalRef(this.document?.paths?.[path]) as PathsObject;
  if (typeof pathObj !== 'object' || pathObj === null) {
    throw new Error(`Could not find ${['paths', path].join('/')} in the provided spec.`);
  }

  const operation = this.maybeResolveLocalRef(pathObj[method]) as OperationObject;
  if (!operation) {
    throw new Error(`Could not find ${['paths', path, method].join('/')} in the provided spec.`);
  }

  const reducedPath = wipePathParams(path);
  const serviceId = (this.ids.service = String(this.document['x-stoplight']?.id));
  this.ids.path = this.generateId(`http_path-${this.ids.service}-${reducedPath}`);
  const operationId = (this.ids.operation = this.generateId(`http_operation-${serviceId}-${method}-${reducedPath}`));

  this.context = 'operation';

  return {
    id: operationId,

    method,
    path,

    tags: translateToTags.call(this, operation.tags),
    extensions: getExtensions(operation),

    ...pickBy(
      {
        deprecated: operation.deprecated,
        internal: operation['x-internal'],
      },
      isBoolean,
    ),

    ...pickBy(
      {
        iid: operation.operationId,
        description: operation.description,
        summary: operation.summary,
      },
      isString,
    ),
  };
};

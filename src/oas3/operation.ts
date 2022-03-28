import { IHttpOperation } from '@stoplight/types';
import type { OpenAPIObject, OperationObject, PathsObject } from 'openapi3-ts';
import pickBy = require('lodash.pickby');

import { createContext } from '../context';
import { isNonNullable } from '../guards';
import { transformOasOperations } from '../oas';
import { getExtensions } from '../oas/accessors';
import { translateToTags } from '../oas/tags';
import type { Oas3HttpOperationTransformer } from '../oas/types';
import { maybeResolveLocalRef } from '../utils';
import { translateToCallbacks } from './transformers/callbacks';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas3Operations(document: OpenAPIObject): IHttpOperation[] {
  return transformOasOperations(document, transformOas3Operation);
}

export const transformOas3Operation: Oas3HttpOperationTransformer = ({ document, path, method }) => {
  const pathObj = maybeResolveLocalRef(document, document?.paths?.[path]) as PathsObject;
  if (typeof pathObj !== 'object' || pathObj === null) {
    throw new Error(`Could not find ${['paths', path].join('/')} in the provided spec.`);
  }

  const operation = maybeResolveLocalRef(document, pathObj[method]) as OperationObject;
  if (!operation) {
    throw new Error(`Could not find ${['paths', path, method].join('/')} in the provided spec.`);
  }

  const ctx = createContext(document);

  const httpOperation: IHttpOperation = {
    id: '?http-operation-id?',
    iid: operation.operationId,
    description: operation.description,
    deprecated: operation.deprecated,
    internal: operation['x-internal'],
    method,
    path,
    summary: operation.summary,
    responses: translateToResponses.call(ctx, operation.responses),
    request: translateToRequest.call(ctx, pathObj, operation),
    callbacks: translateToCallbacks.call(ctx, operation.callbacks),
    tags: translateToTags.call(ctx, operation.tags),
    security: translateToSecurities.call(ctx, operation.security),
    extensions: getExtensions(operation),
    servers: translateToServers.call(ctx, pathObj, operation),
  };

  return pickBy(httpOperation, isNonNullable) as IHttpOperation;
};

import { DeepPartial, IHttpOperation } from '@stoplight/types';
import type { OpenAPIObject, OperationObject, PathsObject } from 'openapi3-ts';
import pickBy = require('lodash.pickby');

import { createContext } from '../context';
import { isNonNullable } from '../guards';
import { transformOasOperations } from '../oas';
import { getExtensions } from '../oas/accessors';
import { DEFAULT_ID_GENERATOR } from '../oas/id';
import { translateToTags } from '../oas/tags';
import type { Oas3HttpOperationTransformer } from '../oas/types';
import type { IdGenerator } from '../types';
import { maybeResolveLocalRef } from '../utils';
import { translateToCallbacks } from './transformers/callbacks';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas3Operations(
  document: OpenAPIObject,
  generateId: IdGenerator<DeepPartial<OpenAPIObject>> = DEFAULT_ID_GENERATOR,
): IHttpOperation[] {
  return transformOasOperations(document, generateId, transformOas3Operation);
}

export const transformOas3Operation: Oas3HttpOperationTransformer = ({
  document,
  path,
  method,
  generateId = DEFAULT_ID_GENERATOR,
}) => {
  const pathObj = maybeResolveLocalRef(document, document?.paths?.[path]) as PathsObject;
  if (typeof pathObj !== 'object' || pathObj === null) {
    throw new Error(`Could not find ${['paths', path].join('/')} in the provided spec.`);
  }

  const operation = maybeResolveLocalRef(document, pathObj[method]) as OperationObject;
  if (!operation) {
    throw new Error(`Could not find ${['paths', path, method].join('/')} in the provided spec.`);
  }

  const ctx = createContext(document, generateId);
  ctx.generateId('http-service');

  ctx.state.enter('paths', path, method);

  const httpOperation: IHttpOperation = {
    id: ctx.generateId('http-operation'),
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

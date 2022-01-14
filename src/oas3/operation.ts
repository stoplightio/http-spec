import type { DeepPartial, IHttpOperation } from '@stoplight/types';
import pickBy from 'lodash.pickby';
import type { OpenAPIObject } from 'openapi3-ts';

import { createContext, DEFAULT_ID_GENERATOR } from '../context';
import { isNonNullable } from '../guards';
import { transformOasOperation, transformOasOperations } from '../oas';
import { resolveRef } from '../oas/resolver';
import type { Oas3HttpOperationTransformer } from '../oas/types';
import { Fragment } from '../types';
import { translateToCallbacks } from './transformers/callbacks';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas3Operations(document: DeepPartial<OpenAPIObject>): IHttpOperation[] {
  return transformOasOperations(document, transformOas3Operation);
}

export const transformOas3Operation: Oas3HttpOperationTransformer = ({ document: _document, path, method }) => {
  const ctx = createContext(_document, resolveRef, DEFAULT_ID_GENERATOR);
  const httpOperation = transformOasOperation.call(ctx, path, method);
  const pathObj = ctx.maybeResolveLocalRef(ctx.document.paths![path]) as Fragment;
  const operation = ctx.maybeResolveLocalRef(pathObj[method]) as Fragment;

  return {
    ...httpOperation,

    responses: translateToResponses.call(ctx, operation.responses),
    request: translateToRequest.call(ctx, pathObj, operation),
    security: translateToSecurities.call(ctx, operation.security),
    servers: translateToServers.call(ctx, pathObj, operation),

    ...pickBy(
      {
        callbacks: translateToCallbacks.call(ctx, operation.callbacks),
      },
      isNonNullable,
    ),
  };
};

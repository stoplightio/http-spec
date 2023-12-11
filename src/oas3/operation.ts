import { DeepPartial, IHttpOperation } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type { OpenAPIObject } from 'openapi3-ts';

import { isNonNullable } from '../guards';
import { OPERATION_CONFIG, transformOasEndpointOperation, transformOasEndpointOperations } from '../oas';
import { createContext } from '../oas/context';
import type { Oas3HttpOperationTransformer } from '../oas/types';
import { Fragment, TransformerContext } from '../types';
import { translateToCallbacks } from './transformers/callbacks';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas3Operations<T extends Fragment = DeepPartial<OpenAPIObject>>(
  document: T,
  ctx?: TransformerContext<T>,
): IHttpOperation[] {
  return transformOasEndpointOperations(document, transformOas3Operation, OPERATION_CONFIG, void 0, ctx);
}

export const transformOas3Operation: Oas3HttpOperationTransformer = ({
  document: _document,
  name,
  method,
  config,
  ctx = createContext(_document),
}) => {
  const httpOperation = transformOasEndpointOperation.call(ctx, config, name, method);
  const parentObj = ctx.maybeResolveLocalRef(ctx.document[config.documentProp]![name]) as Fragment;
  const operation = ctx.maybeResolveLocalRef(parentObj[method]) as Fragment;

  return {
    ...httpOperation,

    responses: translateToResponses.call(ctx, operation.responses),
    request: translateToRequest.call(ctx, parentObj, operation),
    security: translateToSecurities.call(ctx, operation.security, 'requirement'),
    servers: translateToServers.call(ctx, parentObj, operation),

    ...pickBy(
      {
        callbacks: translateToCallbacks.call(ctx, operation.callbacks),
      },
      isNonNullable,
    ),
  } as unknown as IHttpOperation;
};

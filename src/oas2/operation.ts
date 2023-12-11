import type { DeepPartial, IHttpOperation } from '@stoplight/types';
import type { Spec } from 'swagger-schema-official';

import { createContext } from '../oas/context';
import { OPERATION_CONFIG, transformOasEndpointOperation, transformOasEndpointOperations } from '../oas/operation';
import { Oas2HttpOperationTransformer } from '../oas/types';
import type { Fragment } from '../types';
import { TransformerContext } from '../types';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas2Operations<T extends DeepPartial<Spec> = DeepPartial<Spec>>(
  document: T,
  ctx?: TransformerContext<T>,
): IHttpOperation[] {
  return transformOasEndpointOperations(document, transformOas2Operation, OPERATION_CONFIG, void 0, ctx);
}

export const transformOas2Operation: Oas2HttpOperationTransformer = ({
  document: _document,
  name,
  method,
  config,
  ctx = createContext(_document),
}) => {
  const httpEndpointOperation = transformOasEndpointOperation.call(ctx, config, name, method);
  const parentObj = ctx.maybeResolveLocalRef(ctx.document[config.documentProp]![name]) as Fragment;
  const obj = ctx.maybeResolveLocalRef(parentObj[method]) as Fragment;

  return {
    ...httpEndpointOperation,

    responses: translateToResponses.call(ctx, obj),
    servers: translateToServers.call(ctx, obj),
    request: translateToRequest.call(ctx, parentObj, obj),
    security: translateToSecurities.call(ctx, obj.security, 'requirement'),
  } as any;
};

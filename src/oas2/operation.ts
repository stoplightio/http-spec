import type { DeepPartial, IHttpOperation } from '@stoplight/types';
import type { Spec } from 'swagger-schema-official';

import { createContext } from '../oas/context';
import { transformOasOperation, transformOasOperations } from '../oas/operation';
import { Oas2HttpOperationTransformer } from '../oas/types';
import type { Fragment } from '../types';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas2Operations(document: DeepPartial<Spec>): IHttpOperation[] {
  return transformOasOperations(document, transformOas2Operation);
}

export const transformOas2Operation: Oas2HttpOperationTransformer = ({ document: _document, path, method }) => {
  const ctx = createContext(_document);
  const httpOperation = transformOasOperation.call(ctx, path, method);
  const pathObj = ctx.maybeResolveLocalRef(ctx.document.paths![path]) as Fragment;
  const operation = ctx.maybeResolveLocalRef(pathObj[method]) as Fragment;

  return {
    ...httpOperation,

    responses: translateToResponses.call(ctx, operation),
    servers: translateToServers.call(ctx, operation),
    request: translateToRequest.call(ctx, pathObj, operation),
    security: translateToSecurities.call(ctx, operation.security),
  };
};

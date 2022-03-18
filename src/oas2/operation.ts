import { isPlainObject } from '@stoplight/json';
import type { IHttpOperation } from '@stoplight/types';
import type { Spec } from 'swagger-schema-official';
import pickBy = require('lodash.pickby');

import { createContext } from '../context';
import { isString } from '../guards';
import { getExtensions } from '../oas/accessors';
import { DEFAULT_ID_GENERATOR } from '../oas/id';
import { transformOasOperations } from '../oas/operation';
import { translateToTags } from '../oas/tags';
import { Oas2HttpOperationTransformer } from '../oas/types';
import { maybeResolveLocalRef } from '../utils';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas2Operations(document: Spec): IHttpOperation[] {
  return transformOasOperations(document, DEFAULT_ID_GENERATOR, transformOas2Operation);
}

export const transformOas2Operation: Oas2HttpOperationTransformer = ({ document, path, method }) => {
  const pathObj = maybeResolveLocalRef(document, document?.paths?.[path]);
  if (!isPlainObject(pathObj)) {
    throw new Error(`Could not find ${['paths', path].join('/')} in the provided spec.`);
  }

  const operation = maybeResolveLocalRef(document, pathObj[method]);
  if (!isPlainObject(operation)) {
    throw new Error(`Could not find ${['paths', path, method].join('/')} in the provided spec.`);
  }

  const ctx = createContext(document, DEFAULT_ID_GENERATOR);

  return {
    id: ctx.generateId('operation'),
    method,
    path,

    deprecated: !!operation.deprecated,
    internal: !!operation['x-internal'],

    responses: translateToResponses.call(ctx, operation),
    servers: translateToServers.call(ctx, operation),
    request: translateToRequest.call(ctx, pathObj, operation),
    tags: translateToTags.call(ctx, operation.tags),
    security: translateToSecurities.call(ctx, operation.security),
    extensions: getExtensions(operation),

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

import { IHttpOperation } from '@stoplight/types';
import { get, isNil, omitBy } from 'lodash';
import { OpenAPIObject, OperationObject, ParameterObject, PathsObject, RequestBodyObject } from 'openapi3-ts';

import { getOasTags, getValidOasParameters } from '../oas/accessors';
import { transformOasOperations } from '../oas/operation';
import { translateToTags } from '../oas/tag';
import { Oas3HttpOperationTransformer } from '../oas/types';
import { isServerObject } from './guards';
import { translateToCallbacks } from './transformers/callbacks';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas3Operations(document: OpenAPIObject): IHttpOperation[] {
  return transformOasOperations(document, transformOas3Operation);
}

export const transformOas3Operation: Oas3HttpOperationTransformer = ({ document, path, method }) => {
  const pathObj = get(document, ['paths', path]) as PathsObject;
  if (!pathObj) {
    throw new Error(`Could not find ${['paths', path].join('/')} in the provided spec.`);
  }

  const operation = get(document, ['paths', path, method]) as OperationObject;
  if (!operation) {
    throw new Error(`Could not find ${['paths', path, method].join('/')} in the provided spec.`);
  }

  const servers = operation.servers || pathObj.servers || document.servers;

  const httpOperation: IHttpOperation = {
    id: '?http-operation-id?',
    iid: operation.operationId,
    description: operation.description,
    deprecated: operation.deprecated,
    method,
    path,
    summary: operation.summary,
    responses: translateToResponses(operation.responses),
    servers: Array.isArray(servers) ? translateToServers(servers.filter(isServerObject)) : [],
    request: translateToRequest(
      getValidOasParameters(operation.parameters as ParameterObject[], pathObj.parameters),
      operation.requestBody as RequestBodyObject,
    ),
    callbacks: operation.callbacks && translateToCallbacks(operation.callbacks),
    tags: translateToTags(getOasTags(operation.tags)),
    security: translateToSecurities(document, operation.security),
  };

  return omitBy(httpOperation, isNil) as IHttpOperation;
};

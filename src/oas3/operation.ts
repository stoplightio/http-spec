import { IHttpOperation } from '@stoplight/types';
import { get, isNil, omitBy } from 'lodash';
import { OpenAPIObject, OperationObject, ParameterObject, PathsObject, RequestBodyObject } from 'openapi3-ts';

import { getOasParameters } from '../oas/accessors';
import { computeOasOperations } from '../oas/computeOperations';
import { translateToTags } from '../oas/tag';
import { Oas3HttpOperationTransformer } from '../oas/types';
import { getSecurities } from './accessors';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function computeOas3Operations(document: OpenAPIObject): IHttpOperation[] {
  return computeOasOperations(document, transformOas3Operation);
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

  const httpOperation: IHttpOperation = {
    id: '?http-operation-id?',
    iid: operation.operationId,
    description: operation.description,
    deprecated: operation.deprecated,
    method,
    path,
    summary: operation.summary,
    responses: translateToResponses(operation.responses),
    servers: translateToServers(operation.servers || pathObj.servers || document.servers),
    request: translateToRequest(
      getOasParameters(operation.parameters as ParameterObject[], pathObj.parameters),
      operation.requestBody as RequestBodyObject,
    ),
    tags: translateToTags(operation.tags || []),
    security: translateToSecurities(getSecurities(document, operation)),
  };

  return omitBy(httpOperation, isNil) as IHttpOperation;
};

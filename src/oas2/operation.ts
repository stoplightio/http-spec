import { IHttpOperation } from '@stoplight/types';
import { get, isNil, omitBy } from 'lodash';
import { Operation, Parameter, Path, Response, Spec } from 'swagger-schema-official';

import { getOasTags, getValidOasParameters } from '../oas/accessors';
import { transformOasOperations } from '../oas/operation';
import { translateToTags } from '../oas/tag';
import { Oas2HttpOperationTransformer } from '../oas/types';
import { getConsumes, getProduces } from './accessors';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

export function transformOas2Operations(document: Spec): IHttpOperation[] {
  return transformOasOperations(document, transformOas2Operation);
}

export const transformOas2Operation: Oas2HttpOperationTransformer = ({ document, path, method }) => {
  const pathObj = get(document, ['paths', path]) as Path;
  if (!pathObj) {
    throw new Error(`Could not find ${['paths', path].join('/')} in the provided spec.`);
  }

  const operation = get(document, ['paths', path, method]) as Operation;
  if (!operation) {
    throw new Error(`Could not find ${['paths', path, method].join('/')} in the provided spec.`);
  }

  const produces = getProduces(document, operation);
  const consumes = getConsumes(document, operation);

  const httpOperation: IHttpOperation = {
    // TODO(SL-248): what shall we do with id?
    id: '?http-operation-id?',
    iid: operation.operationId,
    description: operation.description,
    deprecated: operation.deprecated,
    method,
    path,
    summary: operation.summary,
    responses: translateToResponses(operation.responses as { [name: string]: Response }, produces),
    servers: translateToServers(document, operation),
    request: translateToRequest(
      getValidOasParameters(operation.parameters as Parameter[], pathObj.parameters as Parameter[]),
      consumes,
    ),
    tags: translateToTags(getOasTags(operation.tags)),
    security: translateToSecurities(document, operation.security),
  };

  return omitBy(httpOperation, isNil) as IHttpOperation;
};

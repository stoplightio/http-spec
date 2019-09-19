import { IHttpOperation } from '@stoplight/types';
import { get, isNil, omitBy } from 'lodash';
import { Operation, Parameter, Path, Response } from 'swagger-schema-official';

import { getOasParameters } from '../oas/accessors';
import { translateToTags } from '../oas/tag';
import { Oas2HttpOperationTransformer } from '../oas/types';
import { getConsumes, getProduces, getSecurities } from './accessors';
import { translateToRequest } from './transformers/request';
import { translateToResponses } from './transformers/responses';
import { translateToSecurities } from './transformers/securities';
import { translateToServers } from './transformers/servers';

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

  // This cast to 'any' is required because of a bug in the 'swagger-schema-official' types
  // security claims to be of type Security[] but is of type Dictionary<string[], string>
  const operationSecurity: any = operation.security;
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
      getOasParameters(operation.parameters as Parameter[], pathObj.parameters as Parameter[]),
      consumes,
    ),
    tags: translateToTags(operation.tags || []),
    security: translateToSecurities(getSecurities(document, operationSecurity)),
  };

  return omitBy(httpOperation, isNil) as IHttpOperation;
};

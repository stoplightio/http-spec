import { IHttpOperationRequest } from '@stoplight/types';
import { Request } from 'postman-collection';
import { Required } from 'utility-types';

import { transformBody, transformHeader, transformPathParams, transformQueryParam } from './params';

export function transformRequest(request: Request): Required<IHttpOperationRequest, 'headers' | 'query'> {
  return {
    query: request.url.query.map(transformQueryParam),
    headers: request.headers.map(transformHeader),
    path: transformPathParams(request.url.path || []),
    body: request.body ? transformBody(request.body, request.headers.get('content-type')?.toLowerCase()) : undefined,
  };
}

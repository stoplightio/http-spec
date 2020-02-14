import {
  HttpParamStyles,
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import { Request } from 'postman-collection';
import { transformBody, transformHeader, transformPathParams, transformQueryParam } from './params';

export function transformRequest(request: Request): IHttpOperationRequest {
  return {
    query: request.url.query.all().map(transformQueryParam),
    headers: request.headers.all().map(transformHeader),
    path: transformPathParams(request.url.path),
    body: request.body ? transformBody(request.body, request.headers.get('content-type')?.toLowerCase()) : undefined,
  };
}

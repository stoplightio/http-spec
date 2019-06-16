import { IHttpHeaderParam, IHttpOperationResponse, IMediaTypeContent } from '@stoplight/types';
import { map } from 'lodash';
import { ContentObject, HeadersObject, ResponseObject, ResponsesObject } from 'openapi3-ts';

import { translateHeaderObject, translateMediaTypeObject } from './content';

function translateToResponse(response: ResponseObject, statusCode: string): IHttpOperationResponse {
  return {
    code: statusCode,
    description: response.description,
    headers: map<HeadersObject, IHttpHeaderParam>(response.headers, translateHeaderObject),
    contents: map<ContentObject, IMediaTypeContent>(response.content, translateMediaTypeObject),
  };
}

export function translateToResponses(
  responses: ResponsesObject,
): IHttpOperationResponse[] & { 0: IHttpOperationResponse } {
  return map<ResponsesObject, IHttpOperationResponse>(responses, translateToResponse) as IHttpOperationResponse[] & {
    0: IHttpOperationResponse;
  };
}

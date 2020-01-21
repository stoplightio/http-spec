import { Dictionary, IHttpHeaderParam, IHttpOperationResponse, IMediaTypeContent, Optional } from '@stoplight/types';
import { compact, map } from 'lodash';
import { ResponseObject, ResponsesObject } from 'openapi3-ts';

import { translateHeaderObject, translateMediaTypeObject } from './content';

function translateToResponse(response: ResponseObject, statusCode: string): IHttpOperationResponse {
  return {
    code: statusCode,
    description: response.description,
    headers: compact<IHttpHeaderParam>(
      map<Dictionary<unknown> & unknown, Optional<IHttpHeaderParam>>(response.headers, translateHeaderObject),
    ),
    contents: compact<IMediaTypeContent>(
      map<Dictionary<unknown> & unknown, Optional<IMediaTypeContent>>(response.content, translateMediaTypeObject),
    ),
  };
}

export function translateToResponses(
  responses: ResponsesObject,
): IHttpOperationResponse[] & { 0: IHttpOperationResponse } {
  return map<ResponsesObject, IHttpOperationResponse>(responses, translateToResponse) as IHttpOperationResponse[] & {
    0: IHttpOperationResponse;
  };
}

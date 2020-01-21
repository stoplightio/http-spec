import { Dictionary, IHttpHeaderParam, IHttpOperationResponse, IMediaTypeContent, Optional } from '@stoplight/types';
import { compact, map } from 'lodash';
import { ContentObject } from 'openapi3-ts';

import { isDictionary, isResponseObject } from '../guards';
import { translateHeaderObject, translateMediaTypeObject } from './content';

function translateToResponse(response: unknown, statusCode: string): IHttpOperationResponse | null {
  if (!isResponseObject(response)) {
    return null;
  }

  return {
    code: statusCode,
    description: response.description,
    headers: compact<IHttpHeaderParam>(
      map<Dictionary<unknown> & unknown, Optional<IHttpHeaderParam>>(response.headers, translateHeaderObject),
    ),
    contents: map<ContentObject, IMediaTypeContent>(response.content, translateMediaTypeObject),
  };
}

function isHttpOperationResponse(item: IHttpOperationResponse | null): item is IHttpOperationResponse {
  return item !== null;
}

export function translateToResponses(responses: unknown): IHttpOperationResponse[] {
  if (!isDictionary(responses)) {
    return [];
  }

  return map<Dictionary<unknown>, IHttpOperationResponse | null>(responses, translateToResponse).filter<
    IHttpOperationResponse
  >(isHttpOperationResponse);
}

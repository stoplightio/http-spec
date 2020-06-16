import {
  DeepPartial,
  Dictionary,
  IHttpHeaderParam,
  IHttpOperationResponse,
  IMediaTypeContent,
  Optional,
} from '@stoplight/types';
import { compact, map, partial } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';

import { isDictionary, maybeResolveLocalRef } from '../../utils';
import { isResponseObject } from '../guards';
import { translateHeaderObject, translateMediaTypeObject } from './content';

function translateToResponse(
  document: DeepPartial<OpenAPIObject>,
  response: unknown,
  statusCode: string,
): Optional<IHttpOperationResponse> {
  response = maybeResolveLocalRef(document, response);
  if (!isResponseObject(response)) return;

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
  document: DeepPartial<OpenAPIObject>,
  responses: unknown,
): IHttpOperationResponse[] {
  if (!isDictionary(responses)) {
    return [];
  }

  return compact<IHttpOperationResponse>(
    map<Dictionary<unknown>, Optional<IHttpOperationResponse>>(responses, partial(translateToResponse, document)),
  );
}

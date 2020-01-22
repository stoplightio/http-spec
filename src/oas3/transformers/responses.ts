import { Dictionary, IHttpHeaderParam, IHttpOperationResponse, IMediaTypeContent, Optional } from '@stoplight/types';
import { compact, map } from 'lodash';

import { isDictionary } from '../../utils';
import { isResponseObject } from '../guards';
import { translateHeaderObject, translateMediaTypeObject } from './content';

function translateToResponse(response: unknown, statusCode: string): Optional<IHttpOperationResponse> {
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

export function translateToResponses(responses: unknown): IHttpOperationResponse[] {
  if (!isDictionary(responses)) {
    return [];
  }

  return compact<IHttpOperationResponse>(
    map<Dictionary<unknown>, Optional<IHttpOperationResponse>>(responses, translateToResponse),
  );
}

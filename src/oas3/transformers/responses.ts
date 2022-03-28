import {
  DeepPartial,
  Dictionary,
  IHttpHeaderParam,
  IHttpOperationResponse,
  IMediaTypeContent,
  Optional,
} from '@stoplight/types';
import { compact, map, partial, reduce } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';

import { isDictionary, maybeResolveLocalRef } from '../../utils';
import { isResponseObject } from '../guards';
import { translateHeaderObject, translateMediaTypeObject } from './content';

function translateToResponse(
  document: DeepPartial<OpenAPIObject>,
  response: unknown,
  statusCode: string,
): Optional<IHttpOperationResponse> {
  const resolvedResponse = maybeResolveLocalRef(document, response);
  if (!isResponseObject(resolvedResponse)) return;

  const dereferencedHeaders = reduce(
    resolvedResponse.headers,
    (result, header, name) => {
      return { ...result, [name]: maybeResolveLocalRef(document, header) };
    },
    {},
  );

  return {
    code: statusCode,
    description: resolvedResponse.description,
    headers: compact<IHttpHeaderParam>(map(dereferencedHeaders, translateHeaderObject)),
    contents: compact<IMediaTypeContent>(
      map<Dictionary<unknown> & unknown, Optional<IMediaTypeContent>>(
        resolvedResponse.content,
        partial(translateMediaTypeObject, document),
      ),
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

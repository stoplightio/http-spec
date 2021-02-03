import {
  DeepPartial,
  Dictionary,
  IHttpHeaderParam,
  IHttpOperationResponse,
  IMediaTypeContent,
  Optional,
} from '@stoplight/types';
import { compact, each, map, partial } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';

import { isDictionary, maybeResolveLocalRef } from '../../utils';
import { isResponseObject } from '../guards';
import { translateHeaderObject, translateMediaTypeObject } from './content';

function resolveMediaObject(document: DeepPartial<OpenAPIObject>, maybeMediaObject: unknown) {
  if (!isDictionary(maybeMediaObject)) {
    return null;
  }

  const mediaObject = { ...maybeMediaObject };
  if (isDictionary(mediaObject.schema)) {
    mediaObject.schema = maybeResolveLocalRef(document, mediaObject.schema);
  }

  if (isDictionary(mediaObject.examples)) {
    const examples = { ...mediaObject.examples };
    mediaObject.examples = examples;
    each(examples, (exampleValue, exampleName) => {
      examples[exampleName] = maybeResolveLocalRef(document, exampleValue);
    });
  }

  return mediaObject;
}

function translateToResponse(
  document: DeepPartial<OpenAPIObject>,
  response: unknown,
  statusCode: string,
): Optional<IHttpOperationResponse> {
  const resolvedResponse = maybeResolveLocalRef(document, response);
  if (!isResponseObject(resolvedResponse)) return;

  return {
    code: statusCode,
    description: resolvedResponse.description,
    headers: compact<IHttpHeaderParam>(
      map<Dictionary<unknown> & unknown, Optional<IHttpHeaderParam>>(resolvedResponse.headers, translateHeaderObject),
    ),
    contents: compact<IMediaTypeContent>(
      map<Dictionary<unknown> & unknown, Optional<IMediaTypeContent>>(
        resolvedResponse.content,
        (mediaObject, mediaType) => translateMediaTypeObject(resolveMediaObject(document, mediaObject), mediaType),
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

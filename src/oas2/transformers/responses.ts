import type { DeepPartial, Dictionary, IHttpOperationResponse, Optional } from '@stoplight/types';
import { chain, compact, map, partial } from 'lodash';
import type { Spec } from 'swagger-schema-official';

import { translateSchemaObject } from '../../oas/transformers/schema';
import { isDictionary, maybeResolveLocalRef } from '../../utils';
import { isResponseObject } from '../guards';
import { getExamplesFromSchema } from './getExamplesFromSchema';
import { translateToHeaderParams } from './params';

function translateToResponse(
  document: DeepPartial<Spec>,
  produces: string[],
  response: unknown,
  statusCode: string,
): Optional<IHttpOperationResponse> {
  const resolvedResponse = maybeResolveLocalRef(document, response);
  if (!isResponseObject(resolvedResponse)) return;

  const headers = translateToHeaderParams(document, resolvedResponse.headers || {});
  const objectifiedExamples = chain(
    resolvedResponse.examples || (resolvedResponse.schema ? getExamplesFromSchema(resolvedResponse.schema) : void 0),
  )
    .mapValues((value, key) => ({ key, value }))
    .values()
    .value();

  const contents = produces.map(produceElement => ({
    mediaType: produceElement,
    schema: isDictionary(resolvedResponse.schema) ? translateSchemaObject(document, resolvedResponse.schema) : void 0,
    examples: objectifiedExamples.filter(example => example.key === produceElement),
  }));

  const translatedResponses = {
    code: statusCode,
    description: resolvedResponse.description,
    headers,
    contents,
  };

  const foreignExamples = objectifiedExamples.filter(example => !produces.includes(example.key));
  if (foreignExamples.length > 0) {
    if (translatedResponses.contents.length === 0)
      translatedResponses.contents[0] = {
        mediaType: '',
        schema: {},
        examples: [],
      };

    translatedResponses.contents[0].examples!.push(...foreignExamples);
  }

  return translatedResponses;
}

export function translateToResponses(
  document: DeepPartial<Spec>,
  responses: unknown,
  produces: string[],
): IHttpOperationResponse[] {
  if (!isDictionary(responses)) {
    return [];
  }

  return compact<IHttpOperationResponse>(
    map<Dictionary<unknown>, Optional<IHttpOperationResponse>>(
      responses,
      partial(translateToResponse, document, produces),
    ),
  );
}

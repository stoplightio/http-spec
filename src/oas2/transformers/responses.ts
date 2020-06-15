import { IHttpOperationResponse } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { chain, map, partial } from 'lodash';
import { Response } from 'swagger-schema-official';

import { getExamplesFromSchema } from './getExamplesFromSchema';
import { translateToHeaderParams } from './params';

function translateToResponse(produces: string[], response: Response, statusCode: string): IHttpOperationResponse {
  const headers = translateToHeaderParams(response.headers || {});
  const objectifiedExamples = chain(
    response.examples || (response.schema ? getExamplesFromSchema(response.schema) : void 0),
  )
    .mapValues((value, key) => ({ key, value }))
    .values()
    .value();

  const contents = produces.map(produceElement => ({
    mediaType: produceElement,
    schema: response.schema as JSONSchema4,
    examples: objectifiedExamples.filter(example => example.key === produceElement),
  }));

  const translatedResponses = {
    code: statusCode,
    description: response.description,
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
  responses: { [name: string]: Response },
  produces: string[],
): IHttpOperationResponse[] {
  return map(responses, partial(translateToResponse, produces));
}

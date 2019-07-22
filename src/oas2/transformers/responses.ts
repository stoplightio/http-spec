import { IHttpOperationResponse } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { chain, compact, map, partial } from 'lodash';
import { Response } from 'swagger-schema-official';

import { translateToHeaderParams } from './params';

function translateToResponse(produces: string[], response: Response, statusCode: string): IHttpOperationResponse {
  const headers = translateToHeaderParams(response.headers || {});
  const objectifiedExamples = chain(response.examples)
    .mapValues((value, key) => ({ key, value }))
    .values()
    .value();

  const contents = compact(
    produces.map(produceElement => {
      if (response.examples && response.examples[produceElement]) {
        return {
          mediaType: produceElement,
          schema: response.schema as JSONSchema4,
          examples: objectifiedExamples.filter(example => example.key === produceElement),
        };
      }
      return undefined;
    }),
  );

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
): IHttpOperationResponse[] & { 0: IHttpOperationResponse } {
  return map(responses, partial(translateToResponse, produces)) as IHttpOperationResponse[] & {
    0: IHttpOperationResponse;
  };
}

import { IHttpOperationResponse } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { compact, map, partial } from 'lodash';
import { Response } from 'swagger-schema-official';

import { translateToHeaderParams } from './params';

const toObject = <T>(value: T, key: string) => ({ key, value });

function translateToResponse(produces: string[], response: Response, statusCode: string): IHttpOperationResponse {
  const headers = translateToHeaderParams(response.headers || {});
  const objectifiedExamples = map(response.examples, toObject);

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

  if (translatedResponses.contents.length === 0)
    translatedResponses.contents[0] = {
      mediaType: '',
      schema: {},
      examples: [],
    };

  translatedResponses.contents[0].examples!.push(
    ...objectifiedExamples.filter(example => !produces.includes(example.key)),
  );

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

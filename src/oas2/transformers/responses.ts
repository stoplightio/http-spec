import { IHttpOperationResponse, IMediaTypeContent } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { map, partial } from 'lodash';
import { Response } from 'swagger-schema-official';

import { translateToHeaderParams } from './params';

const toObject = <T>(value: T, key: string) => ({ key, value });

function translateToResponse(produces: string[], response: Response, statusCode: string): IHttpOperationResponse {
  const headers = translateToHeaderParams(response.headers || {});
  const objectifiedExamples = map(response.examples, toObject);

  const contents: IMediaTypeContent[] = [];

  produces.forEach(produceElement => {
    if (response.examples && response.examples[produceElement]) {
      contents.push({
        mediaType: produceElement,
        schema: response.schema as JSONSchema4,
        examples: objectifiedExamples.filter(example => example.key === produceElement),
      });
    }
  });

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

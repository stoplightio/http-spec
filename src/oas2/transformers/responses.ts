import { IHttpOperationResponse } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { map, partial } from 'lodash';
import { Response } from 'swagger-schema-official';

import { translateToHeaderParams } from './params';

const toObject = <T>(value: T, key: string) => ({ key, value });

function translateToResponse(produces: string[], response: Response, statusCode: string): IHttpOperationResponse {
  const headers = translateToHeaderParams(response.headers || {});
  return {
    code: statusCode,
    description: response.description,
    headers,
    contents: produces.map(mediaType => ({
      mediaType,
      schema: response.schema as JSONSchema4,
      examples: map(response.examples, toObject).filter(example => example.key === mediaType),
    })),
    // `links` not supported by oas2
  };
}

export function translateToResponses(
  responses: { [name: string]: Response },
  produces: string[],
): IHttpOperationResponse[] & { 0: IHttpOperationResponse } {
  return map(responses, partial(translateToResponse, produces)) as IHttpOperationResponse[] & {
    0: IHttpOperationResponse;
  };
}

//@ts-ignore
import * as jsonSchemaGenerator from '@stoplight/json-schema-generator';
import {
  HttpParamStyles,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import type { FormParam, Header, PropertyList, QueryParam, RequestBody } from 'postman-collection';
import * as typeIs from 'type-is';

import { convertSchema } from '../../oas/transformers/schema';
import { generateId } from '../id';
import { transformDescriptionDefinition, transformStringValueToSchema } from '../util';

export function transformQueryParam(queryParam: QueryParam): IHttpQueryParam {
  return {
    id: generateId(),
    name: queryParam.key || '',
    style: HttpParamStyles.Form,
    required: true,
    ...(queryParam.value ? transformStringValueToSchema(queryParam.value) : undefined),
  };
}

export function transformHeader(header: Header): IHttpHeaderParam {
  return {
    id: generateId(),
    name: header.key.toLowerCase(),
    style: HttpParamStyles.Simple,
    required: true,
    ...(header.value ? transformStringValueToSchema(header.value) : undefined),
  };
}

export function transformPathParams(segments: string[]): IHttpPathParam[] {
  return segments.reduce<IHttpHeaderParam[]>((params, segment) => {
    if (segment.startsWith(':')) {
      params.push({
        id: generateId(),
        name: segment.substring(1),
        style: HttpParamStyles.Simple,
        required: true,
      });
    }

    return params;
  }, []);
}

export function transformBody(body: RequestBody, mediaType?: string): IHttpOperationRequestBody | undefined {
  switch (body.mode) {
    case 'raw':
      if (!body.raw) return;
      return { id: generateId(), contents: [transformRawBody(body.raw, mediaType)] };

    case 'formdata':
      if (!body.formdata) return;
      return {
        id: generateId(),
        contents: [transformParamsBody<FormParam>(body.formdata, mediaType || 'multipart/form-data')],
      };

    case 'urlencoded':
      if (!body.urlencoded) return;
      return {
        id: generateId(),
        contents: [transformParamsBody<QueryParam>(body.urlencoded, mediaType || 'application/x-www-form-urlencoded')],
      };
  }

  return;
}

export function transformRawBody(raw: string, mediaType: string = 'text/plain'): IMediaTypeContent {
  if (typeIs.is(mediaType, ['application/json', 'application/*+json'])) {
    try {
      const parsed = JSON.parse(raw);

      return {
        id: generateId(),
        mediaType,
        examples: [
          {
            id: generateId(),
            key: 'default',
            value: parsed,
          },
        ],
        schema: convertSchema({}, jsonSchemaGenerator(parsed)),
      };
    } catch (e) {
      /* noop, move on.. */
    }
  }

  return {
    id: generateId(),
    mediaType,
    examples: [
      {
        id: generateId(),
        key: 'default',
        value: raw,
      },
    ],
  };
}

function transformParamsBody<T extends FormParam | QueryParam>(
  params: PropertyList<T>,
  mediaType: string,
): IMediaTypeContent {
  const paramsList: { name: string; schema: JSONSchema7; value: unknown }[] = params.map(item => {
    return {
      name: item.key || generateId(),
      schema: {
        type: 'string',
        description: item.description && transformDescriptionDefinition(item.description),
      },
      value: item.value,
    };
  });

  return {
    id: generateId(),
    mediaType,
    schema: {
      type: 'object',
      properties: paramsList.reduce((props, param) => {
        props[param.name] = param.schema;
        return props;
      }, {}),
    },
    examples: [
      {
        id: generateId(),
        key: 'default',
        value: paramsList.reduce((values, param) => {
          values[param.name] = param.value;
          return values;
        }, {}),
      },
    ],
  };
}

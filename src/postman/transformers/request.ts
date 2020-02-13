import {
  HttpParamStyles,
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { FormParam, Header, PropertyList, QueryParam, Request, RequestBody } from 'postman-collection';
import * as toJsonSchema from 'to-json-schema';
import * as typeIs from 'type-is';
import { transformDescriptionDefinition, transformStringValueToSchema } from '../util';

export function transformQueryParam(queryParam: QueryParam): IHttpQueryParam {
  return {
    name: queryParam.key || '',
    style: HttpParamStyles.Form,
    ...(queryParam.value ? transformStringValueToSchema(queryParam.value) : undefined),
  };
}

export function transformHeader(header: Header): IHttpHeaderParam {
  return {
    name: header.key.toLowerCase(),
    style: HttpParamStyles.Simple,
    ...(header.value ? transformStringValueToSchema(header.value) : undefined),
  };
}

export function transformPathParams(segments: string[]): IHttpPathParam[] {
  return segments.reduce<IHttpHeaderParam[]>((params, segment) => {
    if (segment.startsWith(':')) {
      params.push({
        name: segment.substring(1),
        style: HttpParamStyles.Simple,
      });
    }

    return params;
  }, []);
}

export function transformBody(body: RequestBody, mediaType?: string): IHttpOperationRequestBody | undefined {
  switch (body.mode) {
    case 'raw':
      if (!body.raw) return;
      return { contents: [transformRawBody(body.raw, mediaType)] };

    case 'formdata':
      if (!body.formdata) return;
      return {
        contents: [transformParamsBody<FormParam>(body.formdata, mediaType || 'multipart/form-data')],
      };

    case 'urlencoded':
      if (!body.urlencoded) return;
      return {
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
        mediaType,
        examples: [
          {
            key: 'default',
            value: parsed,
          },
        ],
        schema: toJsonSchema(parsed) as JSONSchema4,
      };
    } catch (e) {
      /* noop, move on.. */
    }
  }

  return {
    mediaType,
    examples: [
      {
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
  const paramsList: Array<{ name: string; schema: JSONSchema4; value: any }> = params.map(item => {
    return {
      name: item.key || generateId(),
      schema: {
        type: 'string',
        description: item.description && transformDescriptionDefinition(item.description),
      },
      value: item.value,
    };
  }, undefined);

  return {
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
        key: 'default',
        value: paramsList.reduce((values, param) => {
          values[param.name] = param.value;
          return values;
        }, {}),
      },
    ],
  };
}

export function transformRequest(request: Request): IHttpOperationRequest {
  return {
    query: request.url.query.map(transformQueryParam),
    headers: request.headers.map(transformHeader),
    path: transformPathParams(request.url.path),
    body: request.body ? transformBody(request.body, request.headers.get('content-type')?.toLowerCase()) : undefined,
  };
}

function generateId() {
  return (
    '_gen_' +
    Math.round(Math.pow(8, 6) * Math.random())
      .toString(16)
      .padStart(6, '0')
  );
}

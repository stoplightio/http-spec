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
import {
  FormParam,
  HeaderDefinition,
  HeaderList,
  PropertyList,
  QueryParam,
  Request,
  RequestBody,
} from 'postman-collection';
import * as toJsonSchema from 'to-json-schema';
import { transformDescriptionDefinition, transformValueToHttpParam } from '../util';

export function transformRequest(request: Request): IHttpOperationRequest {
  return {
    query: request.url.query.all().map(transformQueryParam),
    headers: request.headers.all().map(transformHeader),
    path: transformPathParams(request.url.path),
    body: request.body ? transformBody(request.body, findContentType(request.headers)) : undefined,
  };
}

function findContentType(headers: HeaderList) {
  const header = headers.all().find(h => h.key.toLowerCase() === 'content-type');
  return header ? header.value.toLowerCase() : undefined;
}

export function transformQueryParam(queryParam: QueryParam): IHttpQueryParam {
  return {
    name: queryParam.key as string, // no key no game
    style: HttpParamStyles.Form,
    ...(queryParam.value ? transformValueToHttpParam(queryParam.value) : undefined),
  };
}

export function transformHeader(header: HeaderDefinition): IHttpHeaderParam {
  return {
    name: header.key as string,
    style: HttpParamStyles.Simple,
    ...(header.value ? transformValueToHttpParam(header.value) : undefined),
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

function transformRawBody(raw: string, mediaType?: string): IMediaTypeContent {
  try {
    const parsed = JSON.parse(raw);

    return {
      mediaType: mediaType || 'application/json',
      examples: [
        {
          key: 'default',
          value: parsed,
        },
      ],
      schema: toJsonSchema(parsed) as JSONSchema4,
    };
  } catch (e) {
    /* noop */
  }

  return {
    mediaType: mediaType || 'text/plain',
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
  return {
    mediaType,
    schema: {
      type: 'object',
      properties: params.all().reduce<NonNullable<JSONSchema4['properties']>>((props, item) => {
        // @todo: !
        props[item.key!] = {
          type: 'string',
          description: item.description && transformDescriptionDefinition(item.description),
        };
        return props;
      }, {}),
    },
    examples: [
      {
        key: 'default',
        value: params.all().reduce((value, item) => {
          // @todo: !
          value[item.key!] = item.value;
          return value;
        }, {}),
      },
    ],
  };
}

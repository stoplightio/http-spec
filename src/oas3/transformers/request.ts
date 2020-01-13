import {
  IHttpCookieParam,
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpParam,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
} from '@stoplight/types';
import { isObject, map, omit, pickBy } from 'lodash';
import { MediaTypeObject, ParameterObject, RequestBodyObject } from 'openapi3-ts';

import { translateMediaTypeObject } from './content';

function translateRequestBody(requestBodyObject: RequestBodyObject): IHttpOperationRequestBody {
  return {
    required: requestBodyObject.required,
    description: requestBodyObject.description,
    contents: map<MediaTypeObject, IMediaTypeContent>(requestBodyObject.content, translateMediaTypeObject),
  };
}

function translateParameterObject(parameterObject: ParameterObject): IHttpParam | any {
  return pickBy({
    ...omit(parameterObject, 'in', 'schema'),
    name: parameterObject.name,
    style: parameterObject.style,
    schema: parameterObject.schema,
    examples: map(parameterObject.examples, (example, key) => ({
      key,
      ...example,
    })),
  });
}

export function translateToRequest(
  parameters: ParameterObject[],
  requestBodyObject?: RequestBodyObject,
): IHttpOperationRequest {
  const params: {
    header: IHttpHeaderParam[];
    query: IHttpQueryParam[];
    cookie: IHttpCookieParam[];
    path: IHttpPathParam[];
  } = {
    header: [],
    query: [],
    cookie: [],
    path: [],
  };

  for (const parameter of parameters) {
    const { in: key } = parameter;
    if (!params.hasOwnProperty(key)) continue;

    params[key].push(translateParameterObject(parameter));
  }

  const body = requestBodyObject ? translateRequestBody(requestBodyObject) : { contents: [] };

  return {
    body,

    headers: params.header,
    query: params.query,
    cookie: params.cookie,
    path: params.path,
  };
}

import type {
  DeepPartial,
  Dictionary,
  IHttpCookieParam,
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpParam,
  IHttpPathParam,
  IHttpQueryParam,
  IMediaTypeContent,
  Optional,
} from '@stoplight/types';
import { compact, map, omit, partial, pickBy } from 'lodash';
import type { OpenAPIObject, ParameterObject, RequestBodyObject } from 'openapi3-ts';

import { isDictionary, maybeResolveLocalRef } from '../../utils';
import { translateMediaTypeObject } from './content';

function translateRequestBody(
  document: DeepPartial<OpenAPIObject>,
  requestBodyObject: RequestBodyObject,
): IHttpOperationRequestBody {
  return {
    required: requestBodyObject.required,
    description: requestBodyObject.description,
    contents: compact<IMediaTypeContent>(
      map<Dictionary<unknown> & unknown, Optional<IMediaTypeContent>>(
        requestBodyObject.content,
        partial(translateMediaTypeObject, document),
      ),
    ),
  };
}

export function translateParameterObject(parameterObject: ParameterObject): IHttpParam | any {
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
  document: DeepPartial<OpenAPIObject>,
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

  let body;
  if (isDictionary(requestBodyObject)) {
    const resolvedRequestBodyObject = maybeResolveLocalRef(document, requestBodyObject) as RequestBodyObject;
    body = translateRequestBody(document, resolvedRequestBodyObject);
  } else {
    body = { contents: [] };
  }

  return {
    body,
    headers: params.header,
    query: params.query,
    cookie: params.cookie,
    path: params.path,
  };
}

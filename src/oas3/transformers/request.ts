import { isPlainObject } from '@stoplight/json';
import type {
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpParam,
  Optional,
} from '@stoplight/types';
import { HttpParamStyles } from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import pickBy = require('lodash.pickby');
import type { ParameterObject } from 'openapi3-ts';

import { withContext } from '../../context';
import { isNonNullable, isString } from '../../guards';
import { OasVersion } from '../../oas';
import { iterateOasParams } from '../../oas/accessors';
import { isValidParamStyle } from '../../oas/guards';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { entries } from '../../utils';
import { isRequestBodyObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateMediaTypeObject } from './content';
import { translateToDefaultExample, translateToExample } from './examples';

export const translateRequestBody = withContext<
  Oas3TranslateFunction<[requestBodyObject: unknown], IHttpOperationRequestBody>
>(function (requestBodyObject) {
  const resolvedRequestBodyObject = this.maybeResolveLocalRef(requestBodyObject);
  const id = this.generateId(`http_request_body-${this.parentId}`);

  if (isRequestBodyObject(resolvedRequestBodyObject)) {
    return {
      id,
      contents: entries(resolvedRequestBodyObject.content).map(translateMediaTypeObject, this).filter(isNonNullable),
      ...pickBy(
        {
          required: resolvedRequestBodyObject.required,
          description: resolvedRequestBodyObject.description,
        },
        isNonNullable,
      ),
    };
  }

  return { id, contents: [] };
});

const translateParameterObjectSchema = withContext<
  Oas3TranslateFunction<[parameterObject: Record<string, unknown>], Optional<JSONSchema7>>
>(function (parameterObject) {
  if (!isPlainObject(parameterObject.schema)) return;

  return translateSchemaObject.call(this, {
    ...parameterObject.schema,
    ...('example' in parameterObject ? { example: parameterObject.example } : null),
  });
});

export const translateParameterObject = withContext<
  Oas3TranslateFunction<[parameterObject: ParameterObject], IHttpParam>
>(function (parameterObject) {
  const kind = parameterObject.in === 'path' ? 'path_param' : parameterObject.in;
  const name = parameterObject.name;
  const id = this.generateId(`http_${kind}-${this.parentId}-${name}`);
  const schema = translateParameterObjectSchema.call(this, parameterObject);

  return {
    id,
    name,
    deprecated: !!parameterObject.deprecated,
    required: !!parameterObject.required,
    style: isValidParamStyle(parameterObject.style) ? parameterObject.style : HttpParamStyles.Simple,
    explode: !!(parameterObject.explode ?? parameterObject.style === HttpParamStyles.Form),
    examples: [
      parameterObject.example !== undefined
        ? translateToDefaultExample.call(this, 'default', parameterObject.example)
        : undefined,
      ...entries(parameterObject.examples).map(translateToExample, this),
    ].filter(isNonNullable),

    ...pickBy(
      {
        description: parameterObject.description,
      },
      isString,
    ),

    ...pickBy(
      {
        schema,
        content: parameterObject.content,
      },
      isPlainObject,
    ),
  };
});

export const translateToRequest = withContext<
  Oas3TranslateFunction<[path: Record<string, unknown>, operation: Record<string, unknown>], IHttpOperationRequest>
>(function (path, operation) {
  const params: Omit<IHttpOperationRequest, 'header'> & { header: IHttpHeaderParam[] } = {
    header: [],
    query: [],
    cookie: [],
    path: [],
  };

  for (const param of iterateOasParams.call(this, OasVersion.OAS3, path, operation)) {
    const { in: key } = param;
    const target = params[key];
    if (!Array.isArray(target)) continue;

    target.push(translateParameterObject.call(this, param) as any);
  }

  return {
    body: translateRequestBody.call(this, operation?.requestBody),
    headers: params.header,
    query: params.query,
    cookie: params.cookie,
    path: params.path,
  };
});

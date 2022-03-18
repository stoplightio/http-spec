import { isPlainObject } from '@stoplight/json';
import type {
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpParam,
  Optional,
} from '@stoplight/types';
import { HttpParamStyles } from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
import pickBy = require('lodash.pickby');
import type { ParameterObject } from 'openapi3-ts';

import { withJsonPath } from '../../context';
import { isNonNullable, isString } from '../../guards';
import { OasVersion } from '../../oas';
import { queryValidOasParameters } from '../../oas/accessors';
import { isValidParamStyle } from '../../oas/guards';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { entries } from '../../utils';
import { isRequestBodyObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateMediaTypeObject } from './content';

export const translateRequestBody = withJsonPath<
  Oas3TranslateFunction<[requestBodyObject: unknown], IHttpOperationRequestBody>
>(function (requestBodyObject) {
  this.state.enter('requestBody');

  const resolvedRequestBodyObject = this.maybeResolveLocalRef(requestBodyObject);

  if (isRequestBodyObject(resolvedRequestBodyObject)) {
    return {
      id: this.generateId('request-body'),
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

  return { id: this.generateId('request-body'), contents: [] };
});

const translateParameterObjectSchema = withJsonPath<
  Oas3TranslateFunction<[parameterObject: Record<string, unknown>], Optional<JSONSchema7>>
>(function (parameterObject) {
  if (!isPlainObject(parameterObject.schema)) return;

  this.state.enter('schema');

  return translateSchemaObject.call(this, {
    ...parameterObject.schema,
    ...('example' in parameterObject ? { example: parameterObject.example } : null),
  });
});

export const translateParameterObject = withJsonPath<
  Oas3TranslateFunction<[parameterObject: ParameterObject], IHttpParam>
>(function (parameterObject) {
  const examples = entries(parameterObject.examples).map(([key, example]) => ({
    key,
    ...(example as any),
  }));

  const id = this.generateId('parameter');
  const hasDefaultExample = examples.some(({ key }) => key.includes('default'));
  const schema = translateParameterObjectSchema.call(this, parameterObject);

  return {
    id,
    name: parameterObject.name,
    deprecated: !!parameterObject.deprecated,
    style: isValidParamStyle(parameterObject.style) ? parameterObject.style : HttpParamStyles.Simple,
    explode: !!(parameterObject.explode ?? parameterObject.style === HttpParamStyles.Form),
    examples:
      'example' in parameterObject && !hasDefaultExample
        ? [{ key: 'default', value: parameterObject.example }, ...examples]
        : examples,

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

export const translateToRequest = withJsonPath<
  Oas3TranslateFunction<[path: Record<string, unknown>, operation: Record<string, unknown>], IHttpOperationRequest>
>(function (path, operation) {
  const params: Omit<IHttpOperationRequest, 'header'> & { header: IHttpHeaderParam[] } = {
    header: [],
    query: [],
    cookie: [],
    path: [],
  };

  for (const param of queryValidOasParameters.call(this, OasVersion.OAS3, operation.parameters, path.parameters)) {
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

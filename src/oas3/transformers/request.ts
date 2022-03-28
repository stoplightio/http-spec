import { isPlainObject } from '@stoplight/json';
import type {
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpParam,
  INodeExample,
  INodeExternalExample,
  Optional,
} from '@stoplight/types';
import { HttpParamStyles } from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import type { ParameterObject } from 'openapi3-ts';
import pickBy = require('lodash.pickby');

import { isNonNullable, isString } from '../../guards';
import { OasVersion } from '../../oas';
import { getValidOasParameters } from '../../oas/accessors';
import { isValidParamStyle } from '../../oas/guards';
import { translateSchemaObject } from '../../oas/transformers/schema';
import type { ArrayCallbackParameters, Fragment } from '../../types';
import { entries } from '../../utils';
import { isRequestBodyObject } from '../guards';
import type { Oas3TranslateFunction } from '../types';
import { translateMediaTypeObject } from './content';

export const translateRequestBody: Oas3TranslateFunction<[requestBodyObject: unknown], IHttpOperationRequestBody> =
  function (requestBodyObject) {
    const resolvedRequestBodyObject = this.maybeResolveLocalRef(requestBodyObject);

    if (isRequestBodyObject(resolvedRequestBodyObject)) {
      return {
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

    return { contents: [] };
  };

const translateParameterObjectSchema: Oas3TranslateFunction<
  [parameterObject: Fragment],
  Optional<JSONSchema7>
> = function (parameterObject) {
  if (!isPlainObject(parameterObject.schema)) return;

  return translateSchemaObject.call(this, {
    ...parameterObject.schema,
    ...('example' in parameterObject ? { example: parameterObject.example } : null),
  });
};

const translateToExample: Oas3TranslateFunction<
  ArrayCallbackParameters<[key: string, example: unknown]>,
  Optional<INodeExample | INodeExternalExample>
> = function ([key, example]) {
  if (!isPlainObject(example)) return;

  if (!('value' in example) && typeof example.externalValue !== 'string') return;

  return {
    key,

    ...(typeof example.externalValue === 'string'
      ? { externalValue: example.externalValue }
      : { value: example.value }),

    ...pickBy(
      {
        summary: example.summary,
        description: example.description,
      },
      isString,
    ),
  };
};

export const translateParameterObject: Oas3TranslateFunction<[parameterObject: ParameterObject], IHttpParam> =
  function (parameterObject) {
    const examples = entries(parameterObject.examples).map(translateToExample, this).filter(isNonNullable);

    const hasDefaultExample = examples.some(({ key }) => key.includes('default'));
    const schema = translateParameterObjectSchema.call(this, parameterObject);

    return {
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
  };

export const translateToRequest: Oas3TranslateFunction<[path: Fragment, operation: Fragment], IHttpOperationRequest> =
  function (path, operation) {
    const params: Omit<IHttpOperationRequest, 'header'> & { header: IHttpHeaderParam[] } = {
      header: [],
      query: [],
      cookie: [],
      path: [],
    };

    for (const param of getValidOasParameters(this.document, OasVersion.OAS3, operation.parameters, path.parameters)) {
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
  };

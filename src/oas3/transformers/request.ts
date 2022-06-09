import { isPlainObject } from '@stoplight/json';
import type {
  IHttpHeaderParam,
  IHttpOperationRequest,
  IHttpOperationRequestBody,
  IHttpParam,
  Optional,
  Reference,
} from '@stoplight/types';
import { HttpParamStyles } from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import type { ParameterObject } from 'openapi3-ts';

import { withContext } from '../../context';
import { isBoolean, isNonNullable, isString } from '../../guards';
import { OasVersion } from '../../oas';
import { createOasParamsIterator } from '../../oas/accessors';
import { isReferenceObject, isValidParamStyle } from '../../oas/guards';
import { getComponentName, syncReferenceObject } from '../../oas/resolver';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { entries } from '../../utils';
import { isRequestBodyObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateMediaTypeObject } from './content';
import { translateToExample } from './examples';
import pickBy = require('lodash.pickby');

export const translateRequestBody = withContext<
  Oas3TranslateFunction<[requestBodyObject: unknown], IHttpOperationRequestBody<true> | Reference>
>(function (requestBodyObject) {
  const maybeRequestBodyObject = this.maybeResolveLocalRef(requestBodyObject);
  if (isReferenceObject(maybeRequestBodyObject)) {
    return maybeRequestBodyObject;
  }

  const id = this.generateId(`http_request_body-${this.parentId}`);

  if (isRequestBodyObject(maybeRequestBodyObject)) {
    return {
      id,
      contents: entries(maybeRequestBodyObject.content).map(translateMediaTypeObject, this).filter(isNonNullable),

      ...pickBy(
        {
          required: maybeRequestBodyObject.required,
        },
        isBoolean,
      ),

      ...pickBy(
        {
          description: maybeRequestBodyObject.description,
        },
        isString,
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
  Oas3TranslateFunction<[parameterObject: ParameterObject], IHttpParam<true>>
>(function (parameterObject) {
  const kind = parameterObject.in === 'path' ? 'path_param' : parameterObject.in;
  const name = parameterObject.name;
  const id = this.generateId(`http_${kind}-${this.parentId}-${name}`);
  const schema = translateParameterObjectSchema.call(this, parameterObject);

  const examples = entries(parameterObject.examples).map(translateToExample, this).filter(isNonNullable);
  const hasDefaultExample = examples.some(example => !isReferenceObject(example) && example.key.includes('default'));

  return {
    id,
    name,
    style: isValidParamStyle(parameterObject.style)
      ? parameterObject.style
      : // https://spec.openapis.org/oas/v3.0.3#parameterStyle, https://spec.openapis.org/oas/v3.1.0#parameterStyle
      parameterObject.in === 'query' || parameterObject.in === 'cookie'
      ? HttpParamStyles.Form
      : HttpParamStyles.Simple,
    examples: [
      !hasDefaultExample && parameterObject.example !== undefined
        ? translateToDefaultExample.call(this, 'default', parameterObject.example)
        : undefined,
      ...examples,
    ].filter(isNonNullable),

    ...pickBy(
      {
        description: parameterObject.description,
      },
      isString,
    ),

    ...pickBy(
      {
        deprecated: parameterObject.deprecated,
        required: parameterObject.required,
        explode: parameterObject.explode,
      },
      isBoolean,
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

const iterateOasParams = createOasParamsIterator(OasVersion.OAS3);

export const translateToRequest = withContext<
  Oas3TranslateFunction<
    [path: Record<string, unknown>, operation: Record<string, unknown>],
    IHttpOperationRequest<true>
  >
>(function (path, operation) {
  const params: Omit<IHttpOperationRequest<true>, 'header'> & { header: (IHttpHeaderParam<true> | Reference)[] } = {
    header: [],
    query: [],
    cookie: [],
    path: [],
  };

  for (const param of iterateOasParams.call(this, path, operation)) {
    let kind;
    if (isReferenceObject(param)) {
      kind = (this.references[param.$ref] && getComponentName(this.references[param.$ref])) || param.$ref;
    } else {
      kind = param.in;
    }

    const target = params[kind];
    if (!Array.isArray(target)) continue;

    if (isReferenceObject(param)) {
      target.push(syncReferenceObject(param, this.references));
    } else {
      target.push(translateParameterObject.call(this, param) as any);
    }
  }

  return {
    body: translateRequestBody.call(this, operation?.requestBody),
    headers: params.header,
    query: params.query,
    cookie: params.cookie,
    path: params.path,
  };
});

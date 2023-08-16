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
import { isReferenceObject, isValidOas3ParamStyle } from '../../oas/guards';
import { getComponentName, getSharedKey, syncReferenceObject } from '../../oas/resolver';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { ArrayCallbackParameters } from '../../types';
import { collectExplicitProperties, entries } from '../../utils';
import { isRequestBodyObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateMediaTypeObject } from './content';
import { translateToExample } from './examples';
import pickBy = require('lodash.pickby');

export const translateToSharedRequestBody = withContext<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[key: string, requestBodyObject: unknown]>,
    Optional<IHttpOperationRequestBody<true> | Reference>
  >
>(function ([key, requestBodyObject]) {
  const maybeRequestBodyObject = this.maybeResolveLocalRef(requestBodyObject);
  if (isReferenceObject(maybeRequestBodyObject)) {
    (maybeRequestBodyObject as { key: string } & Reference).key = key;
    return maybeRequestBodyObject as { key: string } & Reference;
  }

  return translateRequestBody.call(this, key, maybeRequestBodyObject);
});

export const translateRequestBody = withContext<
  Oas3TranslateFunction<
    [key: Optional<string>, requestBodyObject: unknown],
    Optional<IHttpOperationRequestBody<true> | Reference>
  >
>(function (key, requestBodyObject) {
  const maybeRequestBodyObject = this.maybeResolveLocalRef(requestBodyObject);
  if (isReferenceObject(maybeRequestBodyObject)) {
    return maybeRequestBodyObject;
  }

  if (!isRequestBodyObject(maybeRequestBodyObject)) return;

  const id = this.generateId.httpRequestBody({
    key: this.context === 'service' ? getSharedKey(maybeRequestBodyObject, key) : key,
  });

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
  if (this.context === 'path') {
    // we do not have a path representation to hang this path-defined parameter on, so this becomes a new operation-defined parameter
    this.context = 'operation';
    this.parentId = this.ids['operation'];
  }

  const kind = parameterObject.in === 'path' ? 'pathParam' : parameterObject.in;
  const name = parameterObject.name;
  const keyOrName = getSharedKey(parameterObject, name);
  const id = this.generateId[`http${kind[0].toUpperCase()}${kind.slice(1)}`]({ keyOrName, componentType: 'parameter' });
  const schema = translateParameterObjectSchema.call(this, parameterObject);

  const examples = entries(parameterObject.examples).map(translateToExample, this).filter(isNonNullable);
  const hasDefaultExample = examples.some(example => !isReferenceObject(example) && example.key.includes('default'));

  return {
    id,
    name,
    style: isValidOas3ParamStyle(parameterObject.style)
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
        allowEmptyValue: parameterObject.allowEmptyValue,
        allowReserved: parameterObject.allowReserved,
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

    explicitProperties: collectExplicitProperties(parameterObject),
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
    unknown: [],
  };

  for (const param of iterateOasParams.call(this, path, operation)) {
    let kind: string;
    if (isReferenceObject(param)) {
      kind = getComponentName(this.references, param.$ref) ?? '';
    } else {
      kind = param.in;
    }

    // TODO: Test with both path-level and op-level parameters!
    if (kind === 'unknownParameters') kind = 'unknown';

    const target = params[kind || 'unknown'];
    if (!Array.isArray(target)) continue;

    if (isReferenceObject(param)) {
      target.push(syncReferenceObject(param, this.references));
    } else {
      target.push(translateParameterObject.call(this, param));
    }
  }

  const res = {
    ...pickBy(
      {
        body: translateRequestBody.call(this, void 0, operation?.requestBody),
      },
      isNonNullable,
    ),

    headers: params.header,
    query: params.query,
    cookie: params.cookie,
    path: params.path,
    unknown: params.unknown,
  };

  if (res.unknown && !res.unknown.length) {
    delete res.unknown;
  }

  return res;
});

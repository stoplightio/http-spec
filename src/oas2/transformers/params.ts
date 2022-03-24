import { isPlainObject } from '@stoplight/json';
import {
  DeepPartial,
  HttpParamStyles,
  IHttpEncoding,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
  Optional,
} from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import type {
  BodyParameter,
  FormDataParameter,
  Header,
  HeaderParameter,
  PathParameter,
  QueryParameter,
} from 'swagger-schema-official';
import pickBy = require('lodash.pickby');
import pick = require('lodash.pick');

import { isBoolean, isNonNullable, isString } from '../../guards';
import { Oas2ParamBase } from '../../oas/guards';
import { translateSchemaObject } from '../../oas/transformers/schema';
import { ArrayCallbackParameters } from '../../types';
import { entries } from '../../utils';
import { getExamplesFromSchema } from '../accessors';
import { isHeaderParam } from '../guards';
import { Oas2TranslateFunction } from '../types';

function chooseQueryParameterStyle(
  parameter: DeepPartial<QueryParameter>,
):
  | HttpParamStyles.PipeDelimited
  | HttpParamStyles.SpaceDelimited
  | HttpParamStyles.Form
  | HttpParamStyles.CommaDelimited {
  /** Must cast to 'any' because this field is missing from the types but it's defined in the spec
   * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
   */
  switch (parameter.collectionFormat) {
    case 'pipes':
      return HttpParamStyles.PipeDelimited;
    case 'ssv':
      return HttpParamStyles.SpaceDelimited;
    case 'csv':
      return HttpParamStyles.CommaDelimited;
    case 'multi':
    default:
      /**
       * This implementation is, in fact, not fully compliant with oas3.
       * As per oas3 spec: "Form style parameters defined by RFC6570.
       *                    This option replaces collectionFormat with a csv
       *                    (when explode is false) or multi (when explode is true)
       *                    value from OpenAPI 2.0."
       * But since there is no such property like 'explode' in oas2 we are defaulting to 'form'.
       */
      return HttpParamStyles.Form;
  }
}

export const translateToHeaderParam: Oas2TranslateFunction<
  [param: DeepPartial<HeaderParameter> & Oas2ParamBase & { in: 'header' }],
  IHttpHeaderParam
> = function (parameter) {
  return {
    style: HttpParamStyles.Simple,
    name: parameter.name,
    ...buildSchemaForParameter.call(this, parameter),
    required: !!parameter.required,
  };
};

const translateToHeaderParamsFromPair: Oas2TranslateFunction<
  ArrayCallbackParameters<[name: string, value: unknown]>,
  Optional<IHttpHeaderParam>
> = function ([name, value]) {
  if (!isPlainObject(value)) return;
  const param = { name, in: 'header', ...value };
  if (!isHeaderParam(param)) return;
  return translateToHeaderParam.call(this, param);
};

export const translateToHeaderParams: Oas2TranslateFunction<[headers: unknown], IHttpHeaderParam[]> = function (
  headers,
) {
  return entries(headers).map(translateToHeaderParamsFromPair, this).filter(isNonNullable);
};

export const translateToBodyParameter: Oas2TranslateFunction<
  [body: BodyParameter, consumes: string[]],
  IHttpOperationRequestBody
> = function (body, consumes) {
  const examples = entries(body['x-examples'] || (body.schema ? getExamplesFromSchema(body.schema) : void 0)).map(
    ([key, value]) => ({ key, value }),
  );

  return pickBy({
    description: body.description,
    required: body.required,
    contents: consumes.map(mediaType => {
      return {
        mediaType,
        schema: isPlainObject(body.schema) ? translateSchemaObject.call(this, body.schema) : void 0,
        examples,
      };
    }),
  });
};

export const translateFromFormDataParameters: Oas2TranslateFunction<
  [parameters: FormDataParameter[], consumes: string[]],
  IHttpOperationRequestBody
> = function (parameters, consumes) {
  const finalBody: IHttpOperationRequestBody = {
    contents: consumes.map(mediaType => ({
      mediaType,
      schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
      },
    })),
  };

  return parameters.reduce((body, parameter) => {
    const { schema, description } = buildSchemaForParameter.call(this, parameter);
    (body.contents || []).forEach(content => {
      delete schema.$schema;

      if (description) {
        schema.description = description;
      }

      content.schema ||= {};
      content.schema.properties ||= {};
      content.schema.properties[parameter.name] = schema;

      if (parameter.required) {
        (content.schema.required ||= []).push(parameter.name);
      }

      if (parameter.collectionFormat) {
        content.encodings = content.encodings || [];
        const encoding = buildEncoding(parameter);
        if (encoding) {
          content.encodings.push(encoding);
        }
      }
    });
    return body;
  }, finalBody);
};

function buildEncoding(parameter: FormDataParameter): IHttpEncoding | null {
  switch (parameter.collectionFormat) {
    case 'csv':
      return {
        property: parameter.name,
        style: HttpParamStyles.CommaDelimited,
        explode: false,
      };
    case 'pipes':
      return {
        property: parameter.name,
        style: HttpParamStyles.PipeDelimited,
        explode: false,
      };
    case 'multi':
      return {
        property: parameter.name,
        style: HttpParamStyles.Form,
        explode: true,
      };
    case 'ssv':
      return {
        property: parameter.name,
        style: HttpParamStyles.SpaceDelimited,
        explode: false,
      };
  }
  return null;
}

export const translateToQueryParameter: Oas2TranslateFunction<
  [query: DeepPartial<QueryParameter> & Oas2ParamBase],
  IHttpQueryParam
> = function (query) {
  return {
    style: chooseQueryParameterStyle(query),
    name: query.name,
    required: !!query.required,
    ...buildSchemaForParameter.call(this, query),

    ...pickBy(
      {
        allowEmptyValue: query.allowEmptyValue,
      },
      isBoolean,
    ),
  };
};

export const translateToPathParameter: Oas2TranslateFunction<
  [param: DeepPartial<PathParameter> & Oas2ParamBase],
  IHttpPathParam
> = function (param) {
  return {
    name: param.name,
    style: HttpParamStyles.Simple,
    required: !!param.required,
    ...buildSchemaForParameter.call(this, param),
  };
};

const buildSchemaForParameter: Oas2TranslateFunction<
  [param: DeepPartial<QueryParameter | PathParameter | HeaderParameter | FormDataParameter | Header>],
  { schema: JSONSchema7; description?: string; deprecated?: boolean }
> = function (param) {
  const schema = pick(
    param,
    'type',
    'format',
    'default',
    'enum',
    'exclusiveMaximum',
    'exclusiveMinimum',
    'maxItems',
    'maxLength',
    'maximum',
    'minItems',
    'minimum',
    'minLength',
    'title',
    'items',
    'pattern',
    'uniqueItems',
    'multipleOf',
  ) as Record<string, unknown>;

  if ('allowEmptyValue' in param && param.allowEmptyValue === false) {
    schema.minLength = 1;
  }

  return {
    schema: translateSchemaObject.call(this, schema),
    deprecated: !!param['x-deprecated'],

    ...pickBy(
      {
        description: param.description,
      },
      isString,
    ),
  };
};

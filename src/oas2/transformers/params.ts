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
import pick from 'lodash.pick';
import pickBy from 'lodash.pickby';
import type {
  BodyParameter,
  FormDataParameter,
  Header,
  HeaderParameter,
  PathParameter,
  QueryParameter,
} from 'swagger-schema-official';

import { withContext } from '../../context';
import { isBoolean, isNonNullable, isString } from '../../guards';
import { Oas2ParamBase } from '../../oas/guards';
import { translateToDefaultExample } from '../../oas/transformers/examples';
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

export const translateToHeaderParam = withContext<
  Oas2TranslateFunction<[param: DeepPartial<HeaderParameter> & Oas2ParamBase & { in: 'header' }], IHttpHeaderParam>
>(function (param) {
  const name = param.name;

  return {
    id: this.generateId(`http_header-${this.parentId}-${name}`),
    name,
    style: HttpParamStyles.Simple,
    ...buildSchemaForParameter.call(this, param),

    ...pickBy(
      {
        required: param.required,
      },
      isBoolean,
    ),
  };
});

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

export const translateToBodyParameter = withContext<
  Oas2TranslateFunction<[body: BodyParameter, consumes: string[]], IHttpOperationRequestBody>
>(function (body, consumes) {
  const examples = entries(body['x-examples'] || getExamplesFromSchema(body.schema)).map(([key, value]) =>
    translateToDefaultExample.call(this, key, value),
  );

  return {
    id: this.generateId(`http_request_body-${this.parentId}`),

    contents: consumes.map(
      withContext(mediaType => {
        return {
          id: this.generateId(`http_media-${this.parentId}-${mediaType}`),
          mediaType,
          schema: isPlainObject(body.schema) ? translateSchemaObject.call(this, body.schema) : void 0,
          examples,
        };
      }),
      this,
    ),

    ...pickBy(
      {
        required: body.required,
      },
      isBoolean,
    ),

    ...pickBy(
      {
        description: body.description,
      },
      isString,
    ),
  };
});

export const translateFromFormDataParameters = withContext<
  Oas2TranslateFunction<
    [parameters: (Oas2ParamBase & Partial<FormDataParameter>)[], consumes: string[]],
    IHttpOperationRequestBody
  >
>(function (parameters, consumes) {
  const finalBody: IHttpOperationRequestBody = {
    id: this.generateId(`http_request_body-${this.parentId}`),
    contents: consumes.map(
      withContext(mediaType => ({
        id: this.generateId(`http_media-${this.parentId}-${mediaType}`),
        mediaType,
        schema: translateSchemaObject.call(this, { type: 'object' }),
      })),
      this,
    ),
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
});

function buildEncoding(parameter: Oas2ParamBase & Partial<FormDataParameter>): IHttpEncoding | null {
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

export const translateToQueryParameter = withContext<
  Oas2TranslateFunction<[query: DeepPartial<QueryParameter> & Oas2ParamBase], IHttpQueryParam>
>(function (param) {
  const name = param.name;

  return {
    id: this.generateId(`http_query-${this.parentId}-${name}`),
    name,
    style: chooseQueryParameterStyle(param),

    ...buildSchemaForParameter.call(this, param),

    ...pickBy(
      {
        allowEmptyValue: param.allowEmptyValue,
        required: param.required,
      },
      isBoolean,
    ),
  };
});

export const translateToPathParameter = withContext<
  Oas2TranslateFunction<[param: DeepPartial<PathParameter> & Oas2ParamBase], IHttpPathParam>
>(function (param) {
  const name = param.name;

  return {
    id: this.generateId(`http_path_param-${this.parentId}-${name}`),
    name,
    style: HttpParamStyles.Simple,

    ...buildSchemaForParameter.call(this, param),

    ...pickBy(
      {
        required: param.required,
      },
      isBoolean,
    ),
  };
});

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

    ...pickBy(
      {
        deprecated: param['x-deprecated'],
      },
      isBoolean,
    ),
    ...pickBy(
      {
        description: param.description,
      },
      isString,
    ),
  };
};

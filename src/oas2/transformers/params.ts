import {
  DeepPartial,
  HttpParamStyles,
  IHttpEncoding,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
} from '@stoplight/types';
import { JSONSchema7 } from 'json-schema';
import { get, map, pick, pickBy, set } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';
import {
  BodyParameter,
  FormDataParameter,
  Header,
  HeaderParameter,
  PathParameter,
  QueryParameter,
  Spec,
} from 'swagger-schema-official';

import { translateSchemaObject } from '../../oas/transformers/schema';
import { isDictionary } from '../../utils';
import { getExamplesFromSchema } from './getExamplesFromSchema';

function chooseQueryParameterStyle(
  parameter: QueryParameter,
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

export function translateToHeaderParam(document: DeepPartial<Spec>, parameter: HeaderParameter): IHttpHeaderParam {
  return (pickBy({
    ...buildSchemaForParameter(document, parameter),
    name: parameter.name,
    style: HttpParamStyles.Simple,
    required: parameter.required,
  }) as unknown) as IHttpHeaderParam;
}

export function translateToHeaderParams(
  document: DeepPartial<Spec>,
  headers: { [headerName: string]: Header },
): IHttpHeaderParam[] {
  return map(headers, (header, name) => {
    const { schema, description } = buildSchemaForParameter(document, Object.assign({ name }, header));

    const param: IHttpHeaderParam = {
      name,
      style: HttpParamStyles.Simple,
      schema,
      description,
    };

    return param;
  });
}

export function translateToBodyParameter(
  document: DeepPartial<OpenAPIObject>,
  body: BodyParameter,
  consumes: string[],
): IHttpOperationRequestBody {
  const examples = map(
    get(body, 'x-examples') || (body.schema ? getExamplesFromSchema(body.schema) : void 0),
    (value, key) => ({ key, value }),
  );

  return pickBy({
    description: body.description,
    required: body.required,
    contents: consumes.map(mediaType => {
      return {
        mediaType,
        schema: isDictionary(body.schema) ? translateSchemaObject(document, body.schema) : void 0,
        examples,
      };
    }),
  });
}

export function translateFromFormDataParameters(
  document: DeepPartial<Spec>,
  parameters: FormDataParameter[],
  consumes: string[],
): IHttpOperationRequestBody {
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
    const { schema, description } = buildSchemaForParameter(document, parameter);
    (body.contents || []).forEach(content => {
      delete schema.$schema;

      if (description) {
        schema.description = description;
      }

      set(content, `schema.properties.${parameter.name}`, schema);

      if (parameter.required) {
        const requiredIndex = get(content, 'schema.required.length', 0);
        set(content, `schema.required.${requiredIndex}`, parameter.name);
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
}

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

export function translateToQueryParameter(document: DeepPartial<Spec>, query: QueryParameter): IHttpQueryParam {
  return (pickBy({
    ...buildSchemaForParameter(document, query),
    allowEmptyValue: query.allowEmptyValue,
    name: query.name,
    style: chooseQueryParameterStyle(query),
    required: query.required,
  }) as unknown) as IHttpQueryParam;
}

export function translateToPathParameter(document: DeepPartial<Spec>, parameter: PathParameter): IHttpPathParam {
  return (pickBy({
    ...buildSchemaForParameter(document, parameter),
    name: parameter.name,
    style: HttpParamStyles.Simple,
    required: parameter.required,
  }) as unknown) as IHttpPathParam;
}

function buildSchemaForParameter(
  document: DeepPartial<Spec>,
  param: QueryParameter | PathParameter | HeaderParameter | FormDataParameter | Header,
): { schema: JSONSchema7; description?: string } {
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
  );

  if ('allowEmptyValue' in param && param.allowEmptyValue === false) {
    schema.minLength = 1;
  }

  return {
    schema: translateSchemaObject(document, schema),
    description: param.description,
    ...('x-deprecated' in param && { deprecated: param['x-deprecated'] }),
  };
}

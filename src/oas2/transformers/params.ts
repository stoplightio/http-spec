import {
  HttpParamStyles,
  IHttpEncoding,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
} from '@stoplight/types';
import { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import { get, map, pick, pickBy, set } from 'lodash';
import {
  BodyParameter,
  FormDataParameter,
  Header,
  HeaderParameter,
  PathParameter,
  QueryParameter,
  Schema,
} from 'swagger-schema-official';

function chooseQueryParameterStyle(
  parameter: QueryParameter,
): HttpParamStyles.PipeDelimited | HttpParamStyles.SpaceDelimited | HttpParamStyles.Form {
  /** Must cast to 'any' because this field is missing from the types but it's defined in the spec
   * https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#parameterObject
   */
  switch (parameter.collectionFormat) {
    case 'pipes':
      return HttpParamStyles.PipeDelimited;
    case 'ssv':
      return HttpParamStyles.SpaceDelimited;
    case 'csv':
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

export function translateToHeaderParam(parameter: HeaderParameter): IHttpHeaderParam {
  return (pickBy({
    ...buildSchemaForParameter(parameter),
    name: parameter.name,
    style: HttpParamStyles.Simple,
    required: parameter.required,
  }) as unknown) as IHttpHeaderParam;
}

export function translateToHeaderParams(headers: { [headerName: string]: Header }): IHttpHeaderParam[] {
  return map(headers, (header, name) => {
    const param: IHttpHeaderParam = {
      ...buildSchemaForParameter(Object.assign({ name }, header)),
      name,
      style: HttpParamStyles.Simple,
    };
    return param;
  });
}

export function translateToBodyParameter(body: BodyParameter, consumes: string[]): IHttpOperationRequestBody {
  const examples = map(get(body, 'x-examples'), (value, key) => ({ key, value }));

  return pickBy({
    description: body.description,
    required: body.required,
    contents: consumes.map(mediaType => {
      return {
        mediaType,
        schema: body.schema,
        examples,
      };
    }),
  });
}

export function translateFromFormDataParameters(
  parameters: FormDataParameter[],
  consumes: string[],
): IHttpOperationRequestBody {
  const finalBody: IHttpOperationRequestBody = {
    contents: consumes.map(mediaType => ({
      mediaType,
      schema: {
        type: 'object',
      },
    })),
  };

  return parameters.reduce((body, parameter) => {
    const { schema } = buildSchemaForParameter(parameter);
    (body.contents || []).forEach(content => {
      // workaround... JSONSchema4 does not support `allowEmptyValue`
      if ('allowEmptyValue' in parameter) {
        Object.assign(schema, { allowEmptyValue: parameter.allowEmptyValue });
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
        style: HttpParamStyles.Form,
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

export function translateToQueryParameter(query: QueryParameter): IHttpQueryParam {
  return (pickBy({
    ...buildSchemaForParameter(query),
    allowEmptyValue: query.allowEmptyValue,
    name: query.name,
    style: chooseQueryParameterStyle(query),
    required: query.required,
  }) as unknown) as IHttpQueryParam;
}

export function translateToPathParameter(parameter: PathParameter): IHttpPathParam {
  return (pickBy({
    ...buildSchemaForParameter(parameter),
    name: parameter.name,
    style: HttpParamStyles.Simple,
    required: parameter.required,
  }) as unknown) as IHttpPathParam;
}

function buildSchemaForParameter(
  param: QueryParameter | PathParameter | HeaderParameter | FormDataParameter | Header,
): { schema: JSONSchema4 | JSONSchema6 | JSONSchema7 } {
  const schema: Schema = pick(
    param,
    'type',
    'format',
    'default',
    'description',
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

  return { schema };
}

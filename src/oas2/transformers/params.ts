import {
  HttpParamStyles,
  IHttpContent,
  IHttpEncoding,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
} from '@stoplight/types';
import { defaults, get, map, pick, pickBy } from 'lodash';
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
    ...buildContentFromParameter(parameter),
    name: parameter.name,
    style: HttpParamStyles.Simple,
    required: parameter.required,
  }) as unknown) as IHttpHeaderParam;
}

export function translateToHeaderParams(headers: { [headerName: string]: Header }): IHttpHeaderParam[] {
  return map(headers, (header, name) => {
    const param: IHttpHeaderParam = {
      ...buildContentFromParameter(Object.assign({ name }, header)),
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

export function translateFromFormDataParameter(
  form: FormDataParameter,
  requestBody: IHttpOperationRequestBody | null | undefined,
  consumes: string[],
): IHttpOperationRequestBody {
  const baseContent = buildContentFromParameter(form);

  const requestBodyCopy: IHttpOperationRequestBody = Object.assign(
    {},
    requestBody || {
      allowEmptyValue: form.allowEmptyValue,
      contents: consumes.map(mediaType => ({
        ...baseContent,
        mediaType,
      })),
    },
  );
  const bodyContent = requestBodyCopy.contents && requestBodyCopy.contents[0];

  if (bodyContent) {
    bodyContent.schema = bodyContent.schema || baseContent.schema;

    const encoding: IHttpEncoding = {
      property: form.name,
      style: HttpParamStyles.Form,
    };

    bodyContent.encodings = (bodyContent.encodings || []).concat(encoding);
  }

  return requestBodyCopy;
}

export function translateToQueryParameter(query: QueryParameter): IHttpQueryParam {
  return (pickBy({
    ...buildContentFromParameter(query),
    allowEmptyValue: query.allowEmptyValue,
    name: query.name,
    style: chooseQueryParameterStyle(query),
    required: query.required,
  }) as unknown) as IHttpQueryParam;
}

export function translateToPathParameter(parameter: PathParameter): IHttpPathParam {
  return (pickBy({
    ...buildContentFromParameter(parameter),
    name: parameter.name,
    style: HttpParamStyles.Simple,
    required: parameter.required,
  }) as unknown) as IHttpPathParam;
}

function buildContentFromParameter(
  param: QueryParameter | PathParameter | HeaderParameter | FormDataParameter | Header,
): IHttpContent {
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

  return {
    schema: pickBy(
      defaults<Schema, Schema>(schema, {
        minLength: 'allowEmptyValue' in param && param.allowEmptyValue ? 1 : undefined,
      }),
    ),
  };
}

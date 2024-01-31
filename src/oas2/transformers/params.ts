import { isPlainObject } from '@stoplight/json';
import {
  DeepPartial,
  HttpParamStyles,
  IBundledHttpService,
  IHttpEncoding,
  IHttpHeaderParam,
  IHttpOperationRequestBody,
  IHttpPathParam,
  IHttpQueryParam,
  Optional,
  Reference,
} from '@stoplight/types';
import type { JSONSchema7 } from 'json-schema';
import { pick, pickBy } from 'lodash';
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
import { isReferenceObject, isValidOas2ParameterObject } from '../../oas/guards';
import { getSharedKey, setSharedKey } from '../../oas/resolver';
import { translateToDefaultExample } from '../../oas/transformers/examples';
import { translateSchemaObject } from '../../oas/transformers/schema';
import type { Oas2ParamBase } from '../../oas/types';
import { ArrayCallbackParameters, Fragment } from '../../types';
import { entries } from '../../utils';
import { getExamplesFromSchema } from '../accessors';
import { isHeaderParam, isPathParam, isQueryParam } from '../guards';
import { Oas2TranslateFunction } from '../types';

type QueryParameterStyle = {
  style:
    | HttpParamStyles.Unspecified
    | HttpParamStyles.Form
    | HttpParamStyles.CommaDelimited
    | HttpParamStyles.SpaceDelimited
    | HttpParamStyles.PipeDelimited
    | HttpParamStyles.TabDelimited;
  explode?: boolean;
};

const FORM_DATA_CONSUMES = ['application/x-www-form-urlencoded', 'multipart/form-data'];

function chooseQueryParameterStyle(parameter: DeepPartial<QueryParameter>): QueryParameterStyle {
  if (parameter.type !== 'array') {
    return { style: HttpParamStyles.Unspecified };
  }

  switch (parameter.collectionFormat) {
    case 'csv':
      return { style: HttpParamStyles.CommaDelimited };
    case 'ssv':
      return { style: HttpParamStyles.SpaceDelimited };
    case 'tsv':
      return { style: HttpParamStyles.TabDelimited };
    case 'pipes':
      return { style: HttpParamStyles.PipeDelimited };
    case 'multi':
      return { style: HttpParamStyles.Form, explode: true };
    default:
      return { style: HttpParamStyles.CommaDelimited };
  }
}

export const translateToHeaderParam = withContext<
  Oas2TranslateFunction<
    [param: DeepPartial<HeaderParameter> & Oas2ParamBase & { in: 'header' }],
    IHttpHeaderParam<true>
  >
>(function (param) {
  const name = param.name;
  const keyOrName = getSharedKey(param, name);

  return {
    id: this.generateId.httpHeader({ keyOrName, componentType: 'parameter' }),
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
  Optional<IHttpHeaderParam<true> | (Pick<IHttpHeaderParam<true>, 'name'> & Reference)>
> = function ([name, value]) {
  if (isReferenceObject(value)) {
    (value as Pick<IHttpHeaderParam<true>, 'name'> & Reference).name = name;
    return value as Pick<IHttpHeaderParam<true>, 'name'> & Reference;
  }

  if (!isPlainObject(value)) return;
  const param = { name, in: 'header', ...value };
  if (!isHeaderParam(param)) return;
  return translateToHeaderParam.call(this, param);
};

export const translateToHeaderParams: Oas2TranslateFunction<
  [headers: unknown],
  (IHttpHeaderParam<true> | (Pick<IHttpHeaderParam<true>, 'name'> & Reference))[]
> = function (headers) {
  return entries(headers).map(translateToHeaderParamsFromPair, this).filter(isNonNullable);
};

export const translateToBodyParameter = withContext<
  Oas2TranslateFunction<[body: BodyParameter, consumes: string[]], IHttpOperationRequestBody>
>(function (body, consumes) {
  const id = this.generateId.httpRequestBody({});

  const examples = entries(body['x-examples'] || getExamplesFromSchema(body.schema)).map(([key, value]) =>
    translateToDefaultExample.call(this, key, value),
  );

  const nonFormDataConsumes = consumes.filter(c => !FORM_DATA_CONSUMES.includes(c));

  return {
    id,

    contents: nonFormDataConsumes.map(
      withContext(mediaType => {
        return {
          id: this.generateId.httpMedia({ mediaType }),
          mediaType,
          examples,

          ...pickBy(
            {
              schema: isPlainObject(body.schema) ? translateSchemaObject.call(this, body.schema) : void 0,
            },
            isNonNullable,
          ),
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

    ...pickBy(
      {
        name: body.name,
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
  const formDataConsumes = consumes.filter(c => FORM_DATA_CONSUMES.includes(c));
  const finalBody: Omit<IHttpOperationRequestBody, 'contents'> & Required<Pick<IHttpOperationRequestBody, 'contents'>> =
    {
      id: this.generateId.httpRequestBody({ consumes: formDataConsumes }),
      contents: formDataConsumes.map(
        withContext(mediaType => ({
          id: this.generateId.httpMedia({ mediaType }),
          mediaType,

          ...pickBy(
            {
              schema:
                parameters.length > 0 ? translateSchemaObject.call(this, { type: 'object', properties: {} }) : void 0,
            },
            isNonNullable,
          ),
        })),
        this,
      ),
    };

  return parameters.reduce((body, parameter) => {
    const { schema = {}, description } = buildSchemaForParameter.call(this, parameter);
    delete schema.$schema;
    delete schema['x-stoplight'];

    for (const content of body.contents) {
      if (typeof description === 'string' && description.length > 0) {
        schema.description = description;
      }

      content.schema!.properties![parameter.name] = schema;

      if (parameter.required) {
        (content.schema!.required ??= []).push(parameter.name);
      }

      const encoding = buildEncoding(parameter);
      if (encoding) {
        (content.encodings ??= []).push(encoding);
      }
    }

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
  Oas2TranslateFunction<[query: DeepPartial<QueryParameter> & Oas2ParamBase], IHttpQueryParam<true>>
>(function (param) {
  const name = param.name;
  const keyOrName = getSharedKey(param, name);

  return {
    id: this.generateId.httpQuery({ keyOrName }),
    name,
    ...chooseQueryParameterStyle(param),

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
  Oas2TranslateFunction<[param: DeepPartial<PathParameter> & Oas2ParamBase], IHttpPathParam<true>>
>(function (param) {
  const name = param.name;
  const keyOrName = getSharedKey(param, name);

  return {
    id: this.generateId.httpPathParam({ keyOrName }),
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
  { schema?: JSONSchema7; description?: string; deprecated?: boolean }
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
    ...pickBy(
      {
        schema: Object.keys(schema).length > 0 ? translateSchemaObject.call(this, schema) : void 0,
      },
      isNonNullable,
    ),

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

type ParameterComponents = Pick<
  IBundledHttpService['components'],
  'query' | 'header' | 'path' | 'cookie' | 'unknownParameters'
>;

export const translateToSharedParameters = withContext<Oas2TranslateFunction<[root: Fragment], ParameterComponents>>(
  function (root) {
    const sharedParameters: ParameterComponents = {
      header: [],
      query: [],
      cookie: [],
      path: [],
      unknownParameters: [],
    };

    for (const [key, value] of entries(root.parameters)) {
      setSharedKey(value, key);

      if (!isValidOas2ParameterObject(value) || value.in === 'formData' || value.in === 'body') continue;

      this.references[`#/parameters/${key}`] = {
        resolved: true,
        value: `#/components/${value.in}/${sharedParameters[value.in].length}`,
      };

      if (isQueryParam(value)) {
        sharedParameters.query.push({
          key,
          ...translateToQueryParameter.call(this, value),
        });
      } else if (isPathParam(value)) {
        sharedParameters.path.push({
          key,
          ...(translateToPathParameter.call(this, value) as any),
        });
      } else if (isHeaderParam(value)) {
        sharedParameters.header.push({
          key,
          ...translateToHeaderParam.call(this, value),
        });
      }
    }

    return sharedParameters;
  },
);

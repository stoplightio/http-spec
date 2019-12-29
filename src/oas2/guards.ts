import { Dictionary } from '@stoplight/types';
import { isObject } from 'lodash';
import {
  BodyParameter,
  FormDataParameter,
  HeaderParameter,
  Parameter,
  PathParameter,
  QueryParameter,
  Security,
  Tag,
} from 'swagger-schema-official';

export function isSecurityScheme(maybeSecurityScheme: unknown): maybeSecurityScheme is Security {
  return isObject(maybeSecurityScheme) && typeof (maybeSecurityScheme as Dictionary<unknown>).type === 'string';
}

export function isBodyParameter(parameter: Parameter): parameter is BodyParameter {
  return parameter.in === 'body';
}

export function isFormDataParameter(parameter: Parameter): parameter is FormDataParameter {
  return parameter.in === 'formData';
}

export function isQueryParameter(parameter: Parameter): parameter is QueryParameter {
  return parameter.in === 'query';
}

export function isPathParameter(parameter: Parameter): parameter is PathParameter {
  return parameter.in === 'path';
}

export function isHeaderParameter(parameter: Parameter): parameter is HeaderParameter {
  return parameter.in === 'header';
}

export const isTagObject = (maybeTagObject: unknown): maybeTagObject is Tag => {
  if (isObject(maybeTagObject) && 'name' in maybeTagObject) {
    return typeof (maybeTagObject as Tag).name === 'string';
  }

  return false;
};

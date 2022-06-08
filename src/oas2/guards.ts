import { isPlainObject } from '@stoplight/json';
import type { Response, Security } from 'swagger-schema-official';

import { isValidOas2ParameterObject } from '../oas/guards';
import type { Oas2ParamBase } from '../oas/types';

export function isSecurityScheme(maybeSecurityScheme: unknown): maybeSecurityScheme is Security {
  return isPlainObject(maybeSecurityScheme) && typeof maybeSecurityScheme.type === 'string';
}

export const isResponseObject = (maybeResponseObject: unknown): maybeResponseObject is Response =>
  isPlainObject(maybeResponseObject) &&
  ('description' in maybeResponseObject ||
    'schema' in maybeResponseObject ||
    'headers' in maybeResponseObject ||
    'examples' in maybeResponseObject);

export function isValidScheme(scheme: unknown): scheme is 'http' | 'https' | 'ws' | 'wss' {
  return typeof scheme === 'string' && ['http', 'https', 'ws', 'wss'].includes(scheme);
}

export function isQueryParam(param: unknown): param is Oas2ParamBase & { in: 'query' } {
  return isValidOas2ParameterObject(param) && param.in === 'query';
}

export function isPathParam(param: unknown): param is Oas2ParamBase & { in: 'path' } {
  return isValidOas2ParameterObject(param) && param.in === 'path';
}

export function isHeaderParam(param: unknown): param is Oas2ParamBase & { in: 'header' } {
  return isValidOas2ParameterObject(param) && param.in === 'header';
}

export function isBodyParam(param: unknown): param is Oas2ParamBase & { in: 'body' } {
  return isValidOas2ParameterObject(param) && param.in === 'body';
}

export function isFormDataParam(param: unknown): param is Oas2ParamBase & { in: 'formData' } {
  return isValidOas2ParameterObject(param) && param.in === 'formData';
}

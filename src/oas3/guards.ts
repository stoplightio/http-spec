import { Dictionary } from '@stoplight/types';
import { isObject } from 'lodash';
import { BaseParameterObject, HeaderObject, SecuritySchemeObject, ServerVariableObject } from 'openapi3-ts';

export const isSecurityScheme = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecuritySchemeObject =>
  isObject(maybeSecurityScheme) && typeof (maybeSecurityScheme as Dictionary<unknown>).type === 'string';

export const isBaseParameterObject = (
  maybeBaseParameterObject: unknown,
): maybeBaseParameterObject is BaseParameterObject =>
  isObject(maybeBaseParameterObject) &&
  ('description' in maybeBaseParameterObject ||
    'required' in maybeBaseParameterObject ||
    'content' in maybeBaseParameterObject ||
    'style' in maybeBaseParameterObject ||
    'examples' in maybeBaseParameterObject ||
    'example' in maybeBaseParameterObject ||
    'name' in maybeBaseParameterObject);

export const isHeaderObject = (maybeHeaderObject: unknown): maybeHeaderObject is HeaderObject =>
  isBaseParameterObject(maybeHeaderObject);

export const isServerVariableObject = (
  maybeServerVariableObject: unknown,
): maybeServerVariableObject is ServerVariableObject => {
  if (!isObject(maybeServerVariableObject)) return false;
  const typeofDefault = typeof (maybeServerVariableObject as Dictionary<unknown>).default;
  return typeofDefault === 'string' || typeofDefault === 'boolean' || typeofDefault === 'number';
};

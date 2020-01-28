import { Dictionary } from '@stoplight/types';
import { isObject } from 'lodash';
import {
  BaseParameterObject,
  HeaderObject,
  MediaTypeObject,
  ResponseObject,
  SecuritySchemeObject,
  ServerObject,
  ServerVariableObject,
  TagObject,
} from 'openapi3-ts';
import { SecurityWithKey } from './accessors';

export const isSecurityScheme = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecuritySchemeObject =>
  isObject(maybeSecurityScheme) && typeof (maybeSecurityScheme as Dictionary<unknown>).type === 'string';

export const isSecuritySchemeWithKey = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecurityWithKey =>
  isSecurityScheme(maybeSecurityScheme) && typeof (maybeSecurityScheme as Dictionary<unknown>).key === 'string';

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
    'schema' in maybeBaseParameterObject ||
    'name' in maybeBaseParameterObject);

export const isHeaderObject = (maybeHeaderObject: unknown): maybeHeaderObject is HeaderObject =>
  isBaseParameterObject(maybeHeaderObject);

export const isServerObject = (maybeServerObject: unknown): maybeServerObject is ServerObject =>
  isObject(maybeServerObject) && typeof (maybeServerObject as Dictionary<unknown>).url === 'string';

export const isServerVariableObject = (
  maybeServerVariableObject: unknown,
): maybeServerVariableObject is ServerVariableObject => {
  if (!isObject(maybeServerVariableObject)) return false;
  const typeofDefault = typeof (maybeServerVariableObject as Dictionary<unknown>).default;
  return typeofDefault === 'string' || typeofDefault === 'boolean' || typeofDefault === 'number';
};

export const isTagObject = (maybeTagObject: unknown): maybeTagObject is TagObject => {
  if (isObject(maybeTagObject) && 'name' in maybeTagObject) {
    return typeof (maybeTagObject as TagObject).name === 'string';
  }

  return false;
};

export const isResponseObject = (maybeResponseObject: unknown): maybeResponseObject is ResponseObject =>
  isObject(maybeResponseObject) &&
  ('description' in maybeResponseObject ||
    'headers' in maybeResponseObject ||
    'content' in maybeResponseObject ||
    'links' in maybeResponseObject);

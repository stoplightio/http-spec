import { isPlainObject } from '@stoplight/json';
import type {
  BaseParameterObject,
  HeaderObject,
  OAuthFlowObject,
  RequestBodyObject,
  ResponseObject,
  SecuritySchemeObject,
  ServerObject,
  ServerVariableObject,
  TagObject,
} from 'openapi3-ts';

import type { SecurityWithKey } from './accessors';

export const isSecurityScheme = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecuritySchemeObject =>
  isPlainObject(maybeSecurityScheme) && typeof maybeSecurityScheme.type === 'string';

export const isSecuritySchemeWithKey = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecurityWithKey =>
  isSecurityScheme(maybeSecurityScheme) && typeof maybeSecurityScheme.key === 'string';

export const isBaseParameterObject = (
  maybeBaseParameterObject: unknown,
): maybeBaseParameterObject is BaseParameterObject =>
  isPlainObject(maybeBaseParameterObject) &&
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
  isPlainObject(maybeServerObject) && typeof maybeServerObject.url === 'string';

export const isServerVariableObject = (
  maybeServerVariableObject: unknown,
): maybeServerVariableObject is ServerVariableObject => {
  if (!isPlainObject(maybeServerVariableObject)) return false;
  const typeofDefault = typeof maybeServerVariableObject.default;
  return typeofDefault === 'string' || typeofDefault === 'boolean' || typeofDefault === 'number';
};

export const isTagObject = (maybeTagObject: unknown): maybeTagObject is TagObject => {
  if (isPlainObject(maybeTagObject) && 'name' in maybeTagObject) {
    return typeof maybeTagObject.name === 'string';
  }

  return false;
};

export const isResponseObject = (maybeResponseObject: unknown): maybeResponseObject is ResponseObject =>
  isPlainObject(maybeResponseObject) &&
  ('description' in maybeResponseObject ||
    'headers' in maybeResponseObject ||
    'content' in maybeResponseObject ||
    'links' in maybeResponseObject);

export const isOAuthFlowObject = (maybeOAuthFlowObject: unknown): maybeOAuthFlowObject is OAuthFlowObject =>
  isPlainObject(maybeOAuthFlowObject) && isPlainObject(maybeOAuthFlowObject.scopes);

export const isRequestBodyObject = (maybeRequestBodyObject: unknown): maybeRequestBodyObject is RequestBodyObject =>
  isPlainObject(maybeRequestBodyObject) && isPlainObject(maybeRequestBodyObject.content);

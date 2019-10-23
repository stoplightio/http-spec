import { Dictionary } from '@stoplight/types';
import { isObject } from 'lodash';
import { BaseParameterObject, HeaderObject, SecuritySchemeObject } from 'openapi3-ts';

export const isSecurityScheme = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecuritySchemeObject =>
  isObject(maybeSecurityScheme) &&
  typeof (maybeSecurityScheme as Dictionary<unknown>).type === 'string';


export const isBaseParameterObject = (maybeBaseParameterObject: unknown): maybeBaseParameterObject is BaseParameterObject =>
  isObject(maybeBaseParameterObject) && (
    'content' in maybeBaseParameterObject ||
    'style' in maybeBaseParameterObject ||
    'examples' in maybeBaseParameterObject ||
    'example' in maybeBaseParameterObject ||
    'name' in maybeBaseParameterObject
  );

export const isHeaderObject = (maybeHeaderObject: unknown): maybeHeaderObject is HeaderObject => isBaseParameterObject(maybeHeaderObject);

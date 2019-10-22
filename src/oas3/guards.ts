import { Dictionary } from '@stoplight/types/dist';
import { isObject } from 'lodash';
import { SecuritySchemeObject } from 'openapi3-ts';

export const isSecurityScheme = (maybeSecurityScheme: unknown): maybeSecurityScheme is SecuritySchemeObject =>
  isObject(maybeSecurityScheme) &&
  typeof (maybeSecurityScheme as Dictionary<unknown>).type === 'string';

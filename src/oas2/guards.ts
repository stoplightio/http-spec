import { IHttpService } from '@stoplight/types';
import { isObject, isString } from 'lodash';
import type { Response, Security, Tag } from 'swagger-schema-official';

import { isDictionary } from '../utils';

export function isSecurityScheme(maybeSecurityScheme: unknown): maybeSecurityScheme is Security {
  return isDictionary(maybeSecurityScheme) && typeof maybeSecurityScheme.type === 'string';
}

export const isTagObject = (maybeTagObject: unknown): maybeTagObject is Tag => {
  if (isObject(maybeTagObject) && 'name' in maybeTagObject) {
    return typeof (maybeTagObject as Tag).name === 'string';
  }

  return false;
};

export const isXLogo = (maybeXLogo: unknown): maybeXLogo is NonNullable<IHttpService['logo']> => {
  if (isDictionary(maybeXLogo)) {
    maybeXLogo.altText = isString(maybeXLogo.altText) ? maybeXLogo.altText : 'logo';
    maybeXLogo.href = isString(maybeXLogo.href) ? maybeXLogo.href : undefined;
    maybeXLogo.url = isString(maybeXLogo.url) ? maybeXLogo.url : undefined;
    maybeXLogo.backgroundColor = isString(maybeXLogo.backgroundColor) ? maybeXLogo.backgroundColor : undefined;
    return true;
  }

  return false;
};

export const isResponseObject = (maybeResponseObject: unknown): maybeResponseObject is Response =>
  isObject(maybeResponseObject) &&
  ('description' in maybeResponseObject ||
    'schema' in maybeResponseObject ||
    'headers' in maybeResponseObject ||
    'examples' in maybeResponseObject);

export function isValidScheme(scheme: unknown) {
  return typeof scheme === 'string' && ['http', 'https', 'ws', 'wss'].includes(scheme);
}

import { Dictionary } from '@stoplight/types';
import { isObject } from 'lodash';
import type { Response, Security, Tag } from 'swagger-schema-official';

export function isSecurityScheme(maybeSecurityScheme: unknown): maybeSecurityScheme is Security {
  return isObject(maybeSecurityScheme) && typeof (maybeSecurityScheme as Dictionary<unknown>).type === 'string';
}

export const isTagObject = (maybeTagObject: unknown): maybeTagObject is Tag => {
  if (isObject(maybeTagObject) && 'name' in maybeTagObject) {
    return typeof (maybeTagObject as Tag).name === 'string';
  }

  return false;
};

export const isResponseObject = (maybeResponseObject: unknown): maybeResponseObject is Response =>
  isObject(maybeResponseObject) &&
  ('description' in maybeResponseObject ||
    'schema' in maybeResponseObject ||
    'headers' in maybeResponseObject ||
    'examples' in maybeResponseObject);

import {
  HttpSecurityScheme,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IBearerSecurityScheme,
  IOauth2SecurityScheme,
} from '@stoplight/types';
import { isEqual, omit } from 'lodash';
import { RequestAuth } from 'postman-collection';

export function transformSecurityScheme(
  auth: RequestAuth,
  nextKey: (type: HttpSecurityScheme['type']) => string,
): HttpSecurityScheme | undefined {
  switch (auth.type) {
    case 'oauth2':
      return {
        key: nextKey('oauth2'),
        type: 'oauth2',
        flows: {},
      } as IOauth2SecurityScheme;

    case 'apikey':
      return {
        key: nextKey('apiKey'),
        type: 'apiKey',
        name: auth.parameters().get('key'),
        in: auth.parameters().get('in') || 'header',
      } as IApiKeySecurityScheme;

    case 'basic':
    case 'digest':
    case 'bearer':
      return {
        key: nextKey('http'),
        type: 'http',
        scheme: auth.type,
      } as IBasicSecurityScheme | IBearerSecurityScheme;

    case 'noauth':
      return;

    default:
      // @todo this is temporary
      console.warn(`Unsupported Postman security scheme: ${auth.type}`);
      return;
  }
}

export function isSecuritySchemeEqual(securityScheme1: HttpSecurityScheme, securityScheme2: HttpSecurityScheme) {
  return isEqual(omit(securityScheme1, 'key'), omit(securityScheme2, 'key'));
}

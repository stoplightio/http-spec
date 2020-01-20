import {
  HttpSecurityScheme,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IBearerSecurityScheme,
  IOauth2SecurityScheme,
} from '@stoplight/types/dist';
import { RequestAuth } from 'postman-collection';

export function transformSecurityScheme(auth: RequestAuth, nextKey: () => string): HttpSecurityScheme | undefined {
  switch (auth.type) {
    case 'oauth2':
      return {
        key: nextKey(),
        type: 'oauth2',
        flows: {},
      } as IOauth2SecurityScheme;

    case 'apikey':
      return {
        key: nextKey(),
        type: 'apiKey',
        name: auth.parameters().get('key'),
        in: auth.parameters().get('in') || 'header',
      } as IApiKeySecurityScheme;

    case 'basic':
    case 'digest':
      return {
        key: nextKey(),
        type: 'http',
        scheme: auth.type,
      } as IBasicSecurityScheme;

    case 'bearer':
      return {
        key: nextKey(),
        type: 'http',
        scheme: 'bearer',
      } as IBearerSecurityScheme;

    case 'noauth':
      return;

    default:
      console.warn(`Unsupported Postman security scheme: ${auth.type}`);
      return;
  }
}

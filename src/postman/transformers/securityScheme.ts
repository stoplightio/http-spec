import {
  HttpSecurityScheme,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IBearerSecurityScheme,
  IOauth2SecurityScheme,
} from '@stoplight/types';
import { HttpParamStyles, IHttpHeaderParam, IHttpQueryParam } from '@stoplight/types/dist';
import { isEqual, omit } from 'lodash';
import { RequestAuth } from 'postman-collection';

export type SecuritySchemeOutcome = StandardSecurityScheme | QuerySecurityScheme | HeaderSecurityScheme;

export type StandardSecurityScheme = {
  type: 'securityScheme';
  securityScheme: HttpSecurityScheme;
};

export type QuerySecurityScheme = {
  type: 'queryParams';
  queryParams: IHttpQueryParam[];
};

export type HeaderSecurityScheme = {
  type: 'headerParams';
  headerParams: IHttpHeaderParam[];
};

export function transformSecurityScheme(
  auth: RequestAuth,
  nextKey: (type: HttpSecurityScheme['type']) => string,
): SecuritySchemeOutcome | undefined {
  switch (auth.type) {
    case 'oauth1':
      if (auth.parameters().get('addParamsToHeader')) {
        return {
          type: 'headerParams',
          headerParams: [
            {
              name: 'Authorization',
              style: HttpParamStyles.Simple,
              description: 'OAuth1 Authorization Header',
            },
          ],
        };
      } else {
        // unsupported case:
        // when body is x-www-form-urlencoded
        return {
          type: 'queryParams',
          queryParams: [
            { name: 'oauth_consumer_key', style: HttpParamStyles.Form },
            { name: 'oauth_token', style: HttpParamStyles.Form },
            {
              name: 'oauth_signature_method',
              style: HttpParamStyles.Form,
              examples: auth.parameters().has('signatureMethod')
                ? [{ key: 'signature_method', value: auth.parameters().get('signatureMethod') }]
                : [],
            },
            { name: 'oauth_timestamp', style: HttpParamStyles.Form, schema: { type: 'integer' } },
            { name: 'oauth_nonce', style: HttpParamStyles.Form },
            {
              name: 'oauth_version',
              style: HttpParamStyles.Form,
              examples: auth.parameters().has('version')
                ? [{ key: 'version', value: auth.parameters().get('version') }]
                : [],
            },
            { name: 'oauth_signature', style: HttpParamStyles.Form },
          ],
        };
      }
    case 'oauth2':
      if (auth.parameters().get('addTokenTo') === 'queryParams') {
        return {
          type: 'queryParams',
          queryParams: [
            {
              name: 'access_token',
              description: 'OAuth2 Access Token',
              style: HttpParamStyles.Form,
            },
          ],
        };
      } else {
        // @todo question: isn't it just Bearer authorization?
        return {
          type: 'headerParams',
          headerParams: [
            {
              name: 'Authorization',
              description: 'OAuth2 Access Token',
              style: HttpParamStyles.Simple,
              schema: {
                type: 'string',
                pattern: '^Bearer .+$',
              },
            },
          ],
        };
      }

    case 'apikey':
      return {
        type: 'securityScheme',
        securityScheme: {
          key: nextKey('apiKey'),
          type: 'apiKey',
          name: auth.parameters().get('key'),
          in: auth.parameters().get('in') || 'header',
        },
      };

    case 'basic':
    case 'digest':
    case 'bearer':
      return {
        type: 'securityScheme',
        securityScheme: {
          key: nextKey('http'),
          type: 'http',
          scheme: auth.type,
        },
      };

    case 'noauth':
      return;

    default:
      return;
  }
}

export function isSecuritySchemeEqual(securityScheme1: HttpSecurityScheme, securityScheme2: HttpSecurityScheme) {
  return isEqual(omit(securityScheme1, 'key'), omit(securityScheme2, 'key'));
}

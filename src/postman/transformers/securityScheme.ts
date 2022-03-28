import { HttpParamStyles, HttpSecurityScheme, IHttpHeaderParam, IHttpQueryParam } from '@stoplight/types';
import type { Collection, RequestAuth } from 'postman-collection';

import { isEqual } from '../../utils';
import { generateId } from '../id';

export type PostmanSecurityScheme = StandardSecurityScheme | QuerySecurityScheme | HeaderSecurityScheme;

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

export function isStandardSecurityScheme(pss: PostmanSecurityScheme): pss is StandardSecurityScheme {
  return pss.type === 'securityScheme';
}

export function transformSecurityScheme(
  auth: RequestAuth,
  nextKey: (type: HttpSecurityScheme['type']) => string,
): PostmanSecurityScheme | undefined {
  const parameters = auth.parameters();

  switch (auth.type) {
    case 'oauth1':
      if (parameters.get('addParamsToHeader')) {
        return {
          type: 'headerParams',
          headerParams: [
            {
              id: generateId(),
              name: 'Authorization',
              style: HttpParamStyles.Simple,
              description: 'OAuth1 Authorization Header',
              required: true,
              examples: [
                {
                  id: generateId(),
                  key: 'default',
                  value:
                    'OAuth ' +
                    [
                      ['realm', parameters.get('realm') || 'a_realm'],
                      ['oauth_consumer_key', 'a_consumer_key'],
                      ['oauth_token', 'a_token'],
                      ['oauth_signature_method', parameters.get('signatureMethod') || 'HMAC-SHA1'],
                      ['oauth_timestamp', parameters.get('timestamp') || '0'],
                      ['oauth_nonce', 'a'],
                      ['oauth_version', parameters.get('version')],
                      ['oauth_signature', 'a_signature'],
                    ]
                      .map(([k, v]) => `${k}="${v}"`)
                      .join(','),
                },
              ],
            },
          ],
        };
      } else {
        // unsupported case:
        // when body is x-www-form-urlencoded
        const required = !parameters.get('addEmptyParamsToSign');
        return {
          type: 'queryParams',
          queryParams: [
            { id: generateId(), name: 'oauth_consumer_key', style: HttpParamStyles.Form, required },
            { id: generateId(), name: 'oauth_token', style: HttpParamStyles.Form, required },
            {
              id: generateId(),
              name: 'oauth_signature_method',
              style: HttpParamStyles.Form,
              required,
              examples: parameters.has('signatureMethod')
                ? [{ id: generateId(), key: 'default', value: parameters.get('signatureMethod') }]
                : [],
            },
            {
              id: generateId(),
              name: 'oauth_timestamp',
              style: HttpParamStyles.Form,
              required,
              schema: { type: 'string' },
              examples: parameters.has('timestamp')
                ? [{ id: generateId(), key: 'default', value: parameters.get('timestamp') }]
                : [],
            },
            { id: generateId(), name: 'oauth_nonce', style: HttpParamStyles.Form, required },
            {
              id: generateId(),
              name: 'oauth_version',
              style: HttpParamStyles.Form,
              required,
              examples: parameters.has('version')
                ? [{ id: generateId(), key: 'default', value: parameters.get('version') }]
                : [],
            },
            { id: generateId(), name: 'oauth_signature', style: HttpParamStyles.Form, required },
          ],
        };
      }
    case 'oauth2':
      if (parameters.get('addTokenTo') === 'queryParams') {
        return {
          type: 'queryParams',
          queryParams: [
            {
              id: generateId(),
              name: 'access_token',
              description: 'OAuth2 Access Token',
              style: HttpParamStyles.Form,
              required: true,
            },
          ],
        };
      } else {
        return {
          type: 'securityScheme',
          securityScheme: {
            id: generateId(),
            key: nextKey('oauth2'),
            type: 'http',
            scheme: 'bearer',
            description: 'OAuth2 Access Token',
          },
        };
      }

    case 'apikey':
      return {
        type: 'securityScheme',
        securityScheme: {
          id: generateId(),
          key: nextKey('apiKey'),
          type: 'apiKey',
          name: parameters.get('key'),
          in: parameters.get('in') || 'header',
        },
      };

    case 'basic':
    case 'digest':
    case 'bearer':
      return {
        type: 'securityScheme',
        securityScheme: {
          id: generateId(),
          key: nextKey('http'),
          type: 'http',
          scheme: auth.type,
        },
      };

    case 'hawk':
      return {
        type: 'headerParams',
        headerParams: [
          {
            id: generateId(),
            name: 'Authorization',
            description: 'Hawk Authorization Header',
            required: true,
            style: HttpParamStyles.Simple,
            schema: {
              type: 'string',
              pattern: '^Hawk .+$',
            },
          },
        ],
      };

    case 'awsv4':
      return {
        type: 'headerParams',
        headerParams: [
          {
            id: generateId(),
            name: 'X-Amz-Security-Token',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            id: generateId(),
            name: 'X-Amz-Date',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            id: generateId(),
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            required: true,
            description: 'AWS v4 Authorization Header',
          },
        ],
      };

    case 'edgegrid':
      return {
        type: 'headerParams',
        headerParams: [
          {
            id: generateId(),
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            required: true,
            description: 'Akamai EdgeGrid Authorization Header',
          },
        ],
      };

    case 'ntlm':
      return {
        type: 'headerParams',
        headerParams: [
          {
            id: generateId(),
            name: 'Authorization',
            description: 'NTLM Authorization Header',
            required: true,
            style: HttpParamStyles.Simple,
            schema: {
              type: 'string',
              pattern: '^NTLM .+$',
            },
          },
        ],
      };

    case 'noauth':
      return;

    default:
      return;
  }
}

export function isPostmanSecuritySchemeEqual(pss1: PostmanSecurityScheme, pss2: PostmanSecurityScheme) {
  if (pss1.type !== pss2.type) return false;

  if (isStandardSecurityScheme(pss1) && isStandardSecurityScheme(pss2)) {
    return isEqual({ ...pss1.securityScheme, key: '' }, { ...pss2.securityScheme, key: '' });
  }

  return isEqual(pss1, pss2);
}

export function transformSecuritySchemes(collection: Collection) {
  const postmanSecuritySchemes: PostmanSecurityScheme[] = [];
  let securitySchemeIdx = 0;

  function addSecurityScheme(pss: PostmanSecurityScheme) {
    if (!postmanSecuritySchemes.find(p => isPostmanSecuritySchemeEqual(p, pss))) {
      postmanSecuritySchemes.push(pss);
    }
  }

  collection.forEachItem(item => {
    const auth = item.getAuth();
    if (auth) {
      const transformed = transformSecurityScheme(auth, type => `${type}-${securitySchemeIdx++}`);
      if (transformed) addSecurityScheme(transformed);
    }
  });

  collection.forEachItemGroup(itemGroup => {
    if (itemGroup.auth) {
      const transformed = transformSecurityScheme(itemGroup.auth, type => `${type}-${securitySchemeIdx++}`);
      if (transformed) addSecurityScheme(transformed);
    }
  });

  return postmanSecuritySchemes;
}

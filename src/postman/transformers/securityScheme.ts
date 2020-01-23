import { HttpParamStyles, HttpSecurityScheme, IHttpHeaderParam, IHttpQueryParam } from '@stoplight/types';
import { isEqual, omit } from 'lodash';
import { RequestAuth } from 'postman-collection';

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

export function isQuerySecurityScheme(pss: PostmanSecurityScheme): pss is QuerySecurityScheme {
  return pss.type === 'queryParams';
}

export function isHeaderSecurityScheme(pss: PostmanSecurityScheme): pss is HeaderSecurityScheme {
  return pss.type === 'headerParams';
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
              name: 'Authorization',
              style: HttpParamStyles.Simple,
              description: 'OAuth1 Authorization Header',
              required: true,
            },
          ],
        };
      } else {
        // unsupported case:
        // when body is x-www-form-urlencoded
        return {
          type: 'queryParams',
          queryParams: [
            { name: 'oauth_consumer_key', style: HttpParamStyles.Form, required: true },
            { name: 'oauth_token', style: HttpParamStyles.Form, required: true },
            {
              name: 'oauth_signature_method',
              style: HttpParamStyles.Form,
              required: true,
              examples: parameters.has('signatureMethod')
                ? [{ key: 'signature_method', value: parameters.get('signatureMethod') }]
                : [],
            },
            { name: 'oauth_timestamp', style: HttpParamStyles.Form, required: true, schema: { type: 'integer' } },
            { name: 'oauth_nonce', style: HttpParamStyles.Form, required: true },
            {
              name: 'oauth_version',
              style: HttpParamStyles.Form,
              required: true,
              examples: parameters.has('version')
                ? [{ key: 'version', value: parameters.get('version') }]
                : [],
            },
            { name: 'oauth_signature', style: HttpParamStyles.Form, required: true },
          ],
        };
      }
    case 'oauth2':
      if (parameters.get('addTokenTo') === 'queryParams') {
        return {
          type: 'queryParams',
          queryParams: [
            {
              name: 'access_token',
              description: 'OAuth2 Access Token',
              style: HttpParamStyles.Form,
              required: true,
            },
          ],
        };
      } else {
        // @todo question: isn't that just Bearer authorization?
        return {
          type: 'headerParams',
          headerParams: [
            {
              name: 'Authorization',
              description: 'OAuth2 Access Token',
              style: HttpParamStyles.Simple,
              required: true,
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
            name: 'X-Amz-Security-Token',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            name: 'X-Amz-Date',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            required: true,
            description: 'AWS v4 Authorization Header',
          },
          // @todo: should be there or not?
          {
            name: 'Host',
            style: HttpParamStyles.Simple,
            required: true,
          },
        ],
      };

    case 'edgegrid':
      return {
        type: 'headerParams',
        headerParams: [
          {
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            required: true,
            description: 'Akamai EdgeGrid Authorization Header',
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
    return isEqual(omit(pss1.securityScheme, 'key'), omit(pss2.securityScheme, 'key'));
  }

  return isEqual(pss1, pss2);
}

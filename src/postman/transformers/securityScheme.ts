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

export function isStandardSecurityScheme(outcome: SecuritySchemeOutcome): outcome is StandardSecurityScheme {
  return outcome.type === 'securityScheme';
}

export function isQuerySecurityScheme(outcome: SecuritySchemeOutcome): outcome is QuerySecurityScheme {
  return outcome.type === 'queryParams';
}

export function isHeaderSecurityScheme(outcome: SecuritySchemeOutcome): outcome is HeaderSecurityScheme {
  return outcome.type === 'headerParams';
}

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
              examples: auth.parameters().has('signatureMethod')
                ? [{ key: 'signature_method', value: auth.parameters().get('signatureMethod') }]
                : [],
            },
            { name: 'oauth_timestamp', style: HttpParamStyles.Form, required: true, schema: { type: 'integer' } },
            { name: 'oauth_nonce', style: HttpParamStyles.Form, required: true },
            {
              name: 'oauth_version',
              style: HttpParamStyles.Form,
              required: true,
              examples: auth.parameters().has('version')
                ? [{ key: 'version', value: auth.parameters().get('version') }]
                : [],
            },
            { name: 'oauth_signature', style: HttpParamStyles.Form, required: true },
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

export function isSecuritySchemeOutcomeEqual(outcome1: SecuritySchemeOutcome, outcome2: SecuritySchemeOutcome) {
  if (outcome1.type !== outcome2.type) return false;

  if (isStandardSecurityScheme(outcome1) && isStandardSecurityScheme(outcome2)) {
    return isEqual(omit(outcome1.securityScheme, 'key'), omit(outcome2.securityScheme, 'key'));
  }

  return isEqual(outcome1, outcome2);
}

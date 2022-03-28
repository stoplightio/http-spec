import { isPlainObject } from '@stoplight/json';
import type {
  DeepPartial,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IOauth2SecurityScheme,
  IOauthFlowObjects,
  Optional,
} from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type {
  ApiKeySecurity,
  BasicAuthenticationSecurity,
  OAuth2AccessCodeSecurity,
  OAuth2ApplicationSecurity,
  OAuth2ImplicitSecurity,
  OAuth2PasswordSecurity,
} from 'swagger-schema-official';

import { isNonNullable, isString } from '../../guards';
import { SecurityWithKey } from '../../oas3/accessors';
import { getSecurities } from '../accessors';
import { isSecurityScheme } from '../guards';
import { Oas2TranslateFunction } from '../types';

export const translateToFlows: Oas2TranslateFunction<[security: Record<string, unknown>], IOauthFlowObjects> =
  function (security) {
    const flows: IOauthFlowObjects = {};

    const scopes = isPlainObject(security.scopes) ? pickBy<unknown, string>(security.scopes, isString) : {};
    const authorizationUrl =
      'authorizationUrl' in security && typeof security.authorizationUrl === 'string' ? security.authorizationUrl : '';
    const tokenUrl = 'tokenUrl' in security && typeof security.tokenUrl === 'string' ? security.tokenUrl : '';

    if (security.flow === 'implicit') {
      flows.implicit = {
        authorizationUrl,
        scopes,
      };
    } else if (security.flow === 'password') {
      flows.password = {
        tokenUrl,
        scopes,
      };
    } else if (security.flow === 'application') {
      flows.clientCredentials = {
        tokenUrl,
        scopes,
      };
    } else if (security.flow === 'accessCode') {
      flows.authorizationCode = {
        authorizationUrl,
        tokenUrl,
        scopes,
      };
    }

    return flows;
  };

export const translateToBasicSecurityScheme: Oas2TranslateFunction<
  [security: DeepPartial<BasicAuthenticationSecurity> & { key: string }],
  IBasicSecurityScheme
> = function (security) {
  return {
    type: 'http',
    scheme: 'basic',
    description: security.description,
    key: security.key,
  };
};

const ACCEPTABLE_SECURITY_ORIGINS: ApiKeySecurity['in'][] = ['query', 'header'];

export const translateToApiKeySecurityScheme: Oas2TranslateFunction<
  [security: DeepPartial<ApiKeySecurity> & { key: string }],
  Optional<IApiKeySecurityScheme>
> = function (security) {
  if ('in' in security && security.in && ACCEPTABLE_SECURITY_ORIGINS.includes(security.in)) {
    return {
      type: 'apiKey',
      in: security.in,
      name: String(security.name || ''),
      description: security.description,
      key: security.key,
    };
  }

  return;
};

const VALID_OAUTH2_FLOWS = ['implicit', 'password', 'application', 'accessCode'];

export const translateToOauth2SecurityScheme: Oas2TranslateFunction<
  [
    security: DeepPartial<
      OAuth2AccessCodeSecurity | OAuth2ApplicationSecurity | OAuth2ImplicitSecurity | OAuth2PasswordSecurity
    > & { key: string },
  ],
  Optional<IOauth2SecurityScheme>
> = function (security) {
  if (!security.flow || !VALID_OAUTH2_FLOWS.includes(security.flow)) return undefined;

  return {
    type: 'oauth2',
    flows: translateToFlows.call(this, security),
    description: security.description,
    key: security.key,
  };
};

export const translateToSingleSecurity: Oas2TranslateFunction<
  [security: unknown & { key: string }],
  Optional<SecurityWithKey>
> = function (security) {
  if (isSecurityScheme(security)) {
    switch (security.type) {
      case 'basic':
        return translateToBasicSecurityScheme.call(this, security);
      case 'apiKey':
        return translateToApiKeySecurityScheme.call(this, security);
      case 'oauth2':
        return translateToOauth2SecurityScheme.call(this, security);
    }
  }

  return;
};

export const translateToSecurities: Oas2TranslateFunction<[operationSecurities: unknown], SecurityWithKey[][]> =
  function (operationSecurities) {
    const securities = getSecurities(this.document, operationSecurities);

    return securities.map(security => security.map(translateToSingleSecurity, this).filter(isNonNullable));
  };

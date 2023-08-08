import { isPlainObject } from '@stoplight/json';
import type {
  DeepPartial,
  HttpSecurityScheme,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IOauth2SecurityScheme,
  IOauthFlowObjects,
  Optional,
} from '@stoplight/types';
import type {
  ApiKeySecurity,
  BasicAuthenticationSecurity,
  OAuth2AccessCodeSecurity,
  OAuth2ApplicationSecurity,
  OAuth2ImplicitSecurity,
  OAuth2PasswordSecurity,
} from 'swagger-schema-official';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isNonNullable, isString } from '../../guards';
import { getExtensions } from '../../oas/accessors';
import { ArrayCallbackParameters, HttpSecurityKind } from '../../types';
import { getSecurities } from '../accessors';
import { isSecurityScheme } from '../guards';
import type { Oas2TranslateFunction } from '../types';

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

export const translateToBasicSecurityScheme = withContext<
  Oas2TranslateFunction<
    [security: DeepPartial<BasicAuthenticationSecurity> & { key: string }, kind: HttpSecurityKind, index: number],
    IBasicSecurityScheme
  >
>(function (security, kind, index) {
  const key = security.key;

  return {
    id: this.generateId.httpSecurity({
      keyOrName: key,
      kind,
      ...(kind === 'requirement'
        ? {
            index,
          }
        : {}),
    }),
    type: 'http',
    scheme: 'basic',
    key,

    ...pickBy(
      {
        description: security.description,
      },
      isString,
    ),

    extensions: getExtensions(security),
  };
});

const ACCEPTABLE_SECURITY_ORIGINS: ApiKeySecurity['in'][] = ['query', 'header'];

export const translateToApiKeySecurityScheme = withContext<
  Oas2TranslateFunction<
    [security: DeepPartial<ApiKeySecurity> & { key: string }, kind: HttpSecurityKind, index: number],
    Optional<IApiKeySecurityScheme>
  >
>(function (security, kind, index) {
  if ('in' in security && security.in && ACCEPTABLE_SECURITY_ORIGINS.includes(security.in)) {
    const key = security.key;

    return {
      id: this.generateId.httpSecurity({
        keyOrName: key,
        kind,
        ...(kind === 'requirement'
          ? {
              index,
            }
          : {}),
      }),
      type: 'apiKey',
      in: security.in,
      name: isString(security.name) ? security.name : '',
      key,

      ...pickBy(
        {
          description: security.description,
        },
        isString,
      ),
      extensions: getExtensions(security),
    };
  }

  return;
});

const VALID_OAUTH2_FLOWS = ['implicit', 'password', 'application', 'accessCode'];

export const translateToOauth2SecurityScheme = withContext<
  Oas2TranslateFunction<
    [
      security: DeepPartial<
        OAuth2AccessCodeSecurity | OAuth2ApplicationSecurity | OAuth2ImplicitSecurity | OAuth2PasswordSecurity
      > & { key: string },
      kind: HttpSecurityKind,
      index: number,
    ],
    Optional<IOauth2SecurityScheme>
  >
>(function (security, kind, index) {
  if (!security.flow || !VALID_OAUTH2_FLOWS.includes(security.flow)) return undefined;
  const key = security.key;

  return {
    id: this.generateId.httpSecurity({
      keyOrName: key,
      kind,
      ...(kind === 'requirement'
        ? {
            index,
          }
        : {}),
    }),
    type: 'oauth2',
    flows: translateToFlows.call(this, security),
    key,

    ...pickBy(
      {
        description: security.description,
      },
      isString,
    ),
    extensions: getExtensions(security),
  };
});

export const translateToSingleSecurity: Oas2TranslateFunction<
  [HttpSecurityKind, ...ArrayCallbackParameters<unknown & { key: string }>],
  Optional<HttpSecurityScheme>
> = function (kind, security, index) {
  if (isSecurityScheme(security)) {
    switch (security.type) {
      case 'basic':
        return translateToBasicSecurityScheme.call(this, security, kind, index);
      case 'apiKey':
        return translateToApiKeySecurityScheme.call(this, security, kind, index);
      case 'oauth2':
        return translateToOauth2SecurityScheme.call(this, security, kind, index);
    }
  }

  return undefined;
};

export const translateToSecurities = withContext<
  Oas2TranslateFunction<[operationSecurities: unknown, kind: HttpSecurityKind], HttpSecurityScheme[][]>
>(function (operationSecurities, kind) {
  this.context = 'service';
  const securities = getSecurities(this.document, operationSecurities);

  return securities.map(security => security.map(translateToSingleSecurity.bind(this, kind)).filter(isNonNullable));
});

import {
  DeepPartial,
  Dictionary,
  HttpSecurityScheme,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IOauth2SecurityScheme,
  IOauthFlowObjects,
} from '@stoplight/types';
import { compact } from 'lodash';
import {
  ApiKeySecurity,
  OAuth2AccessCodeSecurity,
  OAuth2ApplicationSecurity,
  OAuth2ImplicitSecurity,
  OAuth2PasswordSecurity,
  Security,
  Spec,
} from 'swagger-schema-official';
import { getSecurities } from '../accessors';

/**
 * @param security the union with 'any' is purposeful. Passing strict types does not help much here,
 * because all these checks happen in runtime. I'm leaving 'Security' only for visibility.
 */
function translateToFlows(
  security: DeepPartial<
    OAuth2AccessCodeSecurity | OAuth2ApplicationSecurity | OAuth2ImplicitSecurity | OAuth2PasswordSecurity
  >,
): IOauthFlowObjects {
  const flows: IOauthFlowObjects = {};

  const scopes = (security.scopes as Dictionary<string>) || {};
  const authorizationUrl = 'authorizationUrl' in security ? security.authorizationUrl || '' : '';
  const tokenUrl = 'tokenUrl' in security ? security.tokenUrl || '' : '';

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
}

function translateToBasicSecurityScheme(security: DeepPartial<Security>, key: string): IBasicSecurityScheme {
  return {
    type: 'http',
    scheme: 'basic',
    description: security.description,
    key,
  };
}

function translateToApiKeySecurityScheme(
  security: DeepPartial<ApiKeySecurity>,
  key: string,
): IApiKeySecurityScheme | undefined {
  const acceptableSecurityOrigins: ApiKeySecurity['in'][] = ['query', 'header'];

  if ('in' in security && security.in && acceptableSecurityOrigins.includes(security.in)) {
    return {
      type: 'apiKey',
      name: security.name || '',
      in: security.in,
      description: security.description,
      key,
    };
  }

  return undefined;
}

const VALID_OAUTH2_FLOWS = ['implicit', 'password', 'application', 'accessCode'];

function translateToOauth2SecurityScheme(
  security: DeepPartial<
    OAuth2AccessCodeSecurity | OAuth2ApplicationSecurity | OAuth2ImplicitSecurity | OAuth2PasswordSecurity
  >,
  key: string,
): IOauth2SecurityScheme | undefined {
  if (!security.flow || !VALID_OAUTH2_FLOWS.includes(security.flow)) return undefined;

  return {
    type: 'oauth2',
    flows: translateToFlows(security),
    description: security.description,
    key,
  };
}

export function translateToSingleSecurity(security: DeepPartial<Security>, key: string) {
  switch (security.type) {
    case 'basic':
      return translateToBasicSecurityScheme(security, key);
    case 'apiKey':
      return translateToApiKeySecurityScheme(security, key);
    case 'oauth2':
      return translateToOauth2SecurityScheme(security, key);
  }

  return;
}

export function translateToSecurities(
  document: DeepPartial<Spec>,
  operationSecurity: Dictionary<string[], string>[] | undefined,
): HttpSecurityScheme[][] {
  const securities = getSecurities(document, operationSecurity);
  return securities.map(security => compact(security.map(sec => translateToSingleSecurity(sec, sec.key))));
}

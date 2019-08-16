import {
  DeepPartial,
  HttpSecurityScheme,
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IOauth2SecurityScheme,
  IOauthFlowObjects,
} from '@stoplight/types';
import { compact } from 'lodash';
import { ApiKeySecurity, BaseOAuthSecurity, Security } from 'swagger-schema-official';

/**
 * @param security the union with 'any' is purposeful. Passing strict types does not help much here,
 * because all these checks happen in runtime. I'm leaving 'Security' only for visibility.
 */
function translateToFlows(security: DeepPartial<Security> | any): IOauthFlowObjects {
  const tokenAndScope = {
    tokenUrl: security.tokenUrl,
    scopes: security.scopes || {},
  };

  const flowsDict = {
    implicit: ['implicit', { scopes: tokenAndScope.scopes, authorizationUrl: security.authorizationUrl }],
    password: ['password', tokenAndScope],
    application: ['clientCredentials', tokenAndScope],
    accessCode: ['authorizationCode', { ...tokenAndScope, authorizationUrl: security.authorizationUrl }],
  };

  const flow = flowsDict[security.flow];
  return flow ? { [flow[0]]: flow[1] } : {};
}

function translateToBasicSecurityScheme(security: DeepPartial<Security>): IBasicSecurityScheme {
  return {
    type: 'http',
    scheme: 'basic',
    description: security.description,
  };
}

function translateToApiKeySecurityScheme(security: DeepPartial<ApiKeySecurity>): IApiKeySecurityScheme {
  const acceptableSecurityOrigins = ['query', 'header', 'cookie'];

  if (!security.in || !acceptableSecurityOrigins.includes(security.in)) {
    throw new Error(
      `Provided security origin (the 'in' property): '${security.in}' is not valid. Should be one of the following: ${acceptableSecurityOrigins}`,
    );
  }

  return {
    type: 'apiKey',
    name: security.name || 'no name',
    in: security.in as 'query' | 'header' | 'cookie',
    description: security.description,
  };
}

function translateToOauth2SecurityScheme(security: DeepPartial<BaseOAuthSecurity>): IOauth2SecurityScheme {
  return {
    type: 'oauth2',
    flows: translateToFlows(security),
    description: security.description,
  };
}

export function translateToSingleSecurity(security: DeepPartial<Security>) {
  switch (security.type) {
    case 'basic':
      return translateToBasicSecurityScheme(security);
    case 'apiKey':
      return translateToApiKeySecurityScheme(security);
    case 'oauth2':
      return translateToOauth2SecurityScheme(security);
  }

  return;
}

export function translateToSecurities(securities: Security[][]): HttpSecurityScheme[][] {
  return securities.map(security => {
    return compact(security.map(translateToSingleSecurity));
  });
}

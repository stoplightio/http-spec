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
import { ApiKeySecurity, BaseOAuthSecurity, Security, Spec } from 'swagger-schema-official';
import { getSecurities } from '../accessors';

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

function translateToBasicSecurityScheme(security: any, key: string): IBasicSecurityScheme {
  return {
    type: 'http',
    scheme: 'basic',
    description: security.description,
    key,
  };
}

function translateToApiKeySecurityScheme(security: any, key: string): IApiKeySecurityScheme {
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
    key,
  };
}

function translateToOauth2SecurityScheme(security: any, key: string): IOauth2SecurityScheme {
  return {
    type: 'oauth2',
    flows: translateToFlows(security),
    description: security.description,
    key,
  };
}

export function translateToSingleSecurity(security: any, key: string) {
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
  document: Partial<Spec>,
  operationSecurity: Array<Dictionary<string[], string>> | undefined,
): HttpSecurityScheme[][] {
  const securities = getSecurities(document, operationSecurity);
  return securities.map(security =>
    compact(
      security.map(sec => {
        return translateToSingleSecurity(sec, sec.key);
      }),
    ),
  );
}

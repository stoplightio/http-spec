import { DeepPartial, HttpSecurityScheme, IOauthFlowObjects } from '@stoplight/types';
import { pickBy } from 'lodash';
import { OAuthFlowsObject, SecuritySchemeObject } from 'openapi3-ts';

export function translateToSecurities(securities: Partial<SecuritySchemeObject[][]>): HttpSecurityScheme[][] {
  if (!securities) return [];
  return securities.map(security => {
    if (!security) return [];
    return security.map(sec => transformToSingleSecurity(sec, sec.key));
  });
}

export function transformToSingleSecurity(
  securityScheme: DeepPartial<SecuritySchemeObject>,
  key: string,
): HttpSecurityScheme {
  const baseObject: HttpSecurityScheme = {
    name: securityScheme.name as string,
    description: securityScheme.description,
    in: securityScheme.in as 'query' | 'header' | 'cookie',
    type: securityScheme.type as any,
    key,
  };

  if (securityScheme.flows) {
    Object.assign(baseObject, {
      flows: (securityScheme.flows && transformFlows(securityScheme.flows)) || {},
    });
  }

  if (securityScheme.openIdConnectUrl) {
    Object.assign(baseObject, { openIdConnectUrl: securityScheme.openIdConnectUrl });
  }

  if (securityScheme.scheme) {
    Object.assign(baseObject, { scheme: securityScheme.scheme });
  }

  if (securityScheme.bearerFormat) {
    Object.assign(baseObject, { bearerFormat: securityScheme.bearerFormat });
  }

  return baseObject;
}

function transformFlows(flows: DeepPartial<OAuthFlowsObject>): IOauthFlowObjects {
  const transformedFlows: IOauthFlowObjects = {};

  if (flows.password) {
    Object.assign(transformedFlows, {
      password: pickBy({
        refreshUrl: flows.password.refreshUrl,
        scopes: flows.password.scopes || {},
        tokenUrl: flows.password.tokenUrl || '',
      }),
    });
  }

  if (flows.implicit) {
    Object.assign(transformedFlows, {
      implicit: pickBy({
        authorizationUrl: flows.implicit.authorizationUrl || '',
        refreshUrl: flows.implicit.refreshUrl,
        scopes: flows.implicit.scopes || {},
      }),
    });
  }

  if (flows.authorizationCode) {
    Object.assign(transformedFlows, {
      authorizationCode: pickBy({
        authorizationUrl: flows.authorizationCode.authorizationUrl || '',
        refreshUrl: flows.authorizationCode.refreshUrl,
        scopes: flows.authorizationCode.scopes || {},
        tokenUrl: flows.authorizationCode.tokenUrl || '',
      }),
    });
  }

  if (flows.clientCredentials) {
    Object.assign(transformedFlows, {
      clientCredentials: pickBy({
        tokenUrl: flows.clientCredentials.tokenUrl || '',
        refreshUrl: flows.clientCredentials.refreshUrl,
        scopes: flows.clientCredentials.scopes || {},
      }),
    });
  }

  return transformedFlows;
}

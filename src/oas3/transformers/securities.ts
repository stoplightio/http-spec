import { DeepPartial, IOauthFlowObjects } from '@stoplight/types';
import { pickBy } from 'lodash';
import { OAuthFlowsObject, OpenAPIObject } from 'openapi3-ts';
import { getSecurities, OperationSecurities, SecurityWithKey } from '../accessors';

export function translateToSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurities: OperationSecurities,
): SecurityWithKey[][] {
  const securities = getSecurities(document, operationSecurities);

  if (!securities) return [];
  return securities.map(security => {
    if (!security) return [];
    return security.map(sec => transformToSingleSecurity(sec, sec.key));
  });
}

export function transformToSingleSecurity(securityScheme: any, key: string): SecurityWithKey {
  // @ts-ignore
  const baseObject: SecurityWithKey = {
    key,
    description: securityScheme.description,
    type: securityScheme.type as any,
  };

  if (securityScheme.in) {
    Object.assign(baseObject, { name: securityScheme.name as string });
  }

  if (securityScheme.in) {
    Object.assign(baseObject, { in: securityScheme.in as 'query' | 'header' | 'cookie' });
  }

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

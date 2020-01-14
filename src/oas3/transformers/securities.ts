import { DeepPartial, IApiKeySecurityScheme, IOauthFlowObjects, Optional } from '@stoplight/types';
import { compact, isObject, pickBy } from 'lodash';
import { OAuthFlowsObject, OpenAPIObject, SecuritySchemeObject } from 'openapi3-ts';
import { getSecurities, OperationSecurities, SecurityWithKey } from '../accessors';

export function translateToSecurities(document: DeepPartial<OpenAPIObject>, operationSecurities: OperationSecurities) {
  const securities = getSecurities(document, operationSecurities);

  return securities.map(security => compact(security.map(sec => transformToSingleSecurity(sec, sec.key))));
}

export function transformToSingleSecurity(
  securityScheme: SecuritySchemeObject,
  key: string,
): SecurityWithKey | undefined {
  const baseObject: { key: string; description?: string } = {
    key,
  };

  if (securityScheme.description) {
    baseObject.description = securityScheme.description;
  }

  if (securityScheme.type === 'apiKey') {
    return {
      ...baseObject,
      type: 'apiKey',
      name: securityScheme.name as string,
      in: securityScheme.in as IApiKeySecurityScheme['in'],
    };
  }

  if (securityScheme.type === 'http') {
    if (securityScheme.scheme === 'bearer') {
      return {
        ...baseObject,
        type: 'http',
        scheme: securityScheme.scheme,
        bearerFormat: securityScheme.bearerFormat,
      };
    }

    return {
      ...baseObject,
      type: 'http',
      scheme: securityScheme.scheme as 'basic' | 'digest',
    };
  }

  if (securityScheme.type === 'oauth2') {
    return {
      ...baseObject,
      type: 'oauth2',
      flows: transformFlows(securityScheme.flows),
    };
  }

  if (securityScheme.type === 'openIdConnect') {
    return {
      ...baseObject,
      type: 'openIdConnect',
      openIdConnectUrl: securityScheme.openIdConnectUrl as string,
    };
  }

  return undefined;
}

function transformFlows(flows: Optional<DeepPartial<OAuthFlowsObject>>): IOauthFlowObjects {
  const transformedFlows: IOauthFlowObjects = {};

  if (!isObject(flows)) {
    return transformedFlows;
  }

  if (flows.password) {
    Object.assign(transformedFlows, {
      password: pickBy({
        refreshUrl: flows.password.refreshUrl,
        scopes: flows.password.scopes,
        tokenUrl: flows.password.tokenUrl,
      }),
    });
  }

  if (flows.implicit) {
    Object.assign(transformedFlows, {
      implicit: pickBy({
        authorizationUrl: flows.implicit.authorizationUrl,
        refreshUrl: flows.implicit.refreshUrl,
        scopes: flows.implicit.scopes,
      }),
    });
  }

  if (flows.authorizationCode) {
    Object.assign(transformedFlows, {
      authorizationCode: pickBy({
        authorizationUrl: flows.authorizationCode.authorizationUrl,
        refreshUrl: flows.authorizationCode.refreshUrl,
        scopes: flows.authorizationCode.scopes,
        tokenUrl: flows.authorizationCode.tokenUrl,
      }),
    });
  }

  if (flows.clientCredentials) {
    Object.assign(transformedFlows, {
      clientCredentials: pickBy({
        tokenUrl: flows.clientCredentials.tokenUrl,
        refreshUrl: flows.clientCredentials.refreshUrl,
        scopes: flows.clientCredentials.scopes,
      }),
    });
  }

  return transformedFlows;
}

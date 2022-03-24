import { isPlainObject } from '@stoplight/json';
import type { IApiKeySecurityScheme, IOauthFlowObjects, Optional } from '@stoplight/types';
import type { SecuritySchemeObject } from 'openapi3-ts';

import { isNonNullable } from '../../guards';
import { ArrayCallbackParameters } from '../../types';
import { getSecurities, SecurityWithKey } from '../accessors';
import { isOAuthFlowObject } from '../guards';
import { Oas3TranslateFunction } from '../types';

export const translateToSecurities: Oas3TranslateFunction<[operationSecurities: unknown], SecurityWithKey[][]> =
  function (operationSecurities) {
    const securities = getSecurities(this.document, operationSecurities);

    return securities.map(security => security.map(translateToSingleSecurity, this).filter(isNonNullable));
  };

export const translateToSingleSecurity: Oas3TranslateFunction<
  [ArrayCallbackParameters<SecuritySchemeObject | (Omit<SecuritySchemeObject, 'type'> & { type: 'mutualTLS' })>[0]],
  Optional<SecurityWithKey>
> = function (securityScheme) {
  const { key } = securityScheme;

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
    if (securityScheme.scheme?.toLowerCase() === 'bearer') {
      return {
        ...baseObject,
        type: 'http',
        scheme: 'bearer',
        bearerFormat: securityScheme.bearerFormat,
      };
    }

    return {
      ...baseObject,
      type: 'http',
      scheme: securityScheme.scheme?.toLowerCase() as 'basic' | 'digest',
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

  if (securityScheme.type === 'mutualTLS') {
    return {
      ...baseObject,
      type: 'mutualTLS',
    };
  }

  return undefined;
};

function transformFlows(flows: Optional<unknown>): IOauthFlowObjects {
  const transformedFlows: IOauthFlowObjects = {};

  if (!isPlainObject(flows)) {
    return transformedFlows;
  }

  if (isOAuthFlowObject(flows.password) && typeof flows.password.tokenUrl === 'string') {
    transformedFlows.password = {
      ...(typeof flows.password.refreshUrl === 'string' && { refreshUrl: flows.password.refreshUrl }),
      tokenUrl: flows.password.tokenUrl,
      scopes: flows.password.scopes,
    };
  }

  if (isOAuthFlowObject(flows.implicit) && typeof flows.implicit.authorizationUrl === 'string') {
    transformedFlows.implicit = {
      ...(typeof flows.implicit.refreshUrl === 'string' && { refreshUrl: flows.implicit.refreshUrl }),
      authorizationUrl: flows.implicit.authorizationUrl,
      scopes: flows.implicit.scopes,
    };
  }

  if (
    isOAuthFlowObject(flows.authorizationCode) &&
    typeof flows.authorizationCode.authorizationUrl === 'string' &&
    typeof flows.authorizationCode.tokenUrl === 'string'
  ) {
    transformedFlows.authorizationCode = {
      ...(typeof flows.authorizationCode.refreshUrl === 'string' && { refreshUrl: flows.authorizationCode.refreshUrl }),
      authorizationUrl: flows.authorizationCode.authorizationUrl,
      scopes: flows.authorizationCode.scopes,
      tokenUrl: flows.authorizationCode.tokenUrl,
    };
  }

  if (isOAuthFlowObject(flows.clientCredentials) && typeof flows.clientCredentials.tokenUrl === 'string') {
    transformedFlows.clientCredentials = {
      ...(typeof flows.clientCredentials.refreshUrl === 'string' && { refreshUrl: flows.clientCredentials.refreshUrl }),
      scopes: flows.clientCredentials.scopes,
      tokenUrl: flows.clientCredentials.tokenUrl,
    };
  }

  return transformedFlows;
}

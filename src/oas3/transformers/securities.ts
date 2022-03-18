import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, IApiKeySecurityScheme, IOauthFlowObjects, Optional } from '@stoplight/types';
import type { OpenAPIObject, SecuritySchemeObject } from 'openapi3-ts';

import { withJsonPath } from '../../context';
import { ArrayCallbackParameters } from '../../types';
import { getSecurities, OperationSecurities, SecurityWithKey } from '../accessors';
import { isOAuthFlowObject } from '../guards';
import { Oas3TranslateFunction } from '../types';

export const translateToSecurities = withJsonPath<
  Oas3TranslateFunction<[operationSecurities: OperationSecurities], SecurityWithKey[][]>
>(function (operationSecurities: OperationSecurities) {
  const length = this.state.enter('security');

  const securities: SecurityWithKey[][] = [];

  for (const [path, security] of getSecurities(
    this.state.document as DeepPartial<OpenAPIObject>,
    operationSecurities,
  )) {
    this.state.exit(length);
    this.state.enter(...path);
    const transformed = translateToSingleSecurity.call(this, security);
    if (!transformed) {
      continue;
    }

    // todo: mah, this is awful :D
    const actualIndex = Number(path[0]);
    if (actualIndex >= securities.length) {
      securities.push([]);
    }

    securities[actualIndex].push(transformed);
  }

  return securities;
});

export const translateToSingleSecurity: Oas3TranslateFunction<
  [ArrayCallbackParameters<SecuritySchemeObject | (Omit<SecuritySchemeObject, 'type'> & { type: 'mutualTLS' })>[0]],
  Optional<SecurityWithKey>
> = function (securityScheme) {
  const { key } = securityScheme;

  const baseObject: { id: string; key: string; description?: string } = {
    id: this.generateId('security-scheme'),
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

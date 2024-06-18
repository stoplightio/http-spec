import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, Dictionary, HttpSecurityScheme, Optional } from '@stoplight/types';
import { pickBy } from 'lodash';
import type { OAuthFlowObject, OpenAPIObject, SecuritySchemeObject } from 'openapi3-ts';

import { isNonNullable } from '../guards';
import { getExtensions } from '../oas/accessors';
import { entries } from '../utils';
import { isSecurityScheme } from './guards';

export type OperationSecurities = Dictionary<string[], string>[] | undefined;

export function getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurities?: unknown,
): [key: string, security: Omit<HttpSecurityScheme, 'key' | 'id'>][][] {
  const definitions = document.components?.securitySchemes;

  if (!isPlainObject(definitions)) return [];

  return (Array.isArray(operationSecurities) ? operationSecurities : document.security || []).map(operationSecurity => {
    return entries(operationSecurity)
      .map<Optional<[key: string, security: Omit<HttpSecurityScheme, 'key' | 'id'>]>>(([opScheme, scopes]) => {
        const definition = definitions[opScheme];

        if (!isSecurityScheme(definition)) return;

        if (definition.type === 'oauth2') {
          // Put back only the flows that are part of the current definition
          return [
            opScheme,
            {
              ...definition,
              flows: Object.fromEntries(
                entries(definition.flows).map(([name, flow]) => [
                  name,
                  {
                    ...flow,
                    scopes: pickBy(flow?.scopes, (_val, key) => scopes?.includes(key)),
                  },
                ]),
              ),
              extensions: getExtensions(definition),
            },
          ];
        }

        const extensions = scopes?.length ? { ['x-scopes']: scopes } : {};

        return [
          opScheme,
          {
            ...definition,
            ...extensions,
            extensions: getExtensions({ ...definition, ...extensions }),
          },
        ];
      })
      .filter(isNonNullable);
  });
}

/** Collects scopes for each flow in a way that can be used to uniquely identify a security requirement. */
export function getScopeKeys(scheme: Omit<SecuritySchemeObject, 'type'>): string[] | undefined {
  if (!scheme.flows) {
    return undefined;
  }

  const scopes: string[] = [];

  function collectScopes(flowType: string, flow?: OAuthFlowObject) {
    for (const scope of Object.keys(flow?.scopes ?? {})) {
      scopes.push(`${flowType}::${scope}`);
    }
  }

  collectScopes('implicit', scheme.flows.implicit);
  collectScopes('password', scheme.flows.password);
  collectScopes('clientCredentials', scheme.flows.clientCredentials);
  collectScopes('authorizationCode', scheme.flows.authorizationCode);

  return scopes;
}

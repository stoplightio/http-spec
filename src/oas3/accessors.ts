import type { DeepPartial, Dictionary, HttpSecurityScheme } from '@stoplight/types';
import { isObject, mapValues, pickBy } from 'lodash';
import { OAuthFlowObject, OpenAPIObject } from 'openapi3-ts';

import { isSecurityScheme, isSecuritySchemeWithKey } from './guards';

export type OperationSecurities = Dictionary<string[], string>[] | undefined;
export type SecurityWithKey = HttpSecurityScheme & { key: string };

export function getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurities?: OperationSecurities,
): SecurityWithKey[][] {
  const definitions = document.components?.securitySchemes;

  if (!isObject(definitions)) return [];

  return (operationSecurities || document.security || []).map(operationSecurity => {
    return Object.entries(operationSecurity)
      .map(([opScheme, scopes]) => {
        const definition = definitions[opScheme];

        if (isSecurityScheme(definition) && definition.type === 'oauth2') {
          // Put back only the flows that are part of the current definition
          return {
            ...definition,
            flows: mapValues(definition.flows, (flow: OAuthFlowObject) => ({
              ...flow,
              scopes: pickBy(flow.scopes, (_val: string, key: string) => scopes?.includes(key)),
            })),
            key: opScheme,
          };
        }

        return { ...definition, key: opScheme };
      })
      .filter(isSecuritySchemeWithKey);
  });
}

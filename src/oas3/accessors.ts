import type { DeepPartial, Dictionary, HttpSecurityScheme } from '@stoplight/types';
import { isObject, mapValues, pickBy } from 'lodash';
import { OAuthFlowObject, OpenAPIObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';
import { isSecurityScheme, isSecuritySchemeWithKey } from './guards';

export type OperationSecurities = Dictionary<string[], string>[] | undefined;
export type SecurityWithKey = HttpSecurityScheme & { key: string };

export function getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurity?: OperationSecurities,
): SecurityWithKey[][] {
  const opSchemesPairs = operationSecurity
    ? mapToKeys(operationSecurity)
    : document.security
    ? mapToKeys(document.security)
    : [];
  const flattenPairs: Dictionary<string[]> = operationSecurity
    ? Object.assign({}, ...operationSecurity)
    : document.security
    ? Object.assign({}, ...document.security)
    : {};
  const definitions = document.components?.securitySchemes;

  if (!isObject(definitions)) return [];

  return opSchemesPairs.map(opSchemePair =>
    opSchemePair
      .map(opScheme => {
        const definition = definitions[opScheme];

        if (isSecurityScheme(definition) && definition.type === 'oauth2') {
          // Put back only the flows that are part of the current definition
          return {
            ...definition,
            flows: mapValues(definition.flows, (flow: OAuthFlowObject) => ({
              ...flow,
              scopes: pickBy(flow.scopes, (_val: string, key: string) => flattenPairs[opScheme].includes(key)),
            })),
            key: opScheme,
          };
        }

        return { ...definition, key: opScheme };
      })
      .filter(isSecuritySchemeWithKey),
  );
}

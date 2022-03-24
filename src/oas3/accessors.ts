import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, Dictionary, HttpSecurityScheme } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type { OpenAPIObject } from 'openapi3-ts';

import { entries } from '../utils';
import { isSecurityScheme, isSecuritySchemeWithKey } from './guards';

export type OperationSecurities = Dictionary<string[], string>[] | undefined;
export type SecurityWithKey = HttpSecurityScheme & { key: string };

export function getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurities?: unknown,
): SecurityWithKey[][] {
  const definitions = document.components?.securitySchemes;

  if (!isPlainObject(definitions)) return [];

  return (Array.isArray(operationSecurities) ? operationSecurities : document.security || []).map(operationSecurity => {
    return entries(operationSecurity)
      .map(([opScheme, scopes]) => {
        const definition = definitions[opScheme];

        if (isSecurityScheme(definition) && definition.type === 'oauth2') {
          // Put back only the flows that are part of the current definition
          return {
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
            key: opScheme,
          };
        }

        return { ...definition, key: opScheme };
      })
      .filter(isSecuritySchemeWithKey);
  });
}

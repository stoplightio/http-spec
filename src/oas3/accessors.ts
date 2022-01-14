import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, Dictionary, HttpSecurityScheme, Optional } from '@stoplight/types';
import pickBy from 'lodash.pickby';
import type { OpenAPIObject } from 'openapi3-ts';

import { isNonNullable } from '../guards';
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
            },
          ];
        }

        return [opScheme, definition];
      })
      .filter(isNonNullable);
  });
}

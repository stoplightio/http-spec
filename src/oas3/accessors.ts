import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, Dictionary, HttpSecurityScheme, JsonPath } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import { OpenAPIObject } from 'openapi3-ts';

import { entries } from '../utils';
import { isSecurityScheme } from './guards';

export type OperationSecurities = Dictionary<string[], string>[] | undefined;
export type SecurityWithKey = HttpSecurityScheme & { key: string };

export function* getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurities: unknown,
): IterableIterator<[JsonPath, SecurityWithKey]> {
  const definitions = document.components?.securitySchemes;

  if (!isPlainObject(definitions) || !Array.isArray(operationSecurities)) return;

  for (const [i, operationSecurity] of operationSecurities.entries()) {
    for (const [opScheme, scopes] of entries(operationSecurity)) {
      const definition = definitions[opScheme];
      if (!isSecurityScheme(definition)) continue;
      const path = [String(i), opScheme];

      if (definition.type === 'oauth2') {
        // Put back only the flows that are part of the current definition
        yield [
          path,
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
            key: opScheme,
          } as any,
        ];
      } else {
        yield [path, { ...definition, key: opScheme } as any];
      }
    }
  }
}

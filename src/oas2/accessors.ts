import { isPlainObject } from '@stoplight/json';
import type { DeepPartial } from '@stoplight/types';
import type { Operation, Security, Spec } from 'swagger-schema-official';
import pickBy = require('lodash.pickby');

import { isEmpty } from 'lodash';

import { isNonNullable, isString } from '../guards';
import { isSecurityScheme } from './guards';

export type SecurityWithKey = Security & { key: string };

export function getSecurities(spec: DeepPartial<Spec>, operationSecurity: unknown): SecurityWithKey[][] {
  if (!isNonNullable(spec.securityDefinitions) || isEmpty(spec.securityDefinitions)) return [];

  const security = !!operationSecurity ? operationSecurity : spec.security;
  const securities = getSecurity(security, spec.securityDefinitions);

  if (isOptionalSecurity(security)) {
    securities.push([]);
  }

  return securities;
}

export function getProduces(spec: DeepPartial<Spec>, operation: DeepPartial<Operation>) {
  return getProducesOrConsumes('produces', spec, operation);
}

export function getConsumes(spec: DeepPartial<Spec>, operation: DeepPartial<Operation>) {
  return getProducesOrConsumes('consumes', spec, operation);
}

function getSecurity(security: unknown, definitions: DeepPartial<Spec['securityDefinitions']>): SecurityWithKey[][] {
  if (!Array.isArray(security) || !definitions) {
    return [];
  }

  return security
    .map(sec => {
      if (!isPlainObject(sec)) return [];
      return Object.keys(sec)
        .map(key => {
          const def = definitions[key];

          if (isSecurityScheme(def)) {
            const defCopy = { ...def, key };
            const secKey = sec[key];
            const scopes = Array.isArray(secKey) ? secKey : [];

            // Filter definition scopes by operation scopes
            if (defCopy.type === 'oauth2' && scopes.length) {
              defCopy.scopes = pickBy(defCopy.scopes, (_val, s: string) => scopes.includes(s));
            }

            return defCopy;
          }

          return null;
        })
        .filter(isNonNullable);
    })
    .filter(scheme => !isEmpty(scheme));
}

export function normalizeProducesOrConsumes(input: unknown): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input.flat().filter(isString);
}

function getProducesOrConsumes(
  which: 'produces' | 'consumes',
  spec: DeepPartial<Spec>,
  operation: DeepPartial<Operation>,
): string[] {
  return normalizeProducesOrConsumes(operation?.[which] || spec?.[which]);
}

export function getExamplesFromSchema(data: unknown): Record<string, unknown> {
  if (!isPlainObject(data)) return {};

  return {
    ...(isPlainObject(data['x-examples']) && { ...data['x-examples'] }),
    ...('example' in data && { default: data.example }),
  };
}

function isOptionalSecurity(security: unknown): boolean {
  return Array.isArray(security) && security.length > 1 && security.some(scheme => isEmpty(scheme));
}

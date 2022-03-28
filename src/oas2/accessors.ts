import { isPlainObject } from '@stoplight/json';
import { DeepPartial, Dictionary } from '@stoplight/types';
import { Operation, Schema, Security, Spec } from 'swagger-schema-official';
import pickBy = require('lodash.pickby');

import { isNonNullable, isString } from '../guards';
import { isSecurityScheme } from './guards';

export type SecurityWithKey = Security & { key: string };

export function getSecurities(spec: DeepPartial<Spec>, operationSecurity: unknown): SecurityWithKey[][] {
  const globalSecurities = getSecurity(spec.security, spec.securityDefinitions || {});
  const operationSecurities = getSecurity(operationSecurity, spec.securityDefinitions || {});

  const securities = !!operationSecurity ? operationSecurities : globalSecurities;

  return securities.filter(a => a.length);
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

  return security.map(sec => {
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
  });
}

function getProducesOrConsumes(
  which: 'produces' | 'consumes',
  spec: DeepPartial<Spec>,
  operation: DeepPartial<Operation>,
): string[] {
  const mimeTypes = operation?.[which] || spec?.[which] || [];
  if (!Array.isArray(mimeTypes)) {
    return [];
  }

  return mimeTypes.flat().filter(isString);
}

export function getExamplesFromSchema(data: Schema & { 'x-examples'?: Dictionary<unknown> }): Record<string, unknown> {
  if (!isPlainObject(data)) return {};

  return {
    ...('x-examples' in data && isPlainObject(data['x-examples']) && { ...data['x-examples'] }),
    ...('example' in data && { default: data.example }),
  };
}

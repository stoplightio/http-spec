import { DeepPartial, Dictionary } from '@stoplight/types';
import { compact, get, isEmpty, isString, keys, map, merge } from 'lodash';
import { negate } from 'lodash/fp';
import { Operation, Security, Spec } from 'swagger-schema-official';
import { isSecurityScheme } from './guards';

export type SecurityWithKey = Security & { key: string };

export function getSecurities(
  spec: DeepPartial<Spec>,
  operationSecurity: Array<Dictionary<string[], string>> | undefined,
): SecurityWithKey[][] {
  const globalSecurities = getSecurity(spec.security, spec.securityDefinitions || {});
  const operationSecurities = getSecurity(operationSecurity, spec.securityDefinitions || {});

  const securities = !!operationSecurity ? operationSecurities : globalSecurities;

  return securities.filter(negate(isEmpty));
}

export function getProduces(spec: DeepPartial<Spec>, operation: DeepPartial<Operation>) {
  return getProducesOrConsumes('produces', spec, operation);
}

export function getConsumes(spec: DeepPartial<Spec>, operation: DeepPartial<Operation>) {
  return getProducesOrConsumes('consumes', spec, operation);
}

function getSecurity(
  security: DeepPartial<Spec['security']>,
  definitions: DeepPartial<Spec['securityDefinitions']>,
): SecurityWithKey[][] {
  if (!security || !definitions) {
    return [];
  }

  return map(security, sec => {
    return compact(
      keys(sec).map((key: string) => {
        const def = definitions[key];
        if (isSecurityScheme(def)) {
          return merge<{ key: string }, Security>({ key }, def);
        }
        return null;
      }),
    );
  });
}

function getProducesOrConsumes(
  which: 'produces' | 'consumes',
  spec: DeepPartial<Spec>,
  operation: DeepPartial<Operation>,
): string[] {
  const mimeTypes = get(operation, which, get(spec, which, []));
  if (!Array.isArray(mimeTypes)) {
    return [];
  }

  return compact(mimeTypes).filter(v => v && isString(v));
}

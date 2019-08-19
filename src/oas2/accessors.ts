import { Dictionary } from '@stoplight/types';
import { compact, get, isEmpty, map, merge } from 'lodash';
import { negate } from 'lodash/fp';
import { Operation, Security, Spec } from 'swagger-schema-official';

export function getSecurities(
  spec: Partial<Spec>,
  operationSecurity: Array<Dictionary<string[], string>> | undefined,
): Security[][] {
  const globalSecurities = getSecurity(spec.security, spec.securityDefinitions || {});
  const operationSecurities = getSecurity(operationSecurity, spec.securityDefinitions || {});

  const securities = !!operationSecurity ? operationSecurities : globalSecurities;

  return securities.filter(negate(isEmpty));
}

export function getProduces(spec: Partial<Spec>, operation: Partial<Operation>) {
  return getProducesOrConsumes('produces', spec, operation);
}

export function getConsumes(spec: Partial<Spec>, operation: Partial<Operation>) {
  return getProducesOrConsumes('consumes', spec, operation);
}

function getSecurity(
  security: Array<Dictionary<string[], string>> | undefined,
  definitions: Dictionary<Security, string>,
): Security[][] {
  return map(security, sec => {
    return compact(
      map(Object.keys(sec), (key: string) => {
        const def = definitions[key];
        if (def) {
          const defCopy = merge<Object, Security>({}, def);
          return defCopy;
        }
        return null;
      }),
    );
  });
}

function getProducesOrConsumes(which: 'produces' | 'consumes', spec: Partial<Spec>, operation: Partial<Operation>) {
  const mimeTypes = get(operation, which, get(spec, which, [])) as string[];
  return mimeTypes.length ? mimeTypes : ['*/*'];
}

import type { DeepPartial, Dictionary, HttpSecurityScheme } from '@stoplight/types';
import { isObject } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';
import { isSecuritySchemeWithKey } from './guards';

export type OperationSecurities = Dictionary<string[], string>[] | undefined;
export type SecurityWithKey = HttpSecurityScheme & { key: string };

export function getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurity?: OperationSecurities,
): SecurityWithKey[][] {
  const opSchemesPairs = operationSecurity ? mapToKeys(operationSecurity) : mapToKeys(document.security);
  const definitions = document.components?.securitySchemes;

  if (!isObject(definitions)) return [];

  return opSchemesPairs.map(opSchemePair =>
    opSchemePair
      .map(opScheme => {
        return { ...definitions[opScheme], key: opScheme };
      })
      .filter(isSecuritySchemeWithKey),
  );
}

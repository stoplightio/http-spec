import { DeepPartial, Dictionary, HttpSecurityScheme } from '@stoplight/types';
import { isObject } from 'lodash';
import { OpenAPIObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';
import { isSecuritySchemeWithKey } from './guards';

export type OperationSecurities = Array<Dictionary<string[], string>> | undefined;
export type SecurityWithKey = HttpSecurityScheme & { key: string };

export function getSecurities(
  document: DeepPartial<OpenAPIObject>,
  operationSecurity?: OperationSecurities,
): SecurityWithKey[][] {
  const opSchemesPairs = operationSecurity ? mapToKeys(operationSecurity) : mapToKeys(document.security);
  const definitions = document.components?.securitySchemes;

  return !isObject(definitions)
    ? []
    : opSchemesPairs.map(opSchemePair =>
        opSchemePair
          .map(opScheme => {
            return { ...definitions[opScheme], key: opScheme };
          })
          .filter(isSecuritySchemeWithKey),
      );
}

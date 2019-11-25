import { DeepPartial } from '@stoplight/types';
import { isObject } from 'lodash';
import { OpenAPIObject, OperationObject, SecuritySchemeObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';
import { isSecurityScheme } from './guards';

export function getSecurities(
  spec: DeepPartial<OpenAPIObject>,
  operation: DeepPartial<OperationObject>,
): SecuritySchemeObject[][] {
  const opSchemesPairs = operation.security ? mapToKeys(operation.security) : mapToKeys(spec.security);
  const definitions = spec.components?.securitySchemes;

  return !isObject(definitions)
    ? []
    : opSchemesPairs.map(opSchemePair => opSchemePair.map(opScheme => definitions[opScheme]).filter(isSecurityScheme));
}

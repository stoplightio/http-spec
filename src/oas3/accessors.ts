import { get, isObject } from 'lodash';
import { OpenAPIObject, OperationObject, SecuritySchemeObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';

export function getSecurities(
  spec: Partial<OpenAPIObject>,
  operation: Partial<OperationObject>,
): SecuritySchemeObject[][] {
  const opSchemesPairs = operation.security ? mapToKeys(operation.security) : mapToKeys(spec.security);
  const definitions = get(spec, 'components.securitySchemes');

  return !isObject(definitions)
    ? []
    : opSchemesPairs.map(opSchemePair => opSchemePair.map(opScheme => definitions[opScheme]).filter(Boolean));
}

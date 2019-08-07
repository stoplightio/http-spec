import { get } from 'lodash';
import { OpenAPIObject, OperationObject } from 'openapi3-ts';

import { uniqFlatMap } from '../utils';

export function getSecurities(spec: Partial<OpenAPIObject>, operation: Partial<OperationObject>): any {
  const globalSchemes = uniqFlatMap(spec.security);
  const operationSchemes = uniqFlatMap(operation.security);

  const opSchemesPairs = operation.security ? operationSchemes : globalSchemes;
  const definitions = get(spec, 'components.securitySchemes');

  return opSchemesPairs.map((opSchemePair: string[]) => {
    return opSchemePair.map((opScheme: string) => {
      return definitions[opScheme];
    });
  });
}

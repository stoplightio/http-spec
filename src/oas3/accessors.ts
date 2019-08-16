import { get } from 'lodash';
import { OpenAPIObject, OperationObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';

export function getSecurities(spec: Partial<OpenAPIObject>, operation: Partial<OperationObject>): any {
  const globalSchemes = mapToKeys(spec.security);
  const operationSchemes = mapToKeys(operation.security);

  const opSchemesPairs = operation.security ? operationSchemes : globalSchemes;
  const definitions = get(spec, 'components.securitySchemes');

  return !definitions
    ? []
    : opSchemesPairs.map((opSchemePair: string[]) => {
        return opSchemePair.map((opScheme: string) => {
          return definitions[opScheme];
        });
      });
}

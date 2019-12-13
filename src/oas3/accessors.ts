import { DeepPartial } from '@stoplight/types';
import { isObject } from 'lodash';
import { OpenAPIObject, OperationObject } from 'openapi3-ts';

import { mapToKeys } from '../utils';
import { isSecurityScheme } from './guards';

export function getSecurities(spec: DeepPartial<OpenAPIObject>, operation: DeepPartial<OperationObject>) {
  const opSchemesPairs = operation.security ? mapToKeys(operation.security) : mapToKeys(spec.security);
  const definitions = spec.components?.securitySchemes;

  return !isObject(definitions)
    ? []
    : opSchemesPairs.map(opSchemePair =>
        opSchemePair
          .map(opScheme => {
            return { ...definitions[opScheme], key: opScheme };
          })
          .filter(isSecurityScheme),
      );
}

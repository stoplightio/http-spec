import type { JSONSchema7 } from 'json-schema';
import { isObject } from 'lodash';

import keywords from './keywords';
import { OASSchemaObject } from './types';

const keywordsKeys = Object.keys(keywords);

type InternalOptions = {
  notSupported: string[];
  structs: string[];
};

// Convert from OpenAPI 2.0 & OpenAPI 3.0 `SchemaObject` to JSON Schema Draft 7
export function translateSchemaObject(schema: OASSchemaObject, options?: { pruneNotSupported: string[] }): JSONSchema7 {
  const clonedSchema = convertSchema(schema, {
    notSupported: options?.pruneNotSupported ?? [],
    structs: ['allOf', 'anyOf', 'oneOf', 'not', 'items', 'additionalProperties'],
  });

  clonedSchema.$schema = 'http://json-schema.org/draft-07/schema#';
  return clonedSchema as JSONSchema7;
}

function convertSchema(schema: OASSchemaObject, options: InternalOptions): JSONSchema7 {
  const clonedSchema: OASSchemaObject | JSONSchema7 = { ...schema };

  for (const struct of options.structs) {
    if (Array.isArray(clonedSchema[struct])) {
      clonedSchema[struct] = clonedSchema[struct].slice();

      for (let i = 0; i < clonedSchema[struct].length; i++) {
        if (isObject(clonedSchema[struct][i])) {
          clonedSchema[struct][i] = convertSchema(clonedSchema[struct][i], options);
        } else {
          clonedSchema[struct].splice(i, 1);
          i--;
        }
      }
    } else if (clonedSchema[struct] !== null && typeof clonedSchema[struct] === 'object') {
      clonedSchema[struct] = convertSchema(clonedSchema[struct], options);
    }
  }

  if ('properties' in clonedSchema && isObject(clonedSchema.properties)) {
    convertProperties(clonedSchema, options);
  }

  for (const keyword of keywordsKeys) {
    if (keyword in schema) {
      keywords[keyword](clonedSchema);
    }
  }

  for (const notSupportedProp of options.notSupported) {
    delete clonedSchema[notSupportedProp];
  }

  return clonedSchema as JSONSchema7;
}

function convertProperties(schema: OASSchemaObject, options: InternalOptions): void {
  const props = { ...schema.properties };
  schema.properties = props;

  for (const key of Object.keys(props)) {
    const property = props[key];

    if (isObject(property)) {
      props[key] = convertSchema(property, options);
    }
  }
}

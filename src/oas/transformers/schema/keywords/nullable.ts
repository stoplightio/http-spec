import type { JSONSchema7TypeName } from 'json-schema';

import { Converter } from '../types';

const jsonSchema7TypeNames: ReadonlyArray<JSONSchema7TypeName> = [
  'string',
  'number',
  'integer',
  'boolean',
  'object',
  'array',
  'null',
];

function isJsonSchema6TypeName(maybeJsonSchema7TypeName: string): maybeJsonSchema7TypeName is JSONSchema7TypeName {
  return (jsonSchema7TypeNames as string[]).includes(maybeJsonSchema7TypeName);
}

const createNullableConverter = (keyword: 'x-nullable' | 'nullable'): Converter => {
  return (schema, document) => {
    if (typeof schema.type !== 'string' || !isJsonSchema6TypeName(schema.type) || !(keyword in schema)) {
      return;
    }

    let isOas3_0 = false;

    if ('openapi' in document) {
      if (typeof document.openapi === 'string') {
        isOas3_0 = document.openapi.startsWith('3.0');
      }
    }

    if (schema[keyword] === true) {
      schema.type = [schema.type, 'null'];

      if (Array.isArray(schema.enum)) {
        schema.enum = [...schema.enum, null];
      }
    }

    if (!isOas3_0 && keyword === 'nullable') {
      delete schema[keyword];
    }
  };
};

export default {
  'x-nullable': createNullableConverter('x-nullable'),
  nullable: createNullableConverter('nullable'),
};

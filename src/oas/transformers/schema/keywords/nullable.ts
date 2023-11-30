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
  return schema => {
    if (typeof schema.type !== 'string' || !isJsonSchema6TypeName(schema.type) || !(keyword in schema)) {
      return;
    }

    if (schema[keyword] === true) {
      schema.type = [schema.type, 'null'];

      if (Array.isArray(schema.enum)) {
        schema.enum = [...schema.enum, null];
      }
    }

    delete schema[keyword];
  };
};

export default {
  'x-nullable': createNullableConverter('x-nullable'),
  nullable: createNullableConverter('nullable'),
};

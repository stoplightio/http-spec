import type { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { isObject } from 'lodash';
import type { SchemaObject } from 'openapi3-ts/src/model/OpenApi';

// based on https://github.com/openapi-contrib/openapi-schema-to-json-schema
// and specifically on https://github.com/openapi-contrib/openapi-schema-to-json-schema/blob/master/lib/converters/schema.js
// the above converter is the only one we actually used, while https://github.com/openapi-contrib/openapi-schema-to-json-schema/blob/master/lib/converters/parameter.js was never utilized
/**
 * Differences
 * * Removed options:
 * * * strictMode (this was actually introduced for Stoplight, it's enabled by default now)
 * * * dateToDateTime (was unused)
 * * * cloneSchema (true by default now, we never want to alter schema)
 * * * supportPatternProperties & patternPropertiesHandler (were unused)
 * * * removeReadOnly & removeWriteOnly (were unused)
 * * * removeProps (was unused)
 *
 * * Changed behavior:
 * * * keepNotSupported (whitelist) -> pruneNotSupported (blacklist)
 * * * empty properties are not removed
 */

const settings = {
  MIN_INT_32: 0 - Math.pow(2, 31),
  MAX_INT_32: Math.pow(2, 31) - 1,
  MIN_INT_64: 0 - Math.pow(2, 63),
  MAX_INT_64: Math.pow(2, 63) - 1,
  MIN_FLOAT: 0 - Math.pow(2, 128),
  MAX_FLOAT: Math.pow(2, 128) - 1,
  MIN_DOUBLE: 0 - Number.MAX_VALUE,
  MAX_DOUBLE: Number.MAX_VALUE,

  // Matches base64 (RFC 4648)
  // Matches `standard` base64 not `base64url`. The specification does not
  // exclude it but current ongoing OpenAPI plans will distinguish btoh.
  BYTE_PATTERN: '^[\\w\\d+\\/=]*$',
};

const formatConverters = {
  int32: convertFormatInt32,
  int64: convertFormatInt64,
  float: convertFormatFloat,
  double: convertFormatDouble,
  byte: convertFormatByte,
};

const JSONSchema4TypeNames = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null', 'any'];

function isJsonSchema4TypeName(maybeJSONSchema4TypeName: string): maybeJSONSchema4TypeName is JSONSchema4TypeName {
  return JSONSchema4TypeNames.includes(maybeJSONSchema4TypeName);
}

// Convert from OpenAPI 3.0 `SchemaObject` to JSON schema v4
export function convertFromSchema(schema: SchemaObject, options: { pruneNotSupported: string[] }): JSONSchema4 {
  const clonedSchema = convertSchema(schema, {
    _notSupported: options.pruneNotSupported,
    _structs: ['allOf', 'anyOf', 'oneOf', 'not', 'items', 'additionalProperties'],
  });

  clonedSchema.$schema = 'http://json-schema.org/draft-04/schema#';
  return clonedSchema as JSONSchema4;
}

function convertSchema(schema: SchemaObject, options: any) {
  const clonedSchema = { ...schema };

  for (const struct of options._structs) {
    if (Array.isArray(clonedSchema[struct])) {
      clonedSchema[struct] = clonedSchema[struct].slice();

      for (let i = 0; i < clonedSchema[struct].length; i++) {
        if (isObject(clonedSchema[struct][i])) {
          [struct][i] = convertSchema(clonedSchema[struct][i], options);
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

  convertTypes(clonedSchema);
  convertFormat(clonedSchema);

  for (const notSupportedProp of options._notSupported) {
    delete clonedSchema[notSupportedProp];
  }

  return clonedSchema;
}

function convertProperties(schema: SchemaObject, options: any): void {
  const props = { ...schema.properties };
  schema.properties = props;

  for (const key of Object.keys(props)) {
    const property = props[key];

    if (isObject(property)) {
      props[key] = convertSchema(property, options);
    }
  }
}

function convertTypes(schema: SchemaObject): void {
  if (typeof schema.type === 'string' && isJsonSchema4TypeName(schema.type) && schema.nullable === true) {
    (schema as JSONSchema4).type = [schema.type, 'null'];

    if (Array.isArray(schema.enum)) {
      schema.enum = [...schema.enum, null];
    }
  }
}

function convertFormat(schema: SchemaObject): void {
  if (schema.format !== undefined) {
    formatConverters[schema.format]?.(schema);
  }
}

function convertFormatInt32(schema: SchemaObject): void {
  if ((!schema.minimum && schema.minimum !== 0) || schema.minimum < settings.MIN_INT_32) {
    schema.minimum = settings.MIN_INT_32;
  }

  if ((!schema.maximum && schema.maximum !== 0) || schema.maximum > settings.MAX_INT_32) {
    schema.maximum = settings.MAX_INT_32;
  }
}

function convertFormatInt64(schema: SchemaObject): void {
  if ((!schema.minimum && schema.minimum !== 0) || schema.minimum < settings.MIN_INT_64) {
    schema.minimum = settings.MIN_INT_64;
  }

  if ((!schema.maximum && schema.maximum !== 0) || schema.maximum > settings.MAX_INT_64) {
    schema.maximum = settings.MAX_INT_64;
  }
}

function convertFormatFloat(schema: SchemaObject): void {
  if ((!schema.minimum && schema.minimum !== 0) || schema.minimum < settings.MIN_FLOAT) {
    schema.minimum = settings.MIN_FLOAT;
  }

  if ((!schema.maximum && schema.maximum !== 0) || schema.maximum > settings.MAX_FLOAT) {
    schema.maximum = settings.MAX_FLOAT;
  }
}

function convertFormatDouble(schema: SchemaObject): void {
  if ((!schema.minimum && schema.minimum !== 0) || schema.minimum < settings.MIN_DOUBLE) {
    schema.minimum = settings.MIN_DOUBLE;
  }

  if ((!schema.maximum && schema.maximum !== 0) || schema.maximum > settings.MAX_DOUBLE) {
    schema.maximum = settings.MAX_DOUBLE;
  }
}

function convertFormatByte(schema: SchemaObject): void {
  schema.pattern = settings.BYTE_PATTERN;
}

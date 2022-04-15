import { isPlainObject } from '@stoplight/json';
import type { DeepPartial } from '@stoplight/types';
import type { JSONSchema4, JSONSchema6, JSONSchema7 } from 'json-schema';
import type { OpenAPIObject } from 'openapi3-ts';
import type { Spec } from 'swagger-schema-official';

import { withContext } from '../../../context';
import type { Fragment, TranslateFunction } from '../../../types';
import { getSharedKey } from '../../resolver';
import keywords from './keywords';
import type { OASSchemaObject } from './types';

const keywordsKeys = Object.keys(keywords);

type InternalOptions = {
  structs: string[];
};

const CACHE = new WeakMap();

// Convert from OpenAPI 2.0, OpenAPI 3.0 `SchemaObject` or JSON Schema Draft4/6 to JSON Schema Draft 7
// This converter shouldn't make any differences to Schema objects defined in OpenAPI 3.1, excepts when jsonSchemaDialect is provided.
export const translateSchemaObject = withContext<
  TranslateFunction<
    DeepPartial<Spec | OpenAPIObject | JSONSchema4 | JSONSchema6 | JSONSchema7>,
    [schema: OASSchemaObject],
    JSONSchema7
  >
>(function (schema) {
  const resolvedSchema = this.maybeResolveLocalRef(schema);
  if (!isPlainObject(resolvedSchema)) return {};
  let cached = CACHE.get(resolvedSchema);
  if (cached) {
    return { ...cached };
  }

  const actualKey = this.context === 'service' ? getSharedKey(resolvedSchema) : '';
  const id = this.generateId(`schema-${this.parentId}-${actualKey}`);

  cached = convertSchema(this.document, resolvedSchema);
  cached['x-stoplight'] = {
    ...(isPlainObject(cached['x-stoplight']) && cached['x-stoplight']),
    id,
  };

  CACHE.set(resolvedSchema, cached);
  return cached;
});

export function convertSchema(document: Fragment, schema: OASSchemaObject | JSONSchema7): JSONSchema7 {
  if ('jsonSchemaDialect' in document && typeof document.jsonSchemaDialect === 'string') {
    return {
      $schema: document.jsonSchemaDialect,
      // let's assume it's draft 7, albeit it might be draft 2020-12 or 2019-09.
      // it's a safe bet, because there was only _one_ relatively minor breaking change introduced between Draft 7 and 2020-12.
      ...(schema as JSONSchema7),
    };
  }

  const clonedSchema = _convertSchema(schema, {
    structs: ['allOf', 'anyOf', 'oneOf', 'not', 'items', 'additionalProperties', 'additionalItems'],
  });

  clonedSchema.$schema = 'http://json-schema.org/draft-07/schema#';
  return clonedSchema;
}

function _convertSchema(schema: OASSchemaObject | JSONSchema7, options: InternalOptions): JSONSchema7 {
  const clonedSchema = { ...schema };

  for (const struct of options.structs) {
    if (Array.isArray(clonedSchema[struct])) {
      clonedSchema[struct] = clonedSchema[struct].slice();

      for (let i = 0; i < clonedSchema[struct].length; i++) {
        if (typeof clonedSchema[struct][i] === 'object' && clonedSchema[struct][i] !== null) {
          clonedSchema[struct][i] = _convertSchema(clonedSchema[struct][i], options);
        } else {
          clonedSchema[struct].splice(i, 1);
          i--;
        }
      }
    } else if (clonedSchema[struct] !== null && typeof clonedSchema[struct] === 'object') {
      clonedSchema[struct] = _convertSchema(clonedSchema[struct], options);
    }
  }

  if ('properties' in clonedSchema && isPlainObject(clonedSchema.properties)) {
    convertProperties(clonedSchema, options);
  }

  for (const keyword of keywordsKeys) {
    if (keyword in schema) {
      keywords[keyword](clonedSchema);
    }
  }

  return clonedSchema as JSONSchema7;
}

function convertProperties(schema: OASSchemaObject | JSONSchema7, options: InternalOptions): void {
  const props = { ...schema.properties };
  schema.properties = props;

  for (const key of Object.keys(props)) {
    const property = props[key];

    if (isPlainObject(property)) {
      props[key] = _convertSchema(property, options);
    }
  }
}

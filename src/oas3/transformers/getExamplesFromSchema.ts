import { Dictionary } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isObject } from 'lodash';
import { Schema } from 'swagger-schema-official';

export function getExamplesFromSchema(
  data: (Schema | JSONSchema4) & { 'x-examples'?: Dictionary<unknown> },
): Dictionary<{ value: unknown }> {
  if (!isObject(data)) return {};

  return {
    ...('example' in data && { default: { value: data.example } }),
    ...('x-examples' in data &&
      isObject(data['x-examples']) &&
      Object.fromEntries(Object.entries(data['x-examples']).map(([key, val]) => [key, { value: val }]))),
  };
}

import { Dictionary } from '@stoplight/types';
import { JSONSchema4 } from 'json-schema';
import { isObject } from 'lodash';
import { Schema } from 'swagger-schema-official';

export function getExamplesFromSchema(
  data: (Schema | JSONSchema4) & { 'x-examples'?: Dictionary<unknown> },
): Dictionary<unknown> {
  if (!isObject(data)) return {};

  return {
    ...('example' in data && { default: data.example }),
    ...('examples' in data && { default: data.examples }),
    ...('x-examples' in data && isObject(data['x-examples']) && { ...data['x-examples'] }),
  };
}

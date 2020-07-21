import { Dictionary } from '@stoplight/types';
import { isObject } from 'lodash';
import { Schema } from 'swagger-schema-official';

export function getExamplesFromSchema(data: Schema & { 'x-examples'?: Dictionary<unknown> }): Dictionary<unknown> {
  if (!isObject(data)) return {};

  return {
    ...('x-examples' in data && isObject(data['x-examples']) && { ...data['x-examples'] }),
    ...('example' in data && { default: data.example }),
  };
}

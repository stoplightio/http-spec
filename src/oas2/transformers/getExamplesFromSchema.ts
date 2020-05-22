import { isObject } from 'lodash';
import { Schema } from 'swagger-schema-official';
import { Dictionary } from '@stoplight/types';

export function getExamplesFromSchema(data: Schema & { 'x-examples'?: Dictionary<unknown> }): Dictionary<unknown> {
  return {
    ...('x-examples' in data && isObject(data['x-examples']) && { ...data['x-examples'] }),
    ...('example' in data && { default: data.example }),
  };
}

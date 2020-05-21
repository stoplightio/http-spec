import { isObject } from 'lodash';
import { Schema } from 'swagger-schema-official';

export function getExamplesFromSchema(data: Schema) {
  return 'x-examples' in data
    ? isObject(data['x-examples'])
      ? data['x-examples']
      : void 0
    : 'example' in data
    ? { default: data.example }
    : void 0;
}

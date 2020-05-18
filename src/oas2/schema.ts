import { isObject } from 'lodash';
import { Schema } from 'swagger-schema-official';

export function getExamplesFromSchema(data?: Schema) {
  let examples;

  if (isObject(data)) {
    if ('x-examples' in data) {
      examples = data['x-examples'];
    } else if ('example' in data) {
      examples = {
        default: data.example,
      };
    } else if ('x-example' in data) {
      examples = {
        default: data['x-example'],
      };
    }
  }

  return examples;
}

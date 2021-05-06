import type { JSONSchema7 } from 'json-schema';

import { Converter } from '../types';

const createExampleConverter = (keyword: 'x-example' | 'example'): Converter => {
  return schema => {
    if (!(keyword in schema)) return;
    (schema as JSONSchema7).examples = [schema[keyword]];
    delete schema[keyword];
  };
};

export default {
  'x-example': createExampleConverter('x-example'),
  example: createExampleConverter('example'),
};

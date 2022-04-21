import { Converter } from '../types';

function createRangeConverter(keyword: 'exclusiveMinimum', valueKeyword: 'minimum'): Converter;
function createRangeConverter(keyword: 'exclusiveMaximum', valueKeyword: 'maximum'): Converter;
function createRangeConverter(
  keyword: 'exclusiveMinimum' | 'exclusiveMaximum',
  valueKeyword: 'minimum' | 'maximum',
): Converter {
  return schema => {
    if (!(keyword in schema)) return;
    const { [keyword]: value } = schema;
    if (value !== true || typeof schema[valueKeyword] !== 'number') {
      delete schema[keyword];
    } else {
      schema[keyword] = schema[valueKeyword];
      delete schema[valueKeyword];
    }
  };
}

export default {
  exclusiveMinimum: createRangeConverter('exclusiveMinimum', 'minimum'),
  exclusiveMaximum: createRangeConverter('exclusiveMaximum', 'maximum'),
};

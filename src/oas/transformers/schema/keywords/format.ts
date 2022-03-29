import type { JSONSchema7 } from 'json-schema';

import type { Converter } from '../types';

const ranges = {
  MIN_INT_32: 0 - 2 ** 31,
  MAX_INT_32: 2 ** 31 - 1,
  MIN_INT_64: 0 - 2 ** 63,
  MAX_INT_64: 2 ** 63 - 1,
  MIN_FLOAT: 0 - 2 ** 128,
  MAX_FLOAT: 2 ** 128 - 1,
  MIN_DOUBLE: 0 - Number.MAX_VALUE,
  MAX_DOUBLE: Number.MAX_VALUE,
};

const createNumberFormatter = (min: number, max: number): Converter => {
  return schema => {
    schema.minimum = Math.max(asActualNumber(schema.minimum, min), min);
    schema.maximum = Math.min(asActualNumber(schema.maximum, max), max);
  };
};

const convertFormatInt32 = createNumberFormatter(ranges.MIN_INT_32, ranges.MAX_INT_32);
const convertFormatInt64 = createNumberFormatter(ranges.MIN_INT_64, ranges.MAX_INT_64);
const convertFormatFloat = createNumberFormatter(ranges.MIN_FLOAT, ranges.MAX_FLOAT);
const convertFormatDouble = createNumberFormatter(ranges.MIN_DOUBLE, ranges.MAX_DOUBLE);

const convertFormatByte: Converter = schema => {
  schema.pattern = '^[\\w\\d+\\/=]*$';
};

const convertFormatBase64: Converter = schema => {
  // Matches base64 (RFC 4648)
  // Matches `standard` base64 not `base64url`. The specification does not
  // exclude it but current ongoing OpenAPI plans will distinguish btoh.
  (schema as JSONSchema7).contentEncoding = 'base64';
  delete schema.format;
};

const convertFormatBinary: Converter = schema => {
  (schema as JSONSchema7).contentMediaType = 'application/octet-stream';
  delete schema.format;
};

function asActualNumber(maybeNumber: unknown, defaultValue: number): number {
  const number = Number(maybeNumber);
  return Number.isNaN(number) ? defaultValue : number;
}

const formatConverters = {
  int32: convertFormatInt32,
  int64: convertFormatInt64,
  float: convertFormatFloat,
  double: convertFormatDouble,

  byte: convertFormatByte,

  base64: convertFormatBase64,
  binary: convertFormatBinary,
};

const format: Converter = schema => {
  if (typeof schema.format === 'string' && schema.format in formatConverters) {
    formatConverters[schema.format](schema);
  }
};

export default { format };

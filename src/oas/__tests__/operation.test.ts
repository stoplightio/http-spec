import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';
import { transformOas2Operations } from '../../oas2/operation';
import { transformOas3Operations } from '../../oas3/operation';

const oas2KitchenSinkJson: Spec = require('./fixtures//oas2-kitchen-sink.json');
const oas3KitchenSinkJson: OpenAPIObject = require('./fixtures//oas3-kitchen-sink.json');

describe('oas operation', () => {
  test('openapi v2', () => {
    expect(transformOas2Operations(oas2KitchenSinkJson)).toHaveLength(5);
  });

  test('openapi v3', () => {
    expect(transformOas3Operations(oas3KitchenSinkJson)).toHaveLength(3);
  });
});

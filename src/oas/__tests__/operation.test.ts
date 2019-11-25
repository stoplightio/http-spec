import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';
import { transformOas2Operations } from '../../oas2/operation';
import { transformOas3Operations } from '../../oas3/operation';
import * as oas2KitchenSinkJson from './fixtures//oas2-kitchen-sink.json';
import * as oas3KitchenSinkJson from './fixtures//oas3-kitchen-sink.json';

describe('oas operation', () => {
  test('openapi v2', () => {
    expect(transformOas2Operations(oas2KitchenSinkJson as Spec)).toHaveLength(5);
  });

  test('openapi v3', () => {
    expect(transformOas3Operations(oas3KitchenSinkJson as OpenAPIObject)).toHaveLength(3);
  });
});

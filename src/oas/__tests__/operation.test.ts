import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { transformOas2Operations } from '../../oas2/operation';
import { transformOas3Operations } from '../../oas3/operation';

const oas2KitchenSinkJson: Spec = require('./fixtures/oas2-kitchen-sink.json');
const oas3KitchenSinkJson: OpenAPIObject = require('./fixtures/oas3-kitchen-sink.json');

describe('oas operation', () => {
  it('openapi v2', () => {
    const result = transformOas2Operations(oas2KitchenSinkJson);

    expect(result).toHaveLength(5);
    expect(result).toMatchSnapshot();
  });

  it('openapi v3', () => {
    const result = transformOas3Operations(oas3KitchenSinkJson);

    expect(result).toHaveLength(3);
    expect(result).toMatchSnapshot();
  });
});

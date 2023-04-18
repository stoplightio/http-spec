import { bundleTarget } from '@stoplight/json';
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import { setSkipHashing } from '../../hash';
import { transformOas2Operations } from '../../oas2/operation';
import { transformOas3Operations } from '../../oas3/operation';

setSkipHashing(true);

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

  it('can be re-bundled', () => {
    const document = {
      openapi: '3.0.2',
      info: {},
      paths: {
        '/update': {
          put: {
            summary: '/Update',
            description: 'Post data requests to the Flow. Executors with `@requests(on="/update")` will respond.',
            operationId: '_update_update_put',
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/JinaRequestModel',
                  },
                },
              },
              required: true,
            },
          },
        },
      },
      components: {
        schemas: {
          JinaRequestModel: {
            title: 'JinaRequestModel',
            type: 'object',
            properties: {
              data: {
                anyOf: [
                  {
                    type: 'array',
                    items: {
                      $ref: '#/components/schemas/PydanticDocument',
                    },
                  },
                ],
              },
            },
          },
          PydanticDocument: {
            title: 'PydanticDocument',
            type: 'object',
            properties: {
              chunks: {
                title: 'Chunks',
                type: 'array',
                items: {
                  $ref: '#/components/schemas/PydanticDocument',
                },
              },
            },
          },
        },
      },
    };
    const result = transformOas3Operations(document);

    expect(
      bundleTarget({
        document: {
          ...document,
          __target__: result[0],
        },
        path: '#/__target__',
        cloneDocument: false,
      }),
    ).toStrictEqual({
      id: 'http_operation-undefined-put-/update',
      iid: '_update_update_put',
      method: 'put',
      path: '/update',
      description: 'Post data requests to the Flow. Executors with `@requests(on="/update")` will respond.',
      request: {
        body: {
          id: 'http_request_body-http_operation-undefined-put-/update',
          contents: [
            {
              id: 'http_media-http_request_body-http_operation-undefined-put-/update-application/json',
              mediaType: 'application/json',
              encodings: [],
              examples: [],
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                properties: {
                  data: {
                    anyOf: [
                      {
                        items: {
                          $ref: '#/__bundled__/PydanticDocument',
                        },
                        type: 'array',
                      },
                    ],
                  },
                },
                title: 'JinaRequestModel',
                type: 'object',
                'x-stoplight': {
                  id: 'schema-undefined-JinaRequestModel',
                },
              },
            },
          ],
          required: true,
        },
        cookie: [],
        headers: [],
        path: [],
        query: [],
      },
      extensions: {},
      responses: [],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [],
      summary: '/Update',
      tags: [],
      __bundled__: {
        PydanticDocument: {
          title: 'PydanticDocument',
          type: 'object',
          properties: {
            chunks: {
              title: 'Chunks',
              type: 'array',
              items: {
                $ref: '#/__bundled__/PydanticDocument',
              },
            },
          },
        },
      },
    });
  });
});

import { OpenAPIObject } from 'openapi3-ts';

import { setSkipHashing } from '../../hash';
import {
  transformOas3Operation as _transformOas3Operation,
  transformOas3Operations as _transformOas3Operations,
} from '../operation';

setSkipHashing(true);

const transformOas3Operation: typeof _transformOas3Operation = opts => _transformOas3Operation(opts);

const transformOas3Operations: typeof _transformOas3Operations = opts => _transformOas3Operations(opts);

describe('transformOas3Operation', () => {
  it('should return deprecated property in http operation root', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.0',
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      paths: {
        '/users/{userId}': {
          get: {
            deprecated: true,
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('deprecated', true);
  });

  it('should properly translate operation with no response body', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.0',
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      paths: {
        '/users/{userId}': {
          delete: {
            description: 'Some description',
            responses: {
              '204': {
                description: 'Succesfully deleted stuff',
              },
            },
          },
        },
      },
    };

    const result = transformOas3Operation({
      path: '/users/{userId}',
      method: 'delete',
      document,
    });

    expect(result.responses[0].contents).toHaveLength(0);
  });

  it('should return x-internal property in http operation root', () => {
    const document: OpenAPIObject = {
      openapi: '3.0.0',
      info: {
        title: '',
        version: '',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      paths: {
        '/users/{userId}': {
          get: {
            'x-internal': true,
          },
          post: {
            'x-internal': false,
          },
          put: {},
        },
      },
    };

    expect(transformOas3Operations(document)).toEqual([
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'get',
        internal: true,
        extensions: {},
      }),
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'post',
        internal: false,
        extensions: {},
      }),
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'put',
        request: expect.any(Object),
        responses: [],
        security: [],
        servers: expect.any(Array),
        tags: [],
        extensions: {},
      }),
    ]);
  });

  it('given no tags should translate operation with empty tags array', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
    });
  });

  it('given some tags should translate operation with those tags', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      tags: [
        {
          name: 'tag1',
          description: 'tag1 description',
        },
      ],
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
            tags: ['tag1'],
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
      tags: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given invalid tags should translate operation as there were no tags specified', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
            tags: null as any,
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('tags', []);
  });

  it('given tags with invalid values should translate operation as all tags were strings', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
            tags: [2, 'test', false, {}, null],
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('tags', [
      {
        id: expect.any(String),
        name: '2',
      },
      {
        id: expect.any(String),
        name: 'test',
      },
      {
        id: expect.any(String),
        name: 'false',
      },
    ]);
  });

  it('given operation servers should translate operation with those servers', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
            servers: [{ url: 'operation/server' }],
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
      servers: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it.each([2, '', null, [null]])(
    'given invalid operation servers should translate operation with those servers',
    servers => {
      const document: Partial<OpenAPIObject> = {
        openapi: '3',
        info: {
          title: 'title',
          version: '2',
        },
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'opid',
              responses: {},
              deprecated: true,
              description: 'descr',
              summary: 'summary',
              servers,
            },
          },
        },
      };

      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document,
        }),
      ).toHaveProperty('servers', []);
    },
  );

  it('given partially invalid operation servers should translate operation with valid only servers', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
            servers: [null, { url: 'operation/server' }, 0, []],
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('servers', [
      {
        id: expect.any(String),
        name: 'title',
        url: 'operation/server',
      },
    ]);
  });

  it('given path servers should translate operation with those servers', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          servers: [{ url: 'path/server' }],
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
      servers: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it.each([2, '', null, [null]])(
    'given invalid path servers should translate operation with those servers',
    servers => {
      const document: Partial<OpenAPIObject> = {
        openapi: '3',
        info: {
          title: 'title',
          version: '2',
        },
        paths: {
          '/users/{userId}': {
            servers,
            get: {
              operationId: 'opid',
              responses: {},
              deprecated: true,
              description: 'descr',
              summary: 'summary',
            },
          },
        },
      };

      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document,
        }),
      ).toHaveProperty('servers', []);
    },
  );

  it('given partially invalid path servers should translate operation with valid only servers', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/users/{userId}': {
          servers: [null, { url: 'path/server' }, 2, {}],
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('servers', [
      {
        id: expect.any(String),
        name: 'title',
        url: 'path/server',
      },
    ]);
  });

  it('given spec servers should translate operation with those servers', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      servers: [{ url: 'spec/server' }],
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
      servers: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it.each([2, '', null, [null]])(
    'given invalid spec servers should translate operation with those servers',
    (servers: any) => {
      const document: Partial<OpenAPIObject> = {
        openapi: '3',
        info: {
          title: 'title',
          version: '2',
        },
        servers,
        paths: {
          '/users/{userId}': {
            get: {
              operationId: 'opid',
              responses: {},
              deprecated: true,
              description: 'descr',
              summary: 'summary',
            },
          },
        },
      };

      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document,
        }),
      ).toHaveProperty('servers', []);
    },
  );

  it('given partially spec servers should translate operation with valid only servers', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      servers: [null, 1, {}, { url: 'spec/server' }] as any,
      paths: {
        '/users/{userId}': {
          get: {
            operationId: 'opid',
            responses: {},
            deprecated: true,
            description: 'descr',
            summary: 'summary',
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('servers', [
      {
        id: expect.any(String),
        name: 'title',
        url: 'spec/server',
      },
    ]);
  });

  it('callback', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '2',
      },
      paths: {
        '/subscribe': {
          post: {
            operationId: 'opid',
            responses: {},
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
            callbacks: {
              myCallback: {
                'http://example.com?transactionId={$request.body#/id}': {
                  post: {
                    operationId: 'cbId',
                    responses: {},
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/subscribe',
        method: 'post',
        document,
      }),
    ).toMatchSnapshot({
      id: expect.any(String),
      request: {
        body: {
          id: expect.any(String),
          contents: [
            {
              id: expect.any(String),
              schema: {
                'x-stoplight': {
                  id: expect.any(String),
                },
              },
            },
          ],
        },
      },
      callbacks: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given malformed parameters should translate operation with those parameters', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '',
      },
      paths: {
        '/users/{userId}': {
          get: {
            parameters: [
              {
                in: 'header',
                name: 'name',
                schema: {
                  type: 'string',
                  format: 'int32',
                },
                example: 'test',
              },
              null,
            ],
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toStrictEqual({
      id: expect.any(String),
      method: 'get',
      path: '/users/{userId}',
      request: {
        cookie: [],
        headers: [
          {
            id: expect.any(String),
            examples: [
              {
                id: expect.any(String),
                key: 'default',
                value: 'test',
              },
            ],
            name: 'name',
            style: 'simple',
            schema: {
              'x-stoplight': {
                id: expect.any(String),
                explicitProperties: expect.any(Array),
              },
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'string',
              format: 'int32',
              maximum: 2147483647,
              minimum: -2147483648,
              examples: ['test'],
            },
          },
        ],
        path: [],
        query: [],
      },
      responses: [],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [],
      tags: [],
      extensions: {},
    });
  });

  it('does not add default example if there is already one in examples', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3',
      info: {
        title: 'title',
        version: '',
      },
      paths: {
        '/users/{userId}': {
          get: {
            parameters: [
              {
                in: 'header',
                name: 'name',
                schema: {
                  type: 'string',
                  format: 'int32',
                },
                example: 'test',
                examples: {
                  default: {
                    value: 'some example',
                  },
                },
              },
              null,
            ],
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toStrictEqual({
      id: expect.any(String),
      method: 'get',
      path: '/users/{userId}',
      request: {
        cookie: [],
        headers: [
          {
            id: expect.any(String),
            examples: [
              {
                id: expect.any(String),
                key: 'default',
                value: 'some example',
              },
            ],
            style: 'simple',
            name: 'name',
            schema: {
              'x-stoplight': {
                id: expect.any(String),
                explicitProperties: expect.any(Array),
              },
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'string',
              format: 'int32',
              maximum: 2147483647,
              minimum: -2147483648,
              examples: ['test'],
            },
          },
        ],
        path: [],
        query: [],
      },
      responses: [],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [],
      tags: [],
      extensions: {},
    });
  });

  it('should keep the server variables', () => {
    const document: Partial<OpenAPIObject> = {
      paths: {
        '/pets': {
          get: {
            responses: {
              '200': {
                description: 'OK',
              },
            },
            summary: 'List pets',
          },
        },
      },
      servers: [
        {
          url: 'https://petstore.swagger.io/v2',
          description: 'Sample Petstore Server Https',
          variables: {
            username: {
              default: 'demo',
              description: 'value is assigned by the service provider',
            },
            port: {
              enum: [8443, 443],
              default: 8443,
            },
            basePath: {
              default: 'v2',
            },
          },
        },
        {
          url: 'http://petstore.swagger.io/v2',
          description: 'Sample Petstore Server Http',
        },
      ],
    };

    expect(transformOas3Operation({ document, path: '/pets', method: 'get' }).servers).toEqual([
      {
        id: expect.any(String),
        description: 'Sample Petstore Server Https',
        url: 'https://petstore.swagger.io/v2',
        variables: {
          basePath: {
            default: 'v2',
          },
          port: {
            default: '8443',
            enum: ['8443', '443'],
          },
          username: {
            default: 'demo',
            description: 'value is assigned by the service provider',
          },
        },
      },
      {
        id: expect.any(String),
        description: 'Sample Petstore Server Http',
        url: 'http://petstore.swagger.io/v2',
      },
    ]);
  });

  it('given shared examples in requestBody and response, should resolve them', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.1',
      info: {
        title: 'title',
        version: '',
      },
      paths: {
        '/pet': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {},
                    },
                    examples: {
                      'pet-shared': {
                        $ref: '#/components/examples/Pet',
                      },
                      'pet-not-shared': {
                        value: {
                          'not-shared': true,
                        },
                      },
                    },
                  },
                },
              },
            },
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {},
                  },
                  examples: {
                    'pet-shared': {
                      $ref: '#/components/examples/Pet',
                    },
                    'pet-not-shared': {
                      value: {
                        'not-shared': true,
                      },
                    },
                  },
                },
              },
            },
          },
          parameters: [],
        },
      },
      components: {
        examples: {
          Pet: {
            value: {
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
              },
              required: ['id'],
            },
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/pet',
        method: 'get',
        document,
      }),
    ).toStrictEqual({
      id: expect.any(String),
      method: 'get',
      path: '/pet',
      request: {
        body: {
          id: expect.any(String),
          contents: [
            {
              id: expect.any(String),
              encodings: [],
              examples: [
                {
                  id: expect.any(String),
                  key: 'pet-shared',
                  value: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                  },
                },
                {
                  id: expect.any(String),
                  key: 'pet-not-shared',
                  value: {
                    'not-shared': true,
                  },
                },
              ],
              mediaType: 'application/json',
              schema: {
                'x-stoplight': {
                  id: expect.any(String),
                },
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {},
              },
            },
          ],
        },
        cookie: [],
        headers: [],
        path: [],
        query: [],
      },
      responses: [
        {
          id: expect.any(String),
          code: '200',
          contents: [
            {
              id: expect.any(String),
              encodings: [],
              examples: [
                {
                  id: expect.any(String),
                  key: 'pet-shared',
                  value: {
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                    required: ['id'],
                    type: 'object',
                  },
                },
                {
                  id: expect.any(String),
                  key: 'pet-not-shared',
                  value: {
                    'not-shared': true,
                  },
                },
              ],
              mediaType: 'application/json',
              schema: {
                'x-stoplight': {
                  id: expect.any(String),
                },
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {},
              },
            },
          ],
          headers: [],
        },
      ],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [],
      tags: [],
      extensions: {},
    });
  });

  it('should resolve requestBody reference to path operation requestBody', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.1',
      info: {
        title: 'title',
        version: '',
      },
      paths: {
        '/pets': {
          post: {
            requestBody: {
              $ref: '#/paths/~1pets/put/requestBody',
            },
          },
          put: {
            requestBody: {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/pets',
        method: 'post',
        document,
      }),
    ).toHaveProperty('request.body', {
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          encodings: [],
          examples: [],
          mediaType: 'application/json',
          schema: {
            'x-stoplight': {
              id: expect.any(String),
            },
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
          },
        },
      ],
    });
  });

  it('should resolve requestBody reference to components requestBodies', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.1',
      info: {
        title: 'title',
        version: '',
      },
      paths: {
        '/pets': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Pet',
            },
          },
        },
      },
      components: {
        requestBodies: {
          Pet: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(
      transformOas3Operation({
        path: '/pets',
        method: 'post',
        document,
      }),
    ).toHaveProperty('request.body', {
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          encodings: [],
          examples: [],
          mediaType: 'application/json',
          schema: {
            'x-stoplight': {
              id: expect.any(String),
            },
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'object',
            properties: {
              id: {
                type: 'string',
              },
            },
          },
        },
      ],
    });
  });

  it('should not fail if requestBody reference points to a falsy value', () => {
    const document: Partial<OpenAPIObject> = {
      openapi: '3.0.1',
      info: {
        title: 'title',
        version: '',
      },
      paths: {
        '/pets': {
          post: {
            requestBody: {
              $ref: '#/components/requestBodies/Pet',
            },
          },
        },
      },
      components: {
        requestBodies: {
          Pet: null as any,
        },
      },
    };

    expect(
      transformOas3Operation.bind(null, {
        path: '/pets',
        method: 'post',
        document,
      }),
    ).not.toThrow();
  });

  it('should keep schemas with broken $refs', () => {
    const document = {
      openapi: '3.1.0',
      paths: {
        '/hello/test': {
          get: {
            operationId: 'get-test',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/broken/ref',
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(transformOas3Operation({ document, path: '/hello/test', method: 'get' })).toStrictEqual({
      id: 'http_operation-undefined-get-/hello/test',
      iid: 'get-test',
      method: 'get',
      path: '/hello/test',
      responses: [
        {
          id: 'http_response-http_operation-undefined-get-/hello/test-200',
          code: '200',
          headers: [],
          contents: [
            {
              id: 'http_media-http_response-http_operation-undefined-get-/hello/test-200-application/json',
              mediaType: 'application/json',
              schema: {
                $ref: '#/broken/ref',
                $schema: 'http://json-schema.org/draft-07/schema#',
                'x-stoplight': {
                  id: 'schema-http_operation-undefined-get-/hello/test-',
                },
              },
              examples: [],
              encodings: [],
            },
          ],
        },
      ],
      servers: [],
      request: {
        headers: [],
        query: [],
        cookie: [],
        path: [],
      },
      tags: [],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      extensions: {},
    });
  });

  describe('OAS 3.1 support', () => {
    it('should respect jsonSchemaDialect', () => {
      const document: Partial<OpenAPIObject> = {
        openapi: '3.1.0',
        jsonSchemaDialect: 'https://json-schema.org/draft/2020-12/schema',
        paths: {
          '/pet': {
            get: {
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {},
                      },
                    },
                  },
                },
              },
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {},
                    },
                  },
                },
              },
            },
            parameters: [
              {
                in: 'header',
                name: 'email',
                schema: {
                  type: 'string',
                  format: 'email',
                },
                example: 'test',
              },
            ],
          },
          '/users/{userId}': {
            $ref: '#/components/pathItems/userId',
          },
        },
        components: {
          pathItems: {
            userId: {
              get: {
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document,
        }),
      ).toEqual(
        expect.objectContaining({
          responses: [
            expect.objectContaining({
              code: '200',
              contents: [
                expect.objectContaining({
                  schema: {
                    'x-stoplight': {
                      id: expect.any(String),
                    },
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object',
                    properties: {},
                  },
                }),
              ],
              headers: [],
            }),
          ],
        }),
      );

      expect(
        transformOas3Operation({
          path: '/pet',
          method: 'get',
          document,
        }),
      ).toEqual(
        expect.objectContaining({
          request: {
            body: expect.objectContaining({
              contents: [
                expect.objectContaining({
                  schema: {
                    'x-stoplight': {
                      id: expect.any(String),
                    },
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object',
                    properties: {},
                  },
                }),
              ],
            }),
            cookie: [],
            headers: [
              expect.objectContaining({
                schema: {
                  'x-stoplight': {
                    id: expect.any(String),
                  },
                  $schema: 'https://json-schema.org/draft/2020-12/schema',
                  type: 'string',
                  format: 'email',
                  example: 'test',
                },
              }),
            ],
            path: [],
            query: [],
          },
          responses: [
            expect.objectContaining({
              code: '200',
              contents: [
                expect.objectContaining({
                  schema: {
                    'x-stoplight': {
                      id: expect.any(String),
                    },
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object',
                    properties: {},
                  },
                }),
              ],
            }),
          ],
        }),
      );
    });

    it('should support pathItems', () => {
      const document: Partial<OpenAPIObject> = {
        openapi: '3.1.0',
        paths: {
          '/users/{userId}': {
            $ref: '#/components/pathItems/userId',
          },
        },
        components: {
          pathItems: {
            userId: {
              get: {
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {},
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document,
        }),
      ).toHaveProperty('responses', [
        {
          id: expect.any(String),
          code: '200',
          contents: expect.any(Array),
          headers: expect.any(Array),
        },
      ]);
    });

    it('should support requestBodies on any method', () => {
      const document: Partial<OpenAPIObject> = {
        'x-stoplight': { id: 'abc-def' },
        openapi: '3.1.0',
        paths: {
          '/subscribe': {
            connect: {
              operationId: 'opid',
              responses: {},
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      expect(
        transformOas3Operation({
          path: '/subscribe',
          method: 'connect',
          document,
        }),
      ).toHaveProperty('request.body', {
        id: expect.any(String),
        contents: [
          {
            id: expect.any(String),
            encodings: [],
            examples: [],
            mediaType: 'application/json',
            schema: {
              'x-stoplight': {
                id: expect.any(String),
              },
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'object',
              properties: {
                id: {
                  type: 'string',
                },
              },
            },
          },
        ],
      });
    });
  });
});

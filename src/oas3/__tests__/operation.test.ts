import { OpenAPIObject } from 'openapi3-ts';

import { transformOas3Operation, transformOas3Operations } from '../operation';

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

    expect(transformOas3Operations(document)).toStrictEqual([
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'get',
        internal: true,
      }),
      expect.objectContaining({
        path: '/users/{userId}',
        method: 'post',
        internal: false,
      }),
      {
        id: '?http-operation-id?',
        path: '/users/{userId}',
        method: 'put',
        request: expect.any(Object),
        responses: [],
        security: [],
        servers: expect.any(Array),
        tags: [],
      },
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
    ).toMatchSnapshot();
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
    ).toMatchSnapshot();
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
        name: '2',
      },
      {
        name: 'test',
      },
      {
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
    ).toMatchSnapshot();
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
        description: void 0,
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
    ).toMatchSnapshot();
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
        description: void 0,
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
    ).toMatchSnapshot();
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
        description: void 0,
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
    ).toMatchSnapshot();
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
      id: '?http-operation-id?',
      method: 'get',
      path: '/users/{userId}',
      request: {
        body: {
          contents: [],
        },
        cookie: [],
        headers: [
          {
            examples: [
              {
                key: 'default',
                value: 'test',
              },
            ],
            name: 'name',
            schema: {
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
      servers: [],
      tags: [],
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
      id: '?http-operation-id?',
      method: 'get',
      path: '/users/{userId}',
      request: {
        body: {
          contents: [],
        },
        cookie: [],
        headers: [
          {
            examples: [
              {
                key: 'default',
                value: 'some example',
              },
            ],
            name: 'name',
            schema: {
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
      servers: [],
      tags: [],
    });
  });

  it('should keep the server variables', () => {
    const document: Partial<OpenAPIObject> = {
      id: '?http-service-id?',
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
        description: 'Sample Petstore Server Https',
        url: 'https://petstore.swagger.io/v2',
        variables: {
          basePath: {
            default: 'v2',
            description: void 0,
            enum: void 0,
          },
          port: {
            default: '8443',
            description: void 0,
            enum: ['8443', '443'],
          },
          username: {
            default: 'demo',
            description: 'value is assigned by the service provider',
            enum: void 0,
          },
        },
      },
      {
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
      id: '?http-operation-id?',
      method: 'get',
      path: '/pet',
      request: {
        body: {
          contents: [
            {
              encodings: [],
              examples: [
                {
                  description: undefined,
                  key: 'pet-shared',
                  summary: undefined,
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
                  description: undefined,
                  key: 'pet-not-shared',
                  value: {
                    'not-shared': true,
                  },
                  summary: undefined,
                },
              ],
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {},
              },
            },
          ],
          description: undefined,
          required: undefined,
        },
        cookie: [],
        headers: [],
        path: [],
        query: [],
      },
      responses: [
        {
          code: '200',
          contents: [
            {
              encodings: [],
              examples: [
                {
                  description: undefined,
                  key: 'pet-shared',
                  summary: undefined,
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
                  description: undefined,
                  key: 'pet-not-shared',
                  summary: undefined,
                  value: {
                    'not-shared': true,
                  },
                },
              ],
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'object',
                properties: {},
              },
            },
          ],
          description: undefined,
          headers: [],
        },
      ],
      security: [],
      servers: [],
      tags: [],
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
      contents: [
        {
          encodings: [],
          examples: [],
          mediaType: 'application/json',
          schema: {
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
      contents: [
        {
          encodings: [],
          examples: [],
          mediaType: 'application/json',
          schema: {
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
      transformOas3Operation({
        path: '/pets',
        method: 'post',
        document,
      }),
    ).toHaveProperty('request.body', {
      contents: [],
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
            {
              code: '200',
              contents: [
                {
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object',
                    properties: {},
                  },
                },
              ],
              headers: [],
            },
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
            body: {
              contents: [
                {
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object',
                    properties: {},
                  },
                },
              ],
            },
            cookie: [],
            headers: [
              {
                examples: [{ key: 'default', value: 'test' }],
                name: 'email',
                schema: {
                  $schema: 'https://json-schema.org/draft/2020-12/schema',
                  type: 'string',
                  format: 'email',
                  example: 'test',
                },
              },
            ],
            path: [],
            query: [],
          },
          responses: [
            {
              code: '200',
              contents: [
                {
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'https://json-schema.org/draft/2020-12/schema',
                    type: 'object',
                    properties: {},
                  },
                },
              ],
              headers: [],
            },
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
          code: '200',
          contents: expect.any(Array),
          headers: expect.any(Array),
        },
      ]);
    });

    it('should support requestBodies on any method', () => {
      const document: Partial<OpenAPIObject> = {
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
        contents: [
          {
            encodings: [],
            examples: [],
            mediaType: 'application/json',
            schema: {
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

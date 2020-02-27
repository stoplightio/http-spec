import { OpenAPIObject } from 'openapi3-ts';
import { transformOas3Operation } from '../operation';

describe('transformOas3Operation', () => {
  test('should return deprecated property in http operation root', () => {
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

  test('given no tags should translate operation with empty tags array', () => {
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

  test('given some tags should translate operation with those tags', () => {
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

  test('given invalid tags should translate operation as there were no tags specified', () => {
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

  test('given tags with invalid values should translate operation as all tags were strings', () => {
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

  test('given operation servers should translate operation with those servers', () => {
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

  test.each([2, '', null, [null]])(
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

  test('given partially invalid operation servers should translate operation with valid only servers', () => {
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

  test('given path servers should translate operation with those servers', () => {
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

  test.each([2, '', null, [null]])(
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

  test('given partially invalid path servers should translate operation with valid only servers', () => {
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

  test('given spec servers should translate operation with those servers', () => {
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

  test.each([2, '', null, [null]])(
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

  test('given partially spec servers should translate operation with valid only servers', () => {
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

  test('callback', () => {
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

  test('given malformed parameters should translate operation with those parameters', () => {
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
            example: 'test',
            examples: [],
            name: 'name',
            schema: {
              type: 'string',
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

  test('should keep the server variables', () => {
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
});

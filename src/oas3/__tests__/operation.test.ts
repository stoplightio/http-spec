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
        variables: {},
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
        variables: {},
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
        variables: {},
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
});

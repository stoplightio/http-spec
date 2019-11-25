import { transformOas3Operation } from '../operation';

describe('transformOas3Operation', () => {
  test('should return deprecated property', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
          openapi: '3.0.0',
          info: {
            title: 'Test',
            version: '1.0',
          },
          servers: [
            {
              url: 'http://localhost:3000',
            },
          ],
          paths: {
            '/users/{userId}': {
              get: {
                summary: 'Your GET endpoint',
                tags: [],
                responses: {
                  '200': {
                    description: 'OK',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'objec',
                          properties: {
                            foo: {
                              type: 'string',
                              default: 'bar',
                              deprecated: true,
                              enum: ['foo'],
                              format: 'date',
                              example: 'doo',
                            },
                          },
                        },
                      },
                    },
                  },
                },
                operationId: 'get-test',
                deprecated: true,
                parameters: [
                  {
                    schema: {
                      type: 'string',
                    },
                    in: 'query',
                    name: 'query-param',
                    deprecated: true,
                  },
                ],
              },
            },
          },
          components: {
            schemas: {},
          },
        },
      }),
    ).toMatchSnapshot();
  });

  test('given no tags should translate operation with empty tags array', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
      }),
    ).toMatchSnapshot();
  });

  test('given some tags should translate operation with those tags', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
      }),
    ).toMatchSnapshot();
  });

  test('given invalid tags should translate operation as there were no tags specified', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
      }),
    ).toHaveProperty('tags', []);
  });

  test('given tags with invalid values should translate operation as all tags were strings', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
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
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
      }),
    ).toMatchSnapshot();
  });

  test.each([2, '', null, [null]])(
    'given invalid operation servers should translate operation with those servers',
    servers => {
      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document: {
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
          },
        }),
      ).toHaveProperty('servers', []);
    },
  );

  test('given partially invalid operation servers should translate operation with valid only servers', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
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
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
      }),
    ).toMatchSnapshot();
  });

  test.each([2, '', null, [null]])(
    'given invalid path servers should translate operation with those servers',
    servers => {
      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document: {
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
          },
        }),
      ).toHaveProperty('servers', []);
    },
  );

  test('given partially invalid path servers should translate operation with valid only servers', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
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
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
      }),
    ).toMatchSnapshot();
  });

  test.each([2, '', null, [null]])(
    'given invalid spec servers should translate operation with those servers',
    (servers: any) => {
      expect(
        transformOas3Operation({
          path: '/users/{userId}',
          method: 'get',
          document: {
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
          },
        }),
      ).toHaveProperty('servers', []);
    },
  );

  test('given partially spec servers should translate operation with valid only servers', () => {
    expect(
      transformOas3Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
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
        },
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
    expect(
      transformOas3Operation({
        path: '/subscribe',
        method: 'post',
        document: {
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
        },
      }),
    ).toMatchSnapshot();
  });
});

import { transformOas3Operation } from '../operation';

describe('transformOas3Operation', () => {
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

import { HeaderDefinition, RequestAuthDefinition, RequestBody, VariableDefinition } from 'postman-collection';
import { operation } from 'retry';
import { transformPostmanCollectionOperation, transformPostmanCollectionOperations } from '../operation';

describe('transformPostmanCollectionOperation()', () => {
  describe('operation can be found', () => {
    describe('description is set', () => {
      it('returns operation with description', () => {
        expect(
          transformPostmanCollectionOperation({
            document: {
              item: [
                {
                  request: {
                    method: 'get',
                    url: '/path/:param?a=b',
                    body: { mode: 'raw', raw: 'test' } as RequestBody,
                    header: [{ key: 'header', value: 'a header' }] as HeaderDefinition,
                  },
                  description: 'desc',
                },
              ],
            },
            method: 'get',
            path: '/path/{param}',
          }),
        ).toEqual({
          description: 'desc',
          id: '?http-operation-id?',
          iid: expect.stringMatching(/^[a-z0-9]{8}-([a-z0-9]{4}-){3}[a-z0-9]{12}$/),
          method: 'get',
          path: '/path/{param}',
          request: expect.any(Object),
          responses: [],
          security: [],
          summary: undefined,
        });
      });
    });

    describe('description is not set', () => {
      it('returns operation without description', () => {
        expect(
          transformPostmanCollectionOperation({
            document: { item: [{ request: { method: 'get', url: '/path' } }] },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(expect.objectContaining({ description: undefined }));
      });
    });

    describe('content-type is set', () => {
      it('returns operation with body media-type set', () => {
        expect(
          transformPostmanCollectionOperation({
            document: {
              item: [
                {
                  request: {
                    method: 'get',
                    url: '/path',
                    header: [{ key: 'content-type', value: 'application/json' }] as HeaderDefinition,
                    body: {
                      mode: 'raw',
                      raw: '{}',
                    } as RequestBody,
                  },
                },
              ],
            },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(expect.objectContaining({ description: undefined }));
      });
    });

    describe('auth is set', () => {
      describe('auth transforms to security scheme', () => {
        it('produces operation with security scheme', () => {
          expect(
            transformPostmanCollectionOperation({
              document: {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path',
                      auth: { type: 'basic' },
                    },
                  },
                ],
              },
              method: 'get',
              path: '/path',
            }),
          ).toEqual(
            expect.objectContaining({
              security: [[{ key: 'http-0', scheme: 'basic', type: 'http' }]],
            }),
          );
        });
      });

      describe('auth transforms to header params', () => {
        it('it appends authorization data to headers', () => {
          expect(
            transformPostmanCollectionOperation({
              document: {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path',
                      auth: { type: 'hawk' },
                    },
                  },
                ],
              },
              method: 'get',
              path: '/path',
            }),
          ).toEqual(
            expect.objectContaining({
              request: expect.objectContaining({
                headers: [
                  {
                    description: 'Hawk Authorization Header',
                    name: 'Authorization',
                    required: true,
                    schema: { pattern: '^Hawk .+$', type: 'string' },
                    style: 'simple',
                  },
                ],
              }),
            }),
          );
        });
      });

      describe('auth transforms to query params', () => {
        it('it appends authorization data to query params', () => {
          expect(
            transformPostmanCollectionOperation({
              document: {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path',
                      auth: {
                        type: 'oauth2',
                        oauth2: [
                          {
                            key: 'addTokenTo',
                            value: 'queryParams',
                            type: 'string',
                          },
                        ],
                      } as RequestAuthDefinition,
                    },
                  },
                ],
              },
              method: 'get',
              path: '/path',
            }),
          ).toEqual(
            expect.objectContaining({
              request: expect.objectContaining({
                query: [{ description: 'OAuth2 Access Token', name: 'access_token', required: true, style: 'form' }],
              }),
            }),
          );
        });
      });

      describe('auth is set to noauth', () => {
        it('ignores it', () => {
          expect(
            transformPostmanCollectionOperation({
              document: {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path',
                      auth: { type: 'nooauth' },
                    },
                  },
                ],
              },
              method: 'get',
              path: '/path',
            }),
          ).toEqual(
            expect.objectContaining({
              request: expect.objectContaining({
                headers: [],
                query: [],
              }),
              security: [],
            }),
          );
        });
      });
    });

    describe('url contains host', () => {
      it('produces operation with single server', () => {
        expect(
          transformPostmanCollectionOperation({
            document: {
              item: [
                {
                  request: {
                    method: 'get',
                    url: 'https://example.com:666/path',
                  },
                },
              ],
            },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(
          expect.objectContaining({
            servers: [{ url: 'https://example.com:666' }],
          }),
        );
      });
    });

    describe('variables are defined', () => {
      it('it resolves variables correctly', () => {
        expect(
          transformPostmanCollectionOperation({
            document: {
              item: [
                {
                  request: {
                    method: 'get',
                    url: 'https://{{hostvar}}/path',
                    body: { mode: 'raw', raw: 'test{{bodyvar}}test' } as RequestBody,
                  },
                },
              ],
              variable: [
                {
                  key: 'bodyvar',
                  value: 'TEST',
                },
                {
                  key: 'hostvar',
                  value: 'example.com',
                },
              ] as VariableDefinition,
            },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(
          expect.objectContaining({
            request: expect.objectContaining({
              body: { contents: [{ examples: [{ key: 'default', value: 'testTESTtest' }], mediaType: 'text/plain' }] },
            }),
            servers: [{ url: 'https://example.com' }],
          }),
        );
      });
    });
  });

  describe('operation cannot be found', () => {
    it('throws an error', () => {
      expect(() =>
        transformPostmanCollectionOperation({
          document: { item: [{ request: { method: 'get', url: '/path' } }] },
          method: 'get',
          path: '/non-existing',
        }),
      ).toThrowError('Unable to find "get /non-existing"');
    });
  });
});

describe('transformPostmanCollectionOperations()', () => {
  it('transforms operations nested in folders', () => {
    const operations = transformPostmanCollectionOperations({
      item: [
        {
          item: [
            { request: { method: 'get', url: '/a/a' } },
            {
              item: [{ request: { method: 'get', url: '/a/a/a' } }, { request: { method: 'get', url: '/a/a/b' } }],
            },
          ],
        },
        { request: { method: 'get', url: '/a' } },
      ],
    });

    expect(operations).toEqual(
      expect.arrayContaining([
        {
          description: undefined,
          id: '?http-operation-id?',
          iid: expect.any(String),
          method: 'get',
          path: '/a/a',
          request: {
            body: undefined,
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: undefined,
          summary: undefined,
        },
        {
          description: undefined,
          id: '?http-operation-id?',
          iid: expect.any(String),
          method: 'get',
          path: '/a/a/a',
          request: {
            body: undefined,
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: undefined,
          summary: undefined,
        },
        {
          description: undefined,
          id: '?http-operation-id?',
          iid: expect.any(String),
          method: 'get',
          path: '/a/a/b',
          request: {
            body: undefined,
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: undefined,
          summary: undefined,
        },
        {
          description: undefined,
          id: '?http-operation-id?',
          iid: expect.any(String),
          method: 'get',
          path: '/a',
          request: {
            body: undefined,
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          servers: undefined,
          summary: undefined,
        },
      ]),
    );

    expect(operations).toHaveLength(4);
  });
});

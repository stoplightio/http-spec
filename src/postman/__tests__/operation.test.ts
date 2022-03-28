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
                    body: { mode: 'raw', raw: 'test' },
                    header: [{ key: 'header', value: 'a header' }],
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
        ).toEqual(expect.objectContaining({}));
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
                    header: [{ key: 'content-type', value: 'application/json' }],
                    body: {
                      mode: 'raw',
                      raw: '{}',
                    },
                  },
                },
              ],
            },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(expect.objectContaining({}));
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
              security: [
                [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'http-0', scheme: 'basic', type: 'http' }],
              ],
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
                    id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
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
                      },
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
                query: [
                  {
                    id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                    description: 'OAuth2 Access Token',
                    name: 'access_token',
                    required: true,
                    style: 'form',
                  },
                ],
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
                      auth: { type: 'noauth' },
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
            servers: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), url: 'https://example.com:666' }],
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
                    body: { mode: 'raw', raw: 'test{{bodyvar}}test' },
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
              ],
            },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(
          expect.objectContaining({
            request: expect.objectContaining({
              body: {
                id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                contents: [
                  {
                    id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                    examples: [
                      { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: 'testTESTtest' },
                    ],
                    mediaType: 'text/plain',
                  },
                ],
              },
            }),
            servers: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), url: 'https://example.com' }],
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
        expect.objectContaining({
          path: '/a/a',
        }),
        expect.objectContaining({
          path: '/a/a/a',
        }),
        expect.objectContaining({
          path: '/a/a/b',
        }),
        expect.objectContaining({
          path: '/a',
        }),
      ]),
    );

    expect(operations).toHaveLength(4);
  });

  it('combines request headers from related items into single operation', () => {
    const operations = transformPostmanCollectionOperations({
      item: [
        { request: { method: 'get', url: '/a', header: [{ key: 'a-header', value: 'a header' }] } },
        { request: { method: 'get', url: '/a', header: [{ key: 'b-header', value: 'b header' }] } },
      ],
    });

    expect(operations).toEqual([
      expect.objectContaining({
        request: expect.objectContaining({
          headers: [
            {
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              examples: [
                {
                  id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                  key: 'default',
                  value: 'a header',
                },
              ],
              name: 'a-header',
              schema: {
                type: 'string',
              },
              style: 'simple',
              required: false,
            },
            {
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              examples: [
                {
                  id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                  key: 'default',
                  value: 'b header',
                },
              ],
              name: 'b-header',
              schema: {
                type: 'string',
              },
              style: 'simple',
              required: false,
            },
          ],
        }),
      }),
    ]);
  });

  it('combines response contents from related items into single operation', () => {
    const operations = transformPostmanCollectionOperations({
      item: [
        {
          request: { url: '/a', method: 'get' },
          response: [
            {
              code: 200,
              responseTime: 666,
              header: [{ key: 'Content-type', value: 'application/json' }],
              body: '{"a":1}',
            },
            { code: 200, responseTime: 666, header: [{ key: 'Content-type', value: 'text/plain' }], body: 'a=1' },
          ],
        },
        {
          request: { url: '/a', method: 'get' },
          response: [
            {
              code: 200,
              responseTime: 666,
              header: [{ key: 'Content-type', value: 'application/json' }],
              body: '{"a":1}',
            },
            {
              code: 200,
              responseTime: 666,
              header: [{ key: 'Content-type', value: 'application/xml' }],
              body: '<a>1</a>',
            },
          ],
        },
      ],
    });

    expect(operations).toEqual([
      expect.objectContaining({
        responses: [
          expect.objectContaining({
            code: '200',
            contents: [
              expect.objectContaining({ mediaType: 'application/json' }),
              expect.objectContaining({ mediaType: 'text/plain' }),
              expect.objectContaining({ mediaType: 'application/xml' }),
            ],
          }),
        ],
      }),
    ]);
  });
});

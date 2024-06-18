import * as fs from 'fs';
import * as path from 'path';

import { setSkipHashing } from '../../hash';
import { bundleOas2Service } from '../service';

setSkipHashing(true);

describe('bundleOas2Service', () => {
  it('should not bundle shared requestBodies', () => {
    expect(
      bundleOas2Service({
        document: {
          'x-stoplight': {
            id: 'abc',
          },
          swagger: '2.0',
          paths: {
            '/users/{userId}': {
              patch: {
                consumes: ['application/json'],
                parameters: [
                  {
                    $ref: '#/parameters/ids',
                  },
                  {
                    $ref: '#/parameters/email',
                  },
                ],
              },
              put: {
                parameters: [
                  {
                    $ref: '#/parameters/ids',
                  },
                ],
              },
              post: {
                parameters: [
                  {
                    $ref: '#/parameters/email',
                  },
                ],
              },
            },
          },
          parameters: {
            ids: {
              in: 'formData',
              name: 'ids',
              type: 'array',
              items: {
                type: 'number',
              },
              required: true,
              maxItems: 10,
              minItems: 1,
            },
            email: {
              in: 'body',
              name: 'email',
              required: true,
              schema: {
                format: 'e-mail',
              },
            },
          },
        },
      }),
    ).toStrictEqual({
      id: 'abc',
      name: 'no-title',
      version: '',
      extensions: {
        'x-stoplight': {
          id: 'abc',
        },
      },
      infoExtensions: {},
      operations: [
        {
          id: 'http_operation-abc-patch-/users/{}',
          method: 'patch',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-abc',
              name: 'email',
              contents: [
                {
                  id: 'http_media-http_request_body-abc-application/json',
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    'x-stoplight': {
                      id: 'schema-http_media-http_request_body-abc-application/json-',
                    },
                    format: 'e-mail',
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
          responses: [],
          security: [],
          securityDeclarationType: 'inheritedFromService',
          servers: [],
          tags: [],
        },
        {
          id: 'http_operation-abc-put-/users/{}',
          method: 'put',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-http_operation-abc-put-/users/{}',
              contents: [],
            },
            cookie: [],
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          securityDeclarationType: 'inheritedFromService',
          servers: [],
          tags: [],
        },
        {
          id: 'http_operation-abc-post-/users/{}',
          method: 'post',
          path: '/users/{userId}',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-abc',
              name: 'email',
              contents: [],
              required: true,
            },
            cookie: [],
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [],
          securityDeclarationType: 'inheritedFromService',
          servers: [],
          tags: [],
        },
      ],
      webhooks: [],
      components: {
        callbacks: [],
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        unknownParameters: [],
        responses: [],
        requestBodies: [],
        schemas: [],
        securitySchemes: [],
      },
    });
  });

  it.each(fs.readdirSync(path.join(__dirname, './__fixtures__')))(
    'given %s, should generate valid output',
    async name => {
      const document = JSON.parse(
        await fs.promises.readFile(path.join(__dirname, './__fixtures__', name, 'input.json'), 'utf8'),
      );
      const { default: output } = await import(`./__fixtures__/${name}/bundled`);

      expect(bundleOas2Service({ document })).toEqual(output);
    },
  );

  it('should maintain x-extensions', () => {
    expect(
      bundleOas2Service({
        document: {
          'x-stoplight': {
            id: 'abc',
          },
          'x-service-extension': {
            hello: 'world',
          },
          swagger: '2.0',
          paths: {
            '/users/{userId}': {
              patch: {
                consumes: ['application/json'],
                'x-operation-extension': {
                  hello: 'world',
                },
                security: [{ 'api-key': [] }],
              },
            },
          },
          tags: [
            {
              name: 'service-tag-extension',
              'x-service-tag-extension': {
                hello: 'world',
              },
            },
          ],
          securityDefinitions: {
            'api-key': {
              name: 'API Key',
              type: 'apiKey',
              in: 'query',
              'x-security-extension': {
                hello: 'world',
              },
            },
          },
          security: [{ 'api-key': [] }],
        },
      }),
    ).toStrictEqual({
      id: 'abc',
      name: 'no-title',
      version: '',
      extensions: {
        'x-stoplight': {
          id: 'abc',
        },
        'x-service-extension': {
          hello: 'world',
        },
      },
      infoExtensions: {},
      operations: [
        {
          id: 'http_operation-abc-patch-/users/{}',
          method: 'patch',
          path: '/users/{userId}',
          extensions: {
            'x-operation-extension': {
              hello: 'world',
            },
          },
          request: {
            cookie: [],
            headers: [],
            path: [],
            query: [],
          },
          responses: [],
          security: [
            [
              {
                extensions: {
                  'x-security-extension': {
                    hello: 'world',
                  },
                },
                id: 'http_security-abc-requirement-api-key-0-',
                in: 'query',
                key: 'api-key',
                name: 'API Key',
                type: 'apiKey',
              },
            ],
          ],
          securityDeclarationType: 'declared',
          servers: [],
          tags: [],
        },
      ],
      webhooks: [],
      components: {
        callbacks: [],
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        unknownParameters: [],
        responses: [],
        requestBodies: [],
        schemas: [],
        securitySchemes: [
          {
            extensions: {
              'x-security-extension': {
                hello: 'world',
              },
            },
            id: 'http_security-abc-scheme-api-key',
            in: 'query',
            key: 'api-key',
            name: 'API Key',
            type: 'apiKey',
          },
        ],
      },
      tags: [
        {
          id: 'tag-service-tag-extension',
          name: 'service-tag-extension',
          extensions: {
            'x-service-tag-extension': {
              hello: 'world',
            },
          },
        },
      ],
      security: [
        [
          {
            extensions: {
              'x-security-extension': {
                hello: 'world',
              },
            },
            id: 'http_security-abc-scheme-api-key',
            in: 'query',
            key: 'api-key',
            name: 'API Key',
            type: 'apiKey',
          },
        ],
      ],
    });
  });

  it('should not drop operation response if it has an external reference', () => {
    const res = bundleOas2Service({
      document: {
        swagger: '2.0',
        info: {
          title: 'info title',
          description: 'info description',
        },
        host: 'host.com',
        basePath: '/',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json'],
        paths: {
          '/path_refToComponents': {
            post: {
              operationId: 'path_refToComponents',
              responses: {
                '200': {
                  $ref: '#/responses/SharedResponse1',
                },
              },
            },
          },
        },
        responses: {
          SharedResponse1: {
            $ref: 'target.yaml#/responses/SharedResponse1',
            code: 'SharedResponse1',
          },
        },
      },
    });

    expect(res.operations[0].responses).toHaveLength(1);
    expect(res.operations[0].responses).toEqual(
      expect.arrayContaining([
        {
          $ref: '#/responses/SharedResponse1',
          code: '200',
        },
      ]),
    );
  });
});

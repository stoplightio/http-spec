import * as fs from 'fs';
import { isReferenceObject } from 'openapi3-ts';
import * as path from 'path';

import { setSkipHashing } from '../../hash';
import { bundleOas3Service } from '../service';

setSkipHashing(true);

describe('bundleOas3Service', () => {
  it('should handle $ref parameter followed by parameter that has same name as shared component', () => {
    const res = bundleOas3Service({
      document: {
        'x-stoplight': {
          id: 'service_id',
        },
        paths: {
          '/repos': {
            get: {
              parameters: [
                // This is the key bit - a $ref'd params before the inline sort param below
                {
                  $ref: '../shared-openapi.json#/components/parameters/per_page',
                },
                {
                  $ref: '#/components/parameters/org',
                },
                {
                  name: 'sort',
                  in: 'query',
                  description: 'The sort parameter defined directly in the list repos operation.',
                  required: false,
                  schema: {
                    type: 'string',
                  },
                },
              ],
            },
          },
        },
        components: {
          parameters: {
            org: {
              name: 'org',
              in: 'header',
              required: true,
              schema: {
                type: 'string',
              },
            },
            sort: {
              // A shared query param with the same name as the inline one defined in the operation
              // The resulting bundled http service should treat these as two separate query params (one inline, one shared), each with their own unique ids
              name: 'sort',
              description: 'The sort parameter from shared components.',
              in: 'query',
              required: false,
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    });

    expect(res).toStrictEqual({
      id: 'service_id',
      version: '',
      name: 'no-title',
      operations: [
        {
          id: 'http_operation-service_id-get-/repos',
          method: 'get',
          path: '/repos',
          tags: [],
          extensions: {},
          responses: [],
          request: {
            headers: [
              {
                $ref: '#/components/header/0',
              },
            ],
            query: [
              {
                id: 'http_query-http_operation-service_id-get-/repos-sort',
                name: 'sort',
                style: 'form',
                examples: [],
                description: 'The sort parameter defined directly in the list repos operation.',
                required: false,
                schema: {
                  type: 'string',
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  'x-stoplight': {
                    id: 'schema-http_query-http_operation-service_id-get-/repos-sort-',
                  },
                },
                explicitProperties: expect.arrayContaining(['name', 'in', 'required', 'schema']),
              },
            ],
            cookie: [],
            path: [],
            unknown: [
              {
                $ref: '../shared-openapi.json#/components/parameters/per_page',
              },
            ],
          },
          security: [],
          securityDeclarationType: 'inheritedFromService',
          servers: [],
        },
      ],
      components: {
        callbacks: [],
        responses: [],
        schemas: [],
        requestBodies: [],
        examples: [],
        securitySchemes: [],
        unknownParameters: [],
        header: [
          {
            id: 'http_header-service_id-parameter-org',
            name: 'org',
            style: 'simple',
            examples: [],
            required: true,
            schema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-http_header-service_id-parameter-org-',
              },
            },
            key: 'org',
            explicitProperties: expect.arrayContaining(['name', 'in', 'required', 'schema']),
          },
        ],
        query: [
          {
            id: 'http_query-service_id-sort',
            name: 'sort',
            style: 'form',
            examples: [],
            description: 'The sort parameter from shared components.',
            required: false,
            schema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-http_query-service_id-sort-',
              },
            },
            key: 'sort',
            explicitProperties: expect.arrayContaining(['name', 'description', 'in', 'required', 'schema']),
          },
        ],
        cookie: [],
        path: [],
      },
      extensions: {
        'x-stoplight': {
          id: 'service_id',
        },
      },
    });
  });

  it('should rewrite $refs in shared components', () => {
    expect(
      bundleOas3Service({
        document: {
          components: {
            schemas: {
              Editor: {
                summary: 'Editor',
                $ref: '#/components/schemas/User',
              },
              User: {
                title: 'User',
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                  },
                  address: {
                    $ref: '#/components/schemas/Address',
                  },
                },
                required: ['id'],
              },
              Address: {
                title: 'Address',
                type: 'object',
                properties: {
                  street: {
                    type: 'string',
                  },
                },
              },
              Error: {
                title: 'Error',
                type: 'object',
                properties: {
                  code: {
                    type: 'number',
                  },
                  msg: {
                    type: 'string',
                  },
                },
                required: ['code', 'msg'],
              },
            },
            responses: {
              CustomNotFoundError: {
                $ref: '#/components/responses/NotFoundError',
              },
              NotFoundError: {
                $ref: '#/components/responses/Error',
              },
              Error: {
                description: 'A generic error response.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          $ref: '#/components/schemas/Error',
                        },
                      },
                    },
                  },
                },
              },
              ForbiddenError: {
                $ref: '#/components/responses/Error',
                description: 'Forbidden Error',
              },
            },
            parameters: {
              'X-Rate-Limit': {
                $ref: '#/components/parameters/Some-Header',
              },
              'X-Rate-Limit2': {
                $ref: '#/components/parameters/X-Rate-Limit',
              },
              'Some-Header': {
                name: 'A-Shared-Header',
                in: 'header',
                required: false,
                schema: {
                  type: 'string',
                },
              },
            },
          },
        },
      }),
    ).toStrictEqual({
      components: {
        callbacks: [],
        cookie: [],
        examples: [],
        header: [
          {
            examples: [],
            id: 'http_header-undefined-parameter-Some-Header',
            key: 'Some-Header',
            name: 'A-Shared-Header',
            required: false,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'string',
              'x-stoplight': {
                id: 'schema-http_header-undefined-parameter-Some-Header-',
              },
            },
            style: 'simple',
            explicitProperties: expect.arrayContaining(['name', 'in', 'required', 'schema']),
          },
          {
            $ref: '#/components/header/0',
            key: 'X-Rate-Limit',
          },
          {
            $ref: '#/components/header/0',
            key: 'X-Rate-Limit2',
          },
        ],
        path: [],
        query: [],
        unknownParameters: [],
        requestBodies: [],
        responses: [
          {
            $ref: '#/components/responses/1',
            key: 'CustomNotFoundError',
          },
          {
            $ref: '#/components/responses/2',
            key: 'NotFoundError',
          },
          {
            code: 'Error',
            contents: [
              {
                id: 'http_media-http_response-undefined-Error-application/json',
                mediaType: 'application/json',
                encodings: [],
                examples: [],
                schema: {
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  properties: {
                    error: {
                      $ref: '#/components/schemas/3',
                    },
                  },
                  type: 'object',
                  'x-stoplight': {
                    id: 'schema-http_media-http_response-undefined-Error-application/json-',
                  },
                },
              },
            ],
            description: 'A generic error response.',
            headers: [],
            id: 'http_response-undefined-Error',
            key: 'Error',
          },
          {
            $ref: '#/components/responses/2',
            description: 'Forbidden Error',
            key: 'ForbiddenError',
          },
        ],
        schemas: [
          {
            $ref: '#/components/schemas/1',
            key: 'Editor',
            summary: 'Editor',
          },
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            key: 'User',
            properties: {
              address: {
                $ref: '#/components/schemas/2',
              },
              id: {
                type: 'integer',
              },
            },
            required: ['id'],
            title: 'User',
            type: 'object',
            'x-stoplight': {
              id: 'schema-undefined-User',
            },
          },
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            key: 'Address',
            properties: {
              street: {
                type: 'string',
              },
            },
            title: 'Address',
            type: 'object',
            'x-stoplight': {
              id: 'schema-undefined-Address',
            },
          },
          {
            $schema: 'http://json-schema.org/draft-07/schema#',
            key: 'Error',
            properties: {
              code: {
                type: 'number',
              },
              msg: {
                type: 'string',
              },
            },
            required: ['code', 'msg'],
            title: 'Error',
            type: 'object',
            'x-stoplight': {
              id: 'schema-undefined-Error',
            },
          },
        ],
        securitySchemes: [],
      },
      id: 'undefined',
      name: 'no-title',
      operations: [],
      version: '',
      extensions: {},
    });
  });

  it('should keep unresolvable $refs', () => {
    expect(
      bundleOas3Service({
        document: {
          components: {
            schemas: {
              Editor: {
                summary: 'Editor',
                $ref: 'https://stoplight.io#/components/schemas/User',
              },
              User: {
                title: 'User',
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                  },
                  address: {
                    $ref: '#/components/schemas/Address',
                  },
                },
                required: ['id'],
              },
            },
            responses: {
              NotFoundError: {
                $ref: '#/components/responses/GenericError',
              },
              Error: {
                description: 'A generic error response.',
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        error: {
                          $ref: '#/components/schemas/Error',
                        },
                      },
                    },
                  },
                },
              },
              ForbiddenError: {
                $ref: '#/components/responses/Error',
                description: 'Forbidden Error',
              },
            },
          },
        },
      }),
    ).toStrictEqual({
      id: 'undefined',
      name: 'no-title',
      operations: [],
      version: '',
      extensions: {},
      components: {
        callbacks: [],
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        unknownParameters: [],
        requestBodies: [],
        responses: [
          {
            $ref: '#/components/responses/GenericError',
            key: 'NotFoundError',
          },
          {
            code: 'Error',
            contents: [
              {
                id: 'http_media-http_response-undefined-Error-application/json',
                mediaType: 'application/json',
                encodings: [],
                examples: [],
                schema: {
                  'x-stoplight': {
                    id: 'schema-http_media-http_response-undefined-Error-application/json-',
                  },
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  properties: {
                    error: {
                      $ref: '#/components/schemas/Error',
                    },
                  },
                  type: 'object',
                },
              },
            ],
            description: 'A generic error response.',
            headers: [],
            id: 'http_response-undefined-Error',
            key: 'Error',
          },
          {
            $ref: '#/components/responses/1',
            description: 'Forbidden Error',
            key: 'ForbiddenError',
          },
        ],
        schemas: [
          {
            $ref: 'https://stoplight.io#/components/schemas/User',
            key: 'Editor',
            summary: 'Editor',
          },
          {
            'x-stoplight': {
              id: 'schema-undefined-User',
            },
            $schema: 'http://json-schema.org/draft-07/schema#',
            key: 'User',
            properties: {
              address: {
                $ref: '#/components/schemas/Address',
              },
              id: {
                type: 'integer',
              },
            },
            required: ['id'],
            title: 'User',
            type: 'object',
          },
        ],
        securitySchemes: [],
      },
    });
  });

  it('should treat external $refs as resolved', () => {
    expect(
      bundleOas3Service({
        document: {
          openapi: '3.1.0',
          paths: {
            '/todo': {
              post: {
                requestBody: {
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/RequestBody',
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/Request',
                        },
                      },
                    },
                  },
                  '201': {
                    content: {
                      'application/json': {
                        schema: {
                          $ref: '#/components/schemas/Response',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          components: {
            schemas: {
              Request: {
                $ref: './schemas/request.yaml',
              },
              Response: {
                $ref: './schemas/response.yaml',
              },
              RequestBody: {
                $ref: '#/components/schemas/Request',
              },
            },
          },
        },
      }),
    ).toStrictEqual({
      id: 'undefined',
      name: 'no-title',
      version: '',
      extensions: {},
      components: {
        callbacks: [],
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        unknownParameters: [],
        requestBodies: [],
        responses: [],
        schemas: [
          {
            $ref: './schemas/request.yaml',
            key: 'Request',
          },
          {
            $ref: './schemas/response.yaml',
            key: 'Response',
          },
          {
            $ref: '#/components/schemas/0',
            key: 'RequestBody',
          },
        ],
        securitySchemes: [],
      },
      operations: [
        {
          id: 'http_operation-undefined-post-/todo',
          method: 'post',
          path: '/todo',
          extensions: {},
          request: {
            body: {
              id: 'http_request_body-http_operation-undefined-post-/todo',
              contents: [
                {
                  id: 'http_media-http_request_body-http_operation-undefined-post-/todo-application/json',
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $ref: '#/components/schemas/2',
                    'x-stoplight': {
                      id: 'schema-http_operation-undefined-post-/todo-',
                    },
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
              id: 'http_response-http_operation-undefined-post-/todo-200',
              code: '200',
              contents: [
                {
                  id: 'http_media-http_response-http_operation-undefined-post-/todo-200-application/json',
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $ref: '#/components/schemas/0',
                    'x-stoplight': {
                      id: 'schema-http_operation-undefined-post-/todo-',
                    },
                  },
                },
              ],
              headers: [],
            },
            {
              id: 'http_response-http_operation-undefined-post-/todo-201',
              code: '201',
              contents: [
                {
                  id: 'http_media-http_response-http_operation-undefined-post-/todo-201-application/json',
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $ref: '#/components/schemas/1',
                    'x-stoplight': {
                      id: 'schema-http_operation-undefined-post-/todo-',
                    },
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
        },
      ],
    });
  });

  it('should put ref params that cannot be resolved into unknown bucket', () => {
    expect(
      bundleOas3Service({
        document: {
          openapi: '3.1.0',
          paths: {
            '/todos/{todoId}': {
              parameters: [
                {
                  $ref: '../common/openapi.json#/components/parameters/userIdPathParameter',
                },
              ],
              get: {},
            },
          },
        },
      }),
    ).toStrictEqual({
      id: 'undefined',
      name: 'no-title',
      version: '',
      extensions: {},
      components: {
        callbacks: [],
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        unknownParameters: [],
        responses: [],
        schemas: [],
        securitySchemes: [],
        requestBodies: [],
      },
      operations: [
        {
          id: 'http_operation-undefined-get-/todos/{}',
          method: 'get',
          path: '/todos/{todoId}',
          extensions: {},
          request: {
            cookie: [],
            headers: [],
            path: [],
            query: [],
            unknown: [
              {
                $ref: '../common/openapi.json#/components/parameters/userIdPathParameter',
              },
            ],
          },
          responses: [],
          security: [],
          securityDeclarationType: 'inheritedFromService',
          servers: [],
          tags: [],
        },
      ],
    });
  });

  it.each(fs.readdirSync(path.join(__dirname, './__fixtures__')))(
    'given %s, should generate valid output',
    async name => {
      const document = JSON.parse(
        await fs.promises.readFile(path.join(__dirname, './__fixtures__', name, 'input.json'), 'utf8'),
      );
      const { default: output } = await import(`./__fixtures__/${name}/bundled`);

      expect(bundleOas3Service({ document })).toEqual(output);
    },
  );

  it('should maintain x-extensions', () => {
    expect(
      bundleOas3Service({
        document: {
          'x-stoplight': {
            id: 'abc',
          },
          'x-service-extension': {
            hello: 'world',
          },
          openapi: '3.0',
          paths: {
            '/users/{userId}': {
              patch: {
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
          components: {
            securitySchemes: {
              'api-key': {
                name: 'API Key',
                type: 'apiKey',
                in: 'query',
                'x-security-extension': { hello: 'world' },
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
      security: [
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
      tags: [
        {
          id: 'tag-service-tag-extension',
          name: 'service-tag-extension',
          'x-service-tag-extension': {
            hello: 'world',
          },
        },
      ],
    });
  });

  it('should handle parameter and header components with same key', () => {
    const res = bundleOas3Service({
      document: {
        openapi: '3.1.0',
        servers: [
          {
            url: 'https://server.url',
          },
        ],
        info: {
          license: {
            name: 'Info license name',
            url: 'https://lisence.com',
          },
          contact: {
            email: 'info@contact.email',
            name: 'Info contact name',
            url: 'https://info.contact/url',
          },
          description: 'Info description',
          title: 'Info title',
          version: '0.0.1',
        },
        tags: [
          {
            name: 'tag1',
            description: 'tag1 description',
          },
        ],
        paths: {
          '/path1': {
            get: {
              operationId: 'getPath1',
              description: 'getPath1 description',
              tags: ['tag1'],
              parameters: [
                {
                  $ref: '#/components/parameters/duplicateNamedComponent',
                },
              ],
              responses: {
                '200': {
                  description: 'getPath1 200 response description',
                  headers: {
                    path1ResponseHeader: {
                      $ref: '#/components/headers/duplicateNamedComponent',
                    },
                  },
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          parameters: {
            duplicateNamedComponent: {
              name: 'duplicateNamedComponentParameter',
              description: 'parameter description',
              style: 'simple',
              in: 'header',
              schema: {
                type: 'string',
              },
            },
          },
          headers: {
            duplicateNamedComponent: {
              schema: {
                type: 'string',
              },
            },
          },
        },
      },
    });
    expect(res.components.header).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'http_header-undefined-header-duplicateNamedComponent' }),
        expect.objectContaining({ id: 'http_header-undefined-parameter-duplicateNamedComponent' }),
      ]),
    );
  });

  describe('should retain external references to', () => {
    it('response', () => {
      const res = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/path_refToComponents': {
              post: {
                operationId: 'create_path_refToComponents',
                responses: {
                  '200': {
                    $ref: '#/components/responses/SharedResponse1',
                  },
                },
              },
            },
          },
          components: {
            responses: {
              SharedResponse1: {
                $ref: 'target.yaml#/components/responses/SharedResponse1',
              },
            },
          },
        },
      });

      expect(res.operations[0].responses).toHaveLength(1);
      expect(res.operations[0].responses).toEqual(
        expect.arrayContaining([
          {
            $ref: '#/components/responses/SharedResponse1',
            code: '200',
          },
        ]),
      );
    });

    it('example', () => {
      const res = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/path_refToComponents': {
              post: {
                operationId: 'create_path_refToComponents',
                responses: {
                  '200': {
                    content: {
                      'application/json': {
                        type: 'object',
                        examples: {
                          firstExample: { $ref: '#/components/examples/SharedExample1' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          components: {
            examples: {
              SharedExample1: {
                $ref: 'target.yaml#/components/examples/SharedExample1',
              },
            },
          },
        },
      });

      const response = res.operations[0].responses[0];
      if (isReferenceObject(response)) fail('should be a response');

      expect(response.contents?.[0].examples).toStrictEqual([
        {
          key: 'firstExample',
          $ref: '#/components/examples/SharedExample1',
        },
      ]);
    });

    it('request body', () => {
      const res = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/': {
              post: {
                id: 'the-operation',
                requestBody: {
                  $ref: '#/components/requestBodies/SharedRequestBodies1',
                },
              },
            },
          },
          components: {
            requestBodies: {
              SharedRequestBodies1: {
                $ref: 'target.yaml#/components/requestBodies/SharedRequestBody1',
              },
            },
          },
        },
      });

      const request = res.operations[0].request;
      if (isReferenceObject(request) || !request) fail('should be a request');
      expect(request?.body).toEqual({
        $ref: '#/components/requestBodies/SharedRequestBodies1',
      });
    });

    it('request header', () => {
      // Arrange and Act
      const actual = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/': {
              parameters: [{ $ref: '#/components/headers/SharedHeader1' }],
              post: {
                operationId: 'create_path_refToComponents',
                responses: {
                  '200': {},
                },
              },
            },
          },
          components: {
            headers: {
              SharedHeader1: {
                description: 'an integer-valued request header',
                schema: {
                  type: 'integer',
                },
              },
            },
          },
        },
      });

      // Assert
      const request = actual.operations[0]?.request;
      if (isReferenceObject(request) || !request) fail('should be a header');
      expect(request.headers?.[0]).toEqual({
        $ref: '#/components/header/0',
      });
    });

    it('response header', () => {
      // Arrange and Act
      const actual = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/': {
              post: {
                operationId: 'the_operation_id',
                responses: {
                  '200': {
                    headers: {
                      RefToComponentHeader: {
                        $ref: '#/components/headers/SharedHeader1',
                      },
                    },
                  },
                },
              },
            },
          },
          components: {
            headers: {
              SharedHeader1: {
                $ref: 'target.yaml#/components/headers/SharedHeader2',
              },
            },
          },
        },
      });

      // Assert
      const response = actual.operations[0]?.responses[0];
      if (!response || isReferenceObject(response)) fail('should be a header');
      expect(response.headers?.[0]).toEqual({
        name: 'RefToComponentHeader',
        $ref: '#/components/headers/SharedHeader1',
      });
    });

    it('operation-level parameter', () => {
      const res = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/': {
              get: {
                operationId: 'the_op_id',
                parameters: [
                  {
                    $ref: '#/components/parameters/Shared1',
                  },
                ],
                responses: { '200': {} },
              },
            },
          },
          components: {
            parameters: {
              Shared1: {
                $ref: 'target.yaml#/components/parameters/Shared2',
              },
            },
          },
        },
      });

      const request = res.operations[0].request;
      if (!request || isReferenceObject(request)) fail('should be a response');
      expect(request.unknown).toStrictEqual([
        {
          $ref: '#/components/unknownParameters/0',
        },
      ]);

      expect(res.components.unknownParameters).toStrictEqual([
        {
          $ref: 'target.yaml#/components/parameters/Shared2',
          key: 'Shared1',
        },
      ]);
    });

    it('path-level parameter', () => {
      const res = bundleOas3Service({
        document: {
          openapi: '3.0.0',
          paths: {
            '/': {
              parameters: [
                {
                  $ref: '#/components/parameters/Shared1',
                },
              ],
              get: {
                operationId: 'the_op_id',
                responses: { '200': {} },
              },
            },
          },
          components: {
            parameters: {
              Shared1: {
                $ref: 'target.yaml#/components/parameters/Shared2',
              },
            },
          },
        },
      });

      const request = res.operations[0].request;
      if (!request || isReferenceObject(request)) fail('should be a response');
      expect(request.unknown).toStrictEqual([
        {
          $ref: '#/components/unknownParameters/0',
        },
      ]);

      expect(res.components.unknownParameters).toStrictEqual([
        {
          $ref: 'target.yaml#/components/parameters/Shared2',
          key: 'Shared1',
        },
      ]);
    });
  });

  it('when an operation-level param ref points outside the http-spec document', () => {
    const res = bundleOas3Service({
      document: {
        openapi: '3.0.0',
        paths: {
          '/': {
            get: {
              operationId: 'the_op_id',
              responses: { '200': {} },
              parameters: [
                {
                  // BUG: This parameter is missing from the http-spec document
                  $ref: 'otherFile.yaml#/components/parameters/Shared1',
                },
              ],
            },
          },
        },
      },
    });

    const request = res.operations[0].request;
    if (!request || isReferenceObject(request)) fail('should be a response');
    expect(request.unknown).toStrictEqual([
      {
        $ref: 'otherFile.yaml#/components/parameters/Shared1',
      },
    ]);
  });
});

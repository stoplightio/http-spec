import * as fs from 'fs';
import * as path from 'path';

import { bundleOas3Service } from '../service';

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
                // This is the key bit - a $ref'd param before the inline sort param below
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
          id: 'ca842400ceb89',
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
                id: '2b96b0c068f0b',
                name: 'sort',
                style: 'form',
                examples: [],
                description: 'The sort parameter defined directly in the list repos operation.',
                required: false,
                schema: {
                  type: 'string',
                  $schema: 'http://json-schema.org/draft-07/schema#',
                  'x-stoplight': {
                    id: '402ee5eeb3cfe',
                  },
                },
              },
            ],
            cookie: [],
            path: [],
          },
          security: [],
          servers: [],
        },
      ],
      components: {
        responses: [],
        schemas: [],
        requestBodies: [],
        examples: [],
        securitySchemes: [],
        header: [
          {
            id: '54efded787c69',
            name: 'org',
            style: 'simple',
            examples: [],
            required: true,
            schema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: '32e99f6029601',
              },
            },
            key: 'org',
          },
        ],
        query: [
          {
            id: 'd86f92e6ebf08',
            name: 'sort',
            style: 'form',
            examples: [],
            description: 'The sort parameter from shared components.',
            required: false,
            schema: {
              type: 'string',
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: '73649f70399f2',
              },
            },
            key: 'sort',
          },
        ],
        cookie: [],
        path: [],
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
        cookie: [],
        examples: [],
        header: [
          {
            examples: [],
            id: '8bb895b336918',
            key: 'Some-Header',
            name: 'A-Shared-Header',
            required: false,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'string',
              'x-stoplight': {
                id: '0f99c3bfafaac',
              },
            },
            style: 'simple',
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
                id: '9b52b936650e1',
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
                    id: '42ac2d350285a',
                  },
                },
              },
            ],
            description: 'A generic error response.',
            headers: [],
            id: 'cb9db02eed34a',
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
              id: '64592aa729862',
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
              id: '4e6bf245b910e',
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
              id: 'cf45f959c561b',
            },
          },
        ],
        securitySchemes: [],
      },
      id: 'undefined',
      name: 'no-title',
      operations: [],
      version: '',
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
      components: {
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
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
                id: '9b52b936650e1',
                mediaType: 'application/json',
                encodings: [],
                examples: [],
                schema: {
                  'x-stoplight': {
                    id: '42ac2d350285a',
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
            id: 'cb9db02eed34a',
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
              id: '64592aa729862',
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
      components: {
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
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
          id: '76b4ee6eadc90',
          method: 'post',
          path: '/todo',
          extensions: {},
          request: {
            body: {
              id: '9c150f23174d8',
              contents: [
                {
                  id: 'a7f2c8456c37f',
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $ref: '#/components/schemas/2',
                    'x-stoplight': {
                      id: 'c25f41d54d86a',
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
              id: '6a74b99c6956b',
              code: '200',
              contents: [
                {
                  id: 'a84c6be0c4ac3',
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $ref: '#/components/schemas/0',
                    'x-stoplight': {
                      id: 'c25f41d54d86a',
                    },
                  },
                },
              ],
              headers: [],
            },
            {
              id: '6a84b99c69b38',
              code: '201',
              contents: [
                {
                  id: '01161cd990e25',
                  encodings: [],
                  examples: [],
                  mediaType: 'application/json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    $ref: '#/components/schemas/1',
                    'x-stoplight': {
                      id: 'c25f41d54d86a',
                    },
                  },
                },
              ],
              headers: [],
            },
          ],
          security: [],
          servers: [],
          tags: [],
        },
      ],
    });
  });

  it('should somehow handle parmas', () => {
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
      components: {
        cookie: [],
        examples: [],
        header: [],
        path: [],
        query: [],
        responses: [],
        schemas: [],
        securitySchemes: [],
        requestBodies: [],
      },
      operations: [
        {
          id: 'a26b653a5e5ba',
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
});

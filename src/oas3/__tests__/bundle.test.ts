import { bundleOas3Service } from '../service';

test('works', () => {
  expect(
    bundleOas3Service({
      document: {
        openapi: '3.1.0',
        'x-stoplight': {
          id: 'service_abc',
        },
        info: {
          title: 'Users API',
          version: '1.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
          },
        ],
        tags: [
          {
            name: 'mutates',
          },
        ],
        paths: {
          '/users/{userId}': {
            parameters: [
              {
                schema: {
                  type: 'integer',
                },
                name: 'userId',
                in: 'path',
                required: true,
                description: 'Id of an existing user.',
              },
              {
                $ref: '#/components/parameters/Some-Header',
              },
            ],
            get: {
              operationId: 'get-user',
              summary: 'Get User Info by User ID',
              description: 'Retrieve the information of the user with the matching user ID.',
              tags: ['tag-without-root-def'],
              parameters: [
                {
                  schema: {
                    type: 'boolean',
                  },
                  in: 'query',
                  name: 'summaryOnly',
                },
              ],
              responses: {
                '200': {
                  description: 'User Found',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                    'application/xml': {
                      schema: {
                        type: 'string',
                      },
                    },
                  },
                },
                '404': {
                  $ref: '#/components/responses/ErrorResponse',
                },
              },
            },
            post: {
              operationId: 'post-users-userId',
              summary: 'Create user',
              tags: ['mutates'],
              parameters: [
                {
                  schema: {
                    type: 'integer',
                  },
                  name: 'Post-Specific-Header',
                  in: 'header',
                },
              ],
              security: [
                {
                  'api-key': [],
                },
              ],
              requestBody: {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                    examples: {
                      'basic-example': {
                        $ref: '#/components/examples/A-Shared-Example',
                      },
                    },
                  },
                },
              },
              responses: {
                '201': {
                  description: 'User Created',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
                '400': {
                  $ref: '#/components/responses/ErrorResponse',
                },
              },
            },
          },
        },
        components: {
          schemas: {
            User: {
              title: 'User',
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  readOnly: true,
                },
                address: {
                  $ref: '#/components/schemas/Address',
                },
              },
              required: ['id'],
              examples: [],
            },
            Address: {
              title: 'Address',
              type: 'object',
              properties: {
                street: {
                  type: 'string',
                },
              },
              examples: [
                {
                  street: '422 W Riverside Drive',
                },
              ],
            },
            UserId: {
              type: 'number',
              title: 'UserId',
              minimum: 0,
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
          parameters: {
            'Some-Header': {
              name: 'A-Shared-Header',
              in: 'header',
              required: false,
              schema: {
                type: 'string',
              },
            },
          },
          examples: {
            'A-Shared-Example': {
              value: {
                id: 0,
                address: {
                  street: 'string',
                },
              },
            },
          },
          securitySchemes: {
            'api-key': {
              name: 'API Key',
              type: 'apiKey',
              in: 'query',
            },
          },
          responses: {
            ErrorResponse: {
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
          },
        },
      },
    }),
  ).toMatchSnapshot();
});

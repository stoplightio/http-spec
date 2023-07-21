export default {
  id: 'service_abc',
  name: 'Users API',
  version: '1.0',
  servers: [
    {
      id: 'http_server-service_abc-http://localhost:3000',
      name: 'Users API',
      url: 'http://localhost:3000',
    },
  ],
  tags: [
    {
      // hash('tag-mutates')
      id: 'tag-mutates',
      name: 'mutates',
    },
  ],
  components: {
    callbacks: [],
    cookie: [],
    examples: [
      {
        // hash('example-service_abc-A-Shared-Example')
        id: 'example-service_abc-A-Shared-Example',
        key: 'A-Shared-Example',
        value: {
          address: {
            street: 'string',
          },
          id: 0,
        },
      },
    ],
    header: [
      {
        // hash('http_header-service_abc-Some-Header')
        id: 'http_header-service_abc-parameter-Some-Header',
        key: 'Some-Header',
        name: 'A-Shared-Header',
        style: 'simple',
        required: false,
        examples: [],
        schema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
          'x-stoplight': {
            // hash('schema-http_header-service_abc-Some-Header')
            id: 'schema-http_header-service_abc-parameter-Some-Header-',
          },
        },
        explicitProperties: expect.arrayContaining(['name', 'in', 'required', 'schema']),
      },
    ],
    path: [],
    query: [],
    requestBodies: [],
    responses: [
      {
        // hash('http_response-service_abc-ErrorResponse')
        id: 'http_response-service_abc-ErrorResponse',
        key: 'ErrorResponse',
        code: 'ErrorResponse',
        contents: [
          {
            // hash('http_media-{parentId}-application/json')
            // hash('http_media-http_response-service_abc-ErrorResponse-application/json')
            id: 'http_media-http_response-service_abc-ErrorResponse-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-http_media-http_response-service_abc-ErrorResponse-application/json-')
                id: 'schema-http_media-http_response-service_abc-ErrorResponse-application/json-',
              },
              type: 'object',
              properties: {
                error: {
                  $ref: '#/components/schemas/3',
                },
              },
            },
            encodings: [],
            examples: [],
          },
        ],
        description: 'A generic error response.',
        headers: [],
      },
    ],
    schemas: [
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        'x-stoplight': {
          id: 'schema-service_abc-User',
        },
        key: 'User',
        type: 'object',
        properties: {
          address: {
            $ref: '#/components/schemas/1',
          },
          id: {
            readOnly: true,
            type: 'integer',
          },
        },
        examples: [],
        required: ['id'],
        title: 'User',
      },
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        examples: [
          {
            street: '422 W Riverside Drive',
          },
        ],
        key: 'Address',
        properties: {
          street: {
            type: 'string',
          },
        },
        title: 'Address',
        type: 'object',
        'x-stoplight': {
          id: 'schema-service_abc-Address',
        },
      },
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        key: 'UserId',
        minimum: 0,
        title: 'UserId',
        type: 'number',
        'x-stoplight': {
          id: 'schema-service_abc-UserId',
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
          id: 'schema-service_abc-Error',
        },
      },
    ],
    securitySchemes: [
      {
        id: 'http_security-service_abc-api-key',
        in: 'query',
        key: 'api-key',
        name: 'API Key',
        type: 'apiKey',
        extensions: {},
      },
    ],
  },
  operations: [
    {
      description: 'Retrieve the information of the user with the matching user ID.',
      extensions: {},
      id: 'http_operation-service_abc-get-/users/{}',
      iid: 'get-user',
      method: 'get',
      path: '/users/{userId}',
      request: {
        cookie: [],
        headers: [
          {
            $ref: '#/components/header/0',
          },
        ],
        path: [
          {
            description: 'Id of an existing user.',
            examples: [],
            id: 'http_path_param-http_operation-service_abc-get-/users/{}-userId',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
              'x-stoplight': {
                id: 'schema-http_path_param-http_operation-service_abc-get-/users/{}-userId-',
              },
            },
            style: 'simple',
            explicitProperties: expect.arrayContaining(['name', 'in', 'required', 'schema', 'description']),
          },
        ],
        query: [
          {
            examples: [],
            id: 'http_query-http_operation-service_abc-get-/users/{}-summaryOnly',
            name: 'summaryOnly',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'boolean',
              'x-stoplight': {
                id: 'schema-http_query-http_operation-service_abc-get-/users/{}-summaryOnly-',
              },
            },
            style: 'form',
            explicitProperties: expect.arrayContaining(['name', 'in', 'schema']),
          },
        ],
      },
      responses: [
        {
          code: '200',
          contents: [
            {
              encodings: [],
              examples: [],
              id: 'http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/json',
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
            {
              encodings: [],
              examples: [],
              id: 'http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/xml',
              mediaType: 'application/xml',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'string',
                'x-stoplight': {
                  id: 'schema-http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/xml-',
                },
              },
            },
          ],
          description: 'User Found',
          headers: [],
          id: 'http_response-http_operation-service_abc-get-/users/{}-200',
        },
        {
          code: '404',
          $ref: '#/components/responses/0',
        },
      ],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [
        {
          id: 'http_server-service_abc-http://localhost:3000',
          name: 'Users API',
          url: 'http://localhost:3000',
        },
      ],
      summary: 'Get User Info by User ID',
      tags: [
        {
          id: 'tag-tag-without-root-def',
          name: 'tag-without-root-def',
        },
      ],
    },
    {
      extensions: {},
      id: 'http_operation-service_abc-post-/users/{}',
      iid: 'post-users-userId',
      method: 'post',
      path: '/users/{userId}',
      request: {
        body: {
          contents: [
            {
              encodings: [],
              examples: [
                {
                  key: 'basic-example',
                  $ref: '#/components/examples/0',
                },
              ],
              id: 'http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json',
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
          id: 'http_request_body-http_operation-service_abc-post-/users/{}',
        },
        cookie: [],
        headers: [
          {
            examples: [],
            id: 'http_header-http_operation-service_abc-post-/users/{}-parameter-Post-Specific-Header',
            name: 'Post-Specific-Header',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
              'x-stoplight': {
                id: 'schema-http_header-http_operation-service_abc-post-/users/{}-parameter-Post-Specific-Header-',
              },
            },
            style: 'simple',
            explicitProperties: expect.arrayContaining(['name', 'in', 'schema']),
          },
          {
            $ref: '#/components/header/0',
          },
        ],
        path: [
          {
            description: 'Id of an existing user.',
            examples: [],
            id: 'http_path_param-http_operation-service_abc-post-/users/{}-userId',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
              'x-stoplight': {
                id: 'schema-http_path_param-http_operation-service_abc-post-/users/{}-userId-',
              },
            },
            style: 'simple',
            explicitProperties: expect.arrayContaining(['name', 'in', 'required', 'schema', 'description']),
          },
        ],
        query: [],
      },
      responses: [
        {
          code: '201',
          contents: [
            {
              encodings: [],
              examples: [],
              id: 'http_media-http_response-http_operation-service_abc-post-/users/{}-201-application/json',
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
          description: 'User Created',
          headers: [],
          id: 'http_response-http_operation-service_abc-post-/users/{}-201',
        },
        {
          code: '400',
          $ref: '#/components/responses/0',
        },
      ],
      security: [
        [
          {
            id: 'http_security-service_abc-api-key',
            in: 'query',
            key: 'api-key',
            name: 'API Key',
            type: 'apiKey',
            extensions: {},
          },
        ],
      ],
      securityDeclarationType: 'declared',
      servers: [
        {
          id: 'http_server-service_abc-http://localhost:3000',
          name: 'Users API',
          url: 'http://localhost:3000',
        },
      ],
      summary: 'Create user',
      tags: [
        {
          // hash('tag-mutates')
          id: 'tag-mutates',
          name: 'mutates',
        },
      ],
    },
  ],
  extensions: {
    'x-stoplight': {
      id: 'service_abc',
    },
  },
};

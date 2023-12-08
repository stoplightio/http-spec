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
  extensions: {
    'x-stoplight': {
      id: 'service_abc',
    },
  },
  infoExtensions: {},
  components: {
    callbacks: [],
    cookie: [],
    examples: [],
    header: [
      {
        // hash('http_header-service_abc-Some-Header')
        id: 'http_header-service_abc-parameter-Some-Header',
        key: 'Some-Header',
        name: 'A-Shared-Header',
        style: 'simple',
        required: false,
        schema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
          'x-stoplight': {
            // hash('schema-http_header-service_abc-Some-Header')
            id: 'schema-http_header-service_abc-parameter-Some-Header-',
          },
        },
      },
    ],
    path: [],
    query: [],
    unknownParameters: [],
    requestBodies: [],
    responses: [
      {
        id: 'http_response-service_abc-ErrorResponse-application/x-stoplight-placeholder',
        key: 'ErrorResponse',
        code: 'ErrorResponse',
        contents: [
          {
            examples: [],
            id: 'http_media-http_response-service_abc-ErrorResponse-application/x-stoplight-placeholder-application/x-stoplight-placeholder',
            mediaType: 'application/x-stoplight-placeholder',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              properties: {
                error: {
                  $ref: '#/components/schemas/3',
                },
              },
              type: 'object',
              'x-stoplight': {
                id: 'schema-http_media-http_response-service_abc-ErrorResponse-application/x-stoplight-placeholder-application/x-stoplight-placeholder-',
              },
            },
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
        required: ['id'],
        title: 'User',
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
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        'x-stoplight': {
          id: 'icwajdhukp1rr',
        },
        key: 'Entity',
        title: 'Entity',
      },
    ],
    securitySchemes: [
      {
        id: 'http_security-service_abc-scheme-api-key',
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
      // hash('http_operation-service_abc-get-/users/{}')
      id: 'http_operation-service_abc-get-/users/{}',
      iid: 'get-user',
      method: 'get',
      path: '/users/{userId}',
      description: 'Retrieve the information of the user with the matching user ID.',
      extensions: {},
      request: {
        cookie: [],
        headers: [
          {
            $ref: '#/components/header/0',
          },
        ],
        path: [
          {
            // hash('http_path_param-{parentId}-{name}')
            // this one is placed under PATH, so its parentId is hash('http_path-service_abc-/users/{}') which equals 85d8dbab8a3d5
            // hash('http_path_param-85d8dbab8a3d5-userId')
            id: 'http_path_param-http_path-service_abc-/users/{}-userId',
            description: 'Id of an existing user.',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-{parentId}-')
                // hash('schema-http_path_param-http_path-service_abc-/users/{}-userId-')
                id: 'schema-http_path_param-http_path-service_abc-/users/{}-userId-',
              },
              type: 'integer',
            },
            style: 'simple',
          },
        ],
        query: [
          {
            // hash('http_query-parentId-summaryOnly')
            // hash('http_query-http_operation-service_abc-get-/users/{}-summaryOnly')
            id: 'http_query-http_operation-service_abc-get-/users/{}-summaryOnly',
            name: 'summaryOnly',
            style: 'unspecified',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-http_query-http_operation-service_abc-get-/users/{}-summaryOnly-',
              },
              type: 'boolean',
            },
          },
        ],
      },
      responses: [
        {
          // hash(`http_response-{parentId}-200-${produces.join('-')}`)
          // hash(`http_response-http_operation-service_abc-get-/users/{}-200-${produces.join('-')}`)
          id: 'http_response-http_operation-service_abc-get-/users/{}-200-application/json',
          code: '200',
          description: 'User Found',
          headers: [],
          contents: [
            {
              // hash(`http_media-${parentId}-${mediaType}`)
              // hash(`http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/json-application/json`)
              id: 'http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/json-application/json',
              examples: [],
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
        },
        {
          // hash(`http_response-service_abc-ErrorResponse-${produces.join('-')}`)
          id: 'http_response-service_abc-ErrorResponse-application/json',
          code: '404',
          description: 'A generic error response.',
          headers: [],
          contents: [
            {
              // hash('http_media-{parentId}-application/json')
              // hash('http_media-http_response-service_abc-ErrorResponse-application/json-application/json')
              id: 'http_media-http_response-service_abc-ErrorResponse-application/json-application/json',
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                // hash('schema-http_media-http_response-service_abc-ErrorResponse-application/json-application/json-')
                'x-stoplight': {
                  id: 'schema-http_media-http_response-service_abc-ErrorResponse-application/x-stoplight-placeholder-application/x-stoplight-placeholder-',
                },
                type: 'object',
                properties: {
                  error: {
                    $ref: '#/components/schemas/3',
                  },
                },
              },
              examples: [],
            },
          ],
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
      // hash('http_operation-service_abc-post-/users/{}')
      id: 'http_operation-service_abc-post-/users/{}',
      iid: 'post-users-userId',
      method: 'post',
      path: '/users/{userId}',
      extensions: {},
      request: {
        body: {
          // hash('http_request_body-{parentId}-{consumes.join('-')}')
          id: 'http_request_body-http_operation-service_abc-post-/users/{}',
          required: true,
          name: 'user',
          contents: [
            {
              // hash('http_media-{parentId}-{mediaType}')
              id: 'http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json',
              mediaType: 'application/json',
              examples: [],
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
        },
        cookie: [],
        headers: [
          {
            id: 'http_header-http_operation-service_abc-post-/users/{}-parameter-Post-Specific-Header',
            name: 'Post-Specific-Header',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-http_header-http_operation-service_abc-post-/users/{}-parameter-Post-Specific-Header-',
              },
              type: 'integer',
            },
            style: 'simple',
          },
          {
            $ref: '#/components/header/0',
          },
        ],
        path: [
          {
            // hash('http_path_param-{parentId}-{name}')
            // this one is placed under PATH, so its parentId is hash('http_path-service_abc-/users/{}') which equals 85d8dbab8a3d5
            // hash('http_path_param-85d8dbab8a3d5-userId')
            id: 'http_path_param-http_path-service_abc-/users/{}-userId',
            description: 'Id of an existing user.',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-http_path_param-http_path-service_abc-/users/{}-userId-',
              },
              type: 'integer',
            },
            style: 'simple',
          },
        ],
        query: [],
      },
      responses: [
        {
          // hash(`http_response-{parentId}-201-${produces.join('-')}`)
          // hash('http_response-http_operation-service_abc-post-/users/{}-201-application/json')
          id: 'http_response-http_operation-service_abc-post-/users/{}-201-application/json',
          code: '201',
          contents: [
            {
              // hash('http_media-{parentId}-{mediaType}')
              // hash('http_media-http_response-http_operation-service_abc-post-/users/{}-201-application/json-application/json')
              id: 'http_media-http_response-http_operation-service_abc-post-/users/{}-201-application/json-application/json',
              examples: [],
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
          description: 'User Created',
          headers: [],
        },
        {
          // hash(`http_response-service_abc-ErrorResponse-${produces.join('-')}`)
          id: 'http_response-service_abc-ErrorResponse-application/json',
          code: '400',
          description: 'A generic error response.',
          headers: [],
          contents: [
            {
              // hash('http_media-{parentId}-application/json')
              // hash('http_media-http_response-service_abc-ErrorResponse-application/json-application/json')
              id: 'http_media-http_response-service_abc-ErrorResponse-application/json-application/json',
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                // hash('schema-http_media-http_response-service_abc-ErrorResponse-application/json-application/json-')
                'x-stoplight': {
                  id: 'schema-http_media-http_response-service_abc-ErrorResponse-application/x-stoplight-placeholder-application/x-stoplight-placeholder-',
                },
                type: 'object',
                properties: {
                  error: {
                    $ref: '#/components/schemas/3',
                  },
                },
              },
              examples: [],
            },
          ],
        },
      ],
      security: [
        [
          {
            id: 'http_security-service_abc-requirement-api-key-0-',
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
  webhooks: [],
};

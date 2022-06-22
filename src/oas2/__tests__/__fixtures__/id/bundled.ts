export default {
  id: 'service_abc',
  name: 'Users API',
  version: '1.0',
  servers: [
    {
      id: '98ddf8a4b5bdc',
      name: 'Users API',
      url: 'http://localhost:3000',
    },
  ],
  tags: [
    {
      // hash('tag-mutates')
      id: '3d179d2f9363d',
      name: 'mutates',
    },
  ],
  components: {
    cookie: [],
    examples: [],
    header: [
      {
        // hash('http_header-service_abc-A-Shared-Header')
        id: '21b1f96bd26ee',
        key: 'Some-Header',
        name: 'A-Shared-Header',
        style: 'simple',
        required: false,
        schema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
          'x-stoplight': {
            // hash('schema-21b1f96bd26ee-')
            id: 'a9c9a05d9cb2d',
          },
        },
      },
    ],
    path: [],
    query: [],
    requestBodies: [],
    responses: [],
    schemas: [
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        'x-stoplight': {
          id: 'de4f083463b7c',
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
          id: '8b1562dcd786e',
        },
      },
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        key: 'UserId',
        minimum: 0,
        title: 'UserId',
        type: 'number',
        'x-stoplight': {
          id: 'a8978c71e4d00',
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
          id: 'da49423a5a9e7',
        },
      },
    ],
    securitySchemes: [
      {
        id: '202a905f9dff6',
        in: 'query',
        key: 'api-key',
        name: 'API Key',
        type: 'apiKey',
      },
    ],
  },
  operations: [
    {
      // hash('http_operation-service_abc-get-/users/{}')
      id: '96043a63b6901',
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
            id: 'fe171ec8cfd0b',
            description: 'Id of an existing user.',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-{parentId}-')
                // hash('schema-fe171ec8cfd0b-')
                id: '13ad531bed72e',
              },
              type: 'integer',
            },
            style: 'simple',
          },
        ],
        query: [
          {
            // hash('http_query-parentId-summaryOnly')
            // hash('http_query-96043a63b6901-summaryOnly')
            id: 'efe9534d001fc',
            name: 'summaryOnly',
            style: 'form',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'aca62504578bd',
              },
              type: 'boolean',
            },
          },
        ],
      },
      responses: [
        {
          // hash(`http_response-{parentId}-200-${produces.join('-')}`)
          // hash(`http_response-96043a63b6901-200-${produces.join('-')}`)
          id: '78ffe0f17b246',
          code: '200',
          description: 'User Found',
          headers: [],
          contents: [
            {
              // hash(`http_media-${parentId}-${mediaType}`)
              // hash(`http_media-78ffe0f17b246-application/json`)
              id: '106b4736afd3c',
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
          id: 'dc24f01b0f5bd',
          code: '404',
          description: 'A generic error response.',
          headers: [],
          contents: [
            {
              // hash('http_media-{parentId}-application/json')
              // hash('http_media-dc24f01b0f5bd-application/json')
              id: '15a9987a80e2c',
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                // hash('schema-15a9987a80e2c-')
                'x-stoplight': {
                  id: '06ee54ffb4236',
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
      servers: [
        {
          id: '98ddf8a4b5bdc',
          name: 'Users API',
          url: 'http://localhost:3000',
        },
      ],
      summary: 'Get User Info by User ID',
      tags: [
        {
          id: '1e29148da7966',
          name: 'tag-without-root-def',
        },
      ],
    },
    {
      // hash('http_operation-service_abc-post-/users/{}')
      id: 'b16a96d287951',
      iid: 'post-users-userId',
      method: 'post',
      path: '/users/{userId}',
      extensions: {},
      request: {
        body: {
          // hash('http_request_body-{parentId}-{consumes.join('-')}')
          // hash('http_request_body-b16a96d287951-application/json')
          id: 'dc29cc7417d84',
          required: true,
          contents: [
            {
              // hash('http_media-{parentId}-{mediaType}')
              // hash('http_media-dc29cc7417d84-application/json')
              id: '3abc90129b043',
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
            id: '1ead595922478',
            name: 'Post-Specific-Header',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'de5897f178a5d',
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
            id: 'fe171ec8cfd0b',
            description: 'Id of an existing user.',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: '13ad531bed72e',
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
          // hash('http_response-b16a96d287951-201-application/json')
          id: 'cd74179d497cc',
          code: '201',
          contents: [
            {
              // hash('http_media-{parentId}-{mediaType}')
              // hash('http_media-cd74179d497cc-application/json')
              id: '7ad7eaa03f1d8',
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
          id: 'dc24f01b0f5bd',
          code: '400',
          description: 'A generic error response.',
          headers: [],
          contents: [
            {
              // hash('http_media-{parentId}-application/json')
              // hash('http_media-dc24f01b0f5bd-application/json')
              id: '15a9987a80e2c',
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                // hash('schema-15a9987a80e2c-')
                'x-stoplight': {
                  id: '06ee54ffb4236',
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
            id: '202a905f9dff6',
            in: 'query',
            key: 'api-key',
            name: 'API Key',
            type: 'apiKey',
          },
        ],
      ],
      servers: [
        {
          id: '98ddf8a4b5bdc',
          name: 'Users API',
          url: 'http://localhost:3000',
        },
      ],
      summary: 'Create user',
      tags: [
        {
          // hash('tag-mutates')
          id: '3d179d2f9363d',
          name: 'mutates',
        },
      ],
    },
  ],
};

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
      // hash('tag-service-abc-mutates')
      id: '936737e88c6fa',
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
            id: 'be6b513de1b69',
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
            // hash('http_path_param-parentId-userId')
            // hash('http_path_param-96043a63b6901-userId')
            id: '12e4ecaea25e7',
            description: 'Id of an existing user.',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-parentId-')
                // hash('schema-12e4ecaea25e7-')
                id: '9ae1fe9558406',
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
              id: '48eeb3ee2a049',
              mediaType: 'application/json',
              examples: [],
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                'x-stoplight': {
                  id: '069dfbb6c6315',
                },
                type: 'object',
                properties: {
                  error: {
                    $ref: '#/components/schemas/3',
                  },
                },
              },
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
          id: '9862017e672e6',
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
          id: '07267ec331fc9',
          required: true,
          contents: [
            {
              id: '00db77c676e1a',
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
            $ref: '#/components/header/0',
          },
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
        ],
        path: [
          {
            // hash('http_path_param-b16a96d287951-userId')
            id: '6c9394a75ccec',
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
          // hash('http_response-{parentId}-201')
          // hash('http_response-b16a96d287951-201')
          id: 'd8ca38606ee5d',
          code: '201',
          contents: [
            {
              id: '88460a8f1a612',
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
          // hash('http_response-service_abc-ErrorResponse')
          id: '437771f63f179',
          code: '400',
          description: 'A generic error response.',
          headers: [],
          contents: [
            {
              // hash('http_media-{parentId}-application/json')
              // hash('http_media-service_abc-ErrorResponse')
              id: '4d98be34f341a',
              mediaType: 'application/json',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                'x-stoplight': {
                  id: 'c5b34ef4d54df',
                },
                properties: {
                  error: {
                    $ref: '#/components/schemas/3',
                  },
                },
                type: 'object',
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
          id: '936737e88c6fa',
          name: 'mutates',
        },
      ],
    },
  ],
};

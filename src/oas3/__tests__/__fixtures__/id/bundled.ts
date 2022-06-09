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
    examples: [
      {
        // hash('example-service_abc-A-Shared-Example')
        id: '5a69041e065b0',
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
        // hash('http_header-service_abc-A-Shared-Header')
        id: '21b1f96bd26ee',
        key: 'Some-Header',
        name: 'A-Shared-Header',
        style: 'simple',
        required: false,
        examples: [],
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
    responses: [
      {
        // hash('http_response-service_abc-ErrorResponse')
        id: '437771f63f179',
        key: 'ErrorResponse',
        code: 'ErrorResponse',
        contents: [
          {
            // hash('http_media-{parentId}-application/json')
            // hash('http_media-437771f63f179-application/json')
            id: '4d98be34f341a',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: '2691eb0db9efc',
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
      description: 'Retrieve the information of the user with the matching user ID.',
      extensions: {},
      id: '96043a63b6901',
      iid: 'get-user',
      method: 'get',
      path: '/users/{userId}',
      request: {
        body: {
          contents: [],
          id: 'd5027559477f8',
        },
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
            id: 'fe171ec8cfd0b',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
              'x-stoplight': {
                id: '13ad531bed72e',
              },
            },
            style: 'simple',
          },
        ],
        query: [
          {
            examples: [],
            id: 'efe9534d001fc',
            name: 'summaryOnly',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'boolean',
              'x-stoplight': {
                id: 'aca62504578bd',
              },
            },
            style: 'form',
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
              id: 'fce50f391bf57',
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
            {
              encodings: [],
              examples: [],
              id: '48eeb3ee2a049',
              mediaType: 'application/xml',
              schema: {
                $schema: 'http://json-schema.org/draft-07/schema#',
                type: 'string',
                'x-stoplight': {
                  id: '069dfbb6c6315',
                },
              },
            },
          ],
          description: 'User Found',
          headers: [],
          id: 'f387e16c7d39d',
        },
        {
          $ref: '#/components/responses/0',
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
      extensions: {},
      id: 'b16a96d287951',
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
                  $ref: '#/components/examples/0',
                },
              ],
              id: '00db77c676e1a',
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
          id: '07267ec331fc9',
        },
        cookie: [],
        headers: [
          {
            examples: [],
            id: '1ead595922478',
            name: 'Post-Specific-Header',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
              'x-stoplight': {
                id: 'de5897f178a5d',
              },
            },
            style: 'simple',
          },
          {
            $ref: '#/components/header/0',
          },
        ],
        path: [
          {
            description: 'Id of an existing user.',
            examples: [],
            id: 'fe171ec8cfd0b',
            name: 'userId',
            required: true,
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
              'x-stoplight': {
                id: '13ad531bed72e',
              },
            },
            style: 'simple',
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
              id: '88460a8f1a612',
              mediaType: 'application/json',
              schema: {
                $ref: '#/components/schemas/0',
              },
            },
          ],
          description: 'User Created',
          headers: [],
          id: 'd8ca38606ee5d',
        },
        {
          $ref: '#/components/responses/0',
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

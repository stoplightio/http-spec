export default {
  id: 'service_abc',
  name: 'GitHub v3 REST API',
  description: "GitHub's v3 REST API.",
  version: '0.0.3',
  operations: [
    {
      extensions: {},
      id: 'http_operation-service_abc-get-/orgs/{}/repos',
      method: 'get',
      path: '/orgs/{org}/repos',
      request: {
        cookie: [],
        headers: [
          {
            $ref: '#/components/header/1',
          },
        ],
        path: [],
        query: [],
      },
      responses: [
        {
          code: '403',
          $ref: '#/components/responses/0',
        },
      ],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [],
      summary: 'Get a organization repository',
      tags: [],
    },
    {
      extensions: {},
      id: 'http_operation-service_abc-post-/orgs/{}/repos',
      method: 'post',
      path: '/orgs/{org}/repos',
      request: {
        cookie: [],
        headers: [
          {
            $ref: '#/components/header/1',
          },
        ],
        path: [],
        query: [],
        body: {
          $ref: '#/components/requestBodies/0',
        },
      },
      responses: [
        {
          code: '403',
          $ref: '#/components/responses/0',
        },
      ],
      security: [],
      securityDeclarationType: 'inheritedFromService',
      servers: [],
      summary: 'Create a organization repository',
      tags: [],
    },
  ],
  components: {
    cookie: [],
    examples: [
      {
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
        id: 'http_header-service_abc-X-Rate-Limit',
        key: 'X-Rate-Limit',
        name: 'X-Rate-Limit',
        style: 'simple',
        examples: [],
        encodings: [],
        schema: {
          $ref: '#/components/schemas/1',
        },
      },
      {
        id: 'http_header-service_abc-Some-Header',
        key: 'Some-Header',
        name: 'A-Shared-Header',
        style: 'simple',
        required: false,
        examples: [],
        schema: {
          $schema: 'http://json-schema.org/draft-07/schema#',
          type: 'string',
          'x-stoplight': {
            id: 'schema-http_header-service_abc-Some-Header-',
          },
        },
      },
    ],
    path: [],
    query: [],
    requestBodies: [
      {
        id: 'http_request_body-service_abc-Organization',
        key: 'Organization',
        description: 'Organization to be added',
        contents: [
          {
            id: 'http_media-http_request_body-service_abc-Organization-application/json',
            encodings: [],
            examples: [],
            mediaType: 'application/json',
            schema: {
              $ref: '#/components/schemas/2',
            },
          },
          {
            id: 'http_media-http_request_body-service_abc-Organization-application/xml',
            encodings: [],
            examples: [],
            mediaType: 'application/xml',
            schema: {
              $ref: '#/components/schemas/2',
            },
          },
        ],
      },
    ],
    responses: [
      {
        id: 'http_response-service_abc-forbidden',
        key: 'forbidden',
        code: 'forbidden',
        contents: [
          {
            id: 'http_media-http_response-service_abc-forbidden-application/json',
            mediaType: 'application/json',
            encodings: [],
            examples: [
              {
                $ref: '#/components/examples/0',
                key: 'error',
              },
            ],
            schema: {
              $ref: '#/components/schemas/0',
            },
          },
        ],
        description: 'Forbidden',
        headers: [
          {
            name: 'X-Rate-Limit',
            $ref: '#/components/header/0',
          },
        ],
      },
    ],
    schemas: [
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        'x-stoplight': {
          id: 'schema-service_abc-basic-error',
        },
        type: 'object',
        description: 'Basic Error',
        key: 'basic-error',
        properties: {
          message: {
            type: 'string',
          },
        },
        title: 'Basic Error',
      },
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        'x-stoplight': {
          id: 'schema-service_abc-rate-limit',
        },
        description: 'The number of allowed requests in the current period',
        key: 'rate-limit',
        type: 'integer',
        title: 'Rate Limit',
      },
      {
        $schema: 'http://json-schema.org/draft-07/schema#',
        'x-stoplight': {
          id: 'schema-service_abc-Organization',
        },
        key: 'Organization',
        type: 'object',
        title: 'Organization',
        description: 'Organization',
        properties: {
          id: {
            type: 'integer',
          },
          name: {
            type: 'string',
          },
        },
        required: ['id', 'name'],
      },
    ],
    securitySchemes: [],
  },
  extensions: {
    'x-stoplight': {
      id: 'service_abc',
    },
  },
};

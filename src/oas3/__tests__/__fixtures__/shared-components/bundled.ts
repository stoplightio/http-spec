export default {
  id: 'service_abc',
  name: 'GitHub v3 REST API',
  description: "GitHub's v3 REST API.",
  version: '0.0.3',
  operations: [
    {
      extensions: {},
      // hash('http_operation-service_abc-get-/orgs/{}/repos')
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
      servers: [],
      summary: 'Get a organization repository',
      tags: [],
    },
  ],
  components: {
    cookie: [],
    examples: [
      {
        // fast1a52hex('example-service_abc-A-Shared-Example')
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
        // hash('http_header-service_abc-X-Rate-Limit')
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
        // hash('http_header-service_abc-Some-Header')
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
            // hash('schema-http_header-service_abc-Some-Header')
            id: 'schema-http_header-service_abc-Some-Header-',
          },
        },
      },
    ],
    path: [],
    query: [],
    requestBodies: [],
    responses: [
      {
        // hash('http_response-service_abc-forbidden')
        id: 'http_response-service_abc-forbidden',
        key: 'forbidden',
        code: 'forbidden',
        contents: [
          {
            // hash('http_media-{parentId}-application/json')
            // hash('http_media-http_response-service_abc-forbidden-application/json')
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
          // hash('schema-service_abc-basic-error')
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
          // hash('schema-service_abc-rate-limit')
          id: 'schema-service_abc-rate-limit',
        },
        description: 'The number of allowed requests in the current period',
        key: 'rate-limit',
        type: 'integer',
        title: 'Rate Limit',
      },
    ],
    securitySchemes: [],
  },
};

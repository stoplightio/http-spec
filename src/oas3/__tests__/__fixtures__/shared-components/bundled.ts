export default {
  id: 'service_abc',
  name: 'GitHub v3 REST API',
  description: "GitHub's v3 REST API.",
  version: '0.0.3',
  operations: [
    {
      extensions: {},
      // hash('http_operation-service_abc-get-/orgs/{}/repos')
      id: '376a534068842',
      method: 'get',
      path: '/orgs/{org}/repos',
      request: {
        body: {
          contents: [],
          id: '913ab62a764b4',
        },
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
        // hash('http_header-service_abc-X-Rate-Limit')
        id: '96620a275464f',
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
        // hash('http_response-service_abc-forbidden')
        id: 'c73bfcb376d49',
        key: 'forbidden',
        code: 'forbidden',
        contents: [
          {
            // hash('http_media-{parentId}-application/json')
            // hash('http_media-c73bfcb376d49-application/json')
            id: '4143bd61bfef9',
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
          id: '5cbb77597a983',
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
          id: '72da152ada960',
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

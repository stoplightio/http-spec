/**
 NOTE that if any object anywhere ever has a `x-stoplight.id` on it, prefer that
 over calling the generate function.
 */
export default [
  /**
   * The http_service
   */
  {
    // hash(document id - end user needs to be able to customize this.)
    // this example has a x-stoplight.id prop on the root though, so using that
    id: 'service_abc',
    version: '0.0.3',
    name: 'GitHub v3 REST API',
    description: "GitHub's v3 REST API.",
    extensions: {
      'x-stoplight': {
        id: 'service_abc',
      },
    },
  },

  /**
   * http_operation 1 of 2 (the GET operation)
   */
  {
    // hash(`http_operation-${parentId}-${method}-${pathWithParamNamesEmpty}`)
    // for pathWithParamNamesEmpty, remove all characters between {} segments
    // closest parent with an id is the service, so ends up being...
    // hash('http_operation-service_abc-get-/orgs/{}/repos')
    id: 'http_operation-service_abc-get-/orgs/{}/repos',
    method: 'get',
    path: '/orgs/{org}/repos',
    summary: 'Get a organization repository',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-service_abc-forbidden')
        id: 'http_response-service_abc-forbidden',
        code: '403',
        description: 'Forbidden',
        headers: [
          {
            // hash(`http_header-${parentId}-${header key}`)
            // it's a shared header, so the closest parent is the service.
            // hash('http_header-service_abc-X-Rate-Limit')
            id: 'http_header-service_abc-header-X-Rate-Limit',
            name: 'X-Rate-Limit',
            style: 'simple',
            encodings: [],
            examples: [],
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // hash(`http_header-${parentId}-${header key}`)
              // it's a shared header, so the closest parent is the service.
              // hash('schema-service_abc-rate-limit')
              'x-stoplight': {
                id: 'schema-service_abc-rate-limit',
              },
              type: 'integer',
              description: 'The number of allowed requests in the current period',
              title: 'Rate Limit',
            },
          },
        ],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-http_response-service_abc-forbidden-application/json')
            id: 'http_media-http_response-service_abc-forbidden-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-service_abc-basic-error')
                id: 'schema-service_abc-basic-error',
              },
              title: 'Basic Error',
              description: 'Basic Error',
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
              },
            },
            examples: [
              {
                // fast1a52hex('example-service_abc-A-Shared-Example')
                id: 'example-service_abc-A-Shared-Example',
                key: 'error',
                value: {
                  address: {
                    street: 'string',
                  },
                  id: 0,
                },
              },
            ],
            encodings: [],
          },
        ],
      },
    ],
    servers: [],
    request: {
      headers: [
        {
          // hash('http_header-service_abc-Some-Header')
          id: 'http_header-service_abc-parameter-Some-Header',
          name: 'A-Shared-Header',
          required: false,
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'string',
            'x-stoplight': {
              // hash('schema-http_header-service_abc-Some-Header-')
              id: 'schema-http_header-service_abc-parameter-Some-Header-',
            },
          },
          examples: [],
          style: 'simple',
        },
      ],
      query: [],
      cookie: [],
      path: [],
    },
    tags: [],
    security: [],
    securityDeclarationType: 'inheritedFromService',
    extensions: {},
  },
  /**
   * http_operation 2 of 2 (the POST operation)
   */
  {
    id: 'http_operation-service_abc-post-/orgs/{}/repos',
    method: 'post',
    path: '/orgs/{org}/repos',
    summary: 'Create a organization repository',
    responses: [
      {
        id: 'http_response-service_abc-forbidden',
        code: '403',
        contents: [
          {
            id: 'http_media-http_response-service_abc-forbidden-application/json',
            encodings: [],
            examples: [
              {
                id: 'example-service_abc-A-Shared-Example',
                key: 'error',
                value: {
                  address: {
                    street: 'string',
                  },
                  id: 0,
                },
              },
            ],
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-service_abc-basic-error',
              },
              title: 'Basic Error',
              description: 'Basic Error',
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
              },
            },
          },
        ],
        description: 'Forbidden',
        headers: [
          {
            id: 'http_header-service_abc-header-X-Rate-Limit',
            encodings: [],
            examples: [],
            name: 'X-Rate-Limit',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-service_abc-rate-limit',
              },
              title: 'Rate Limit',
              description: 'The number of allowed requests in the current period',
              type: 'integer',
            },
            style: 'simple',
          },
        ],
      },
    ],
    servers: [],
    request: {
      body: {
        id: 'http_request_body-service_abc-Organization',
        description: 'Organization to be added',
        contents: [
          {
            id: 'http_media-http_request_body-service_abc-Organization-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-service_abc-Organization',
              },
              title: 'Organization',
              description: 'Organization',
              type: 'object',
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
            encodings: [],
            examples: [],
          },
          {
            id: 'http_media-http_request_body-service_abc-Organization-application/xml',
            mediaType: 'application/xml',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-service_abc-Organization',
              },
              title: 'Organization',
              description: 'Organization',
              type: 'object',
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
            encodings: [],
            examples: [],
          },
        ],
      },
      cookie: [],
      headers: [
        {
          id: 'http_header-service_abc-parameter-Some-Header',
          name: 'A-Shared-Header',
          style: 'simple',
          required: false,
          examples: [],
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': {
              id: 'schema-http_header-service_abc-parameter-Some-Header-',
            },
            type: 'string',
          },
        },
      ],
      path: [],
      query: [],
    },
    tags: [],
    security: [],
    securityDeclarationType: 'inheritedFromService',
    extensions: {},
  },
];

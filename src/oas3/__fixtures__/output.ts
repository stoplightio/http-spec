/**
 NOTE that if any object anywhere ever has an `x-stoplight-id` on it, prefer that
 over calling the generate function.

 Used https://md5calc.com/hash/fnv1a32 to hash the ids.
 */
export default [
  /**
   * The http_service
   */
  {
    // hash(document id - end user needs to be able to customize this..)
    // by default could hash("#")?
    // this example has a x-stoplight-id prop on the root though, so using that
    id: 'service_abc',
    version: '1.0',
    name: 'Users API',
    servers: [
      {
        // hash(`http_server-${parentId}-${server.url}`)
        // closest parent with an id is the service, so ends up being...
        // hash('http_server-service_abc-http://localhost:3000')
        id: '98ddf8a4b5bdc',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    securitySchemes: [
      {
        // hash(`http_security-${parentId}-${security.key || security.name}`)
        // closest parent with an id is the service, so ends up being...
        // hash('http_security-service_abc-api-key')
        id: '202a905f9dff6',
        key: 'api-key',
        type: 'apiKey',
        name: 'API Key',
        in: 'query',
      },
    ],
    tags: [
      {
        // hash(`tag-${serviceId}-${tag.name}`)
        // always generate tags based on the serviceId, so ends up being...
        // hash('tag-service_abc-mutates')
        id: '936737e88c6fa',
        name: 'mutates',
      },
    ],
  },

  /**
   * http_operation 1 of 2 (the GET operation)
   */
  {
    // hash(`http_operation-${parentId}-${method}-${pathWithParamNamesEmpty}`)
    // for pathWithParamNamesEmpty, remove all characters between {} segments
    // closest parent with an id is the service, so ends up being...
    // hash('http_operation-service_abc-get-/users/{}')
    id: '96043a63b6901',
    iid: 'get-user',
    description: 'Retrieve the information of the user with the matching user ID.',
    method: 'get',
    path: '/users/{userId}',
    summary: 'Get User Info by User ID',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-96043a63b6901-200')
        id: 'f387e16c7d39d',
        code: '200',
        description: 'User Found',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-f387e16c7d39d-application/json')
            id: 'fce50f391bf57',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: 'de4f083463b7c' },
              title: 'User',
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  readOnly: true,
                },
                address: {
                  // @TODO
                  $ref: '#/components/schemas/Address',
                },
              },
              required: ['id'],
              examples: [],
            },
            examples: [],
            encodings: [],
          },
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-f387e16c7d39d-application/xml')
            id: '48eeb3ee2a049',
            mediaType: 'application/xml',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: '069dfbb6c6315' },
              type: 'string',
            },
            examples: [],
            encodings: [],
          },
        ],
      },
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // This response was defined in shared components originally.. the closest parent with an
        // id is the service, and the key was ErrorResponse so ends up being...
        // hash('http_response-service_abc-ErrorResponse')
        id: '437771f63f179',
        code: '404',
        description: 'A generic error response.',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-437771f63f179-application/json')
            id: '4d98be34f341a',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: '2691eb0db9efc' },
              type: 'object',
              properties: {
                error: {
                  // @TODO
                  $ref: '#/components/schemas/Error',
                },
              },
            },
            examples: [],
            encodings: [],
          },
        ],
      },
    ],
    servers: [
      {
        // hash(`http_server-${parentId}-${server.url}`)
        // this is coming from the service defined servers (rather than being defined specifically for this one operation)
        // so the ID ends up being the same as the service defined one... look in file for "98ddf8a4b5bdc" to find the other def above
        id: '98ddf8a4b5bdc',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    request: {
      // Request doesn't need an id
      body: {
        id: 'd5027559477f8',
        // Really this doesn't even need to be here... there is no request body for this op
        contents: [],
      },
      headers: [
        {
          // hash(`http_header-${parentId}-${param.name}`)
          // This header was defined in shared components originally, note how this ends up appearing several times in this doc.
          // The closest parent with an id is the service, so ends up being...
          // hash('http_header-service_abc-A-Shared-Header')
          id: '21b1f96bd26ee',
          name: 'A-Shared-Header',
          required: false,
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': { id: 'be6b513de1b69' },
            type: 'string',
          },
          examples: [],
        },
      ],
      query: [
        {
          // hash(`http_query-${parentId}-${param.name}`)
          // This was defined directly on the operation (not a shared component), so the closest
          // parent with an id is the operation, so ends up being...
          // hash('http_query-96043a63b6901-summaryOnly')
          id: 'efe9534d001fc',
          name: 'summaryOnly',
          style: 'form',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'boolean',
            'x-stoplight': { id: 'aca62504578bd' },
          },
          examples: [],
        },
      ],
      cookie: [],
      path: [
        {
          // hash(`http_path_param-${parentId}-${param.name}`)
          // This was defined on the path, so we use the path to generate the id (thus if another operation on this path was in this doc, it would have path param with same id)
          // path's id = hash(`http_path-${parentId}-${path}`)
          // The closest parent id to a path, is the service, so this equals... (remember that path segments have characters removed, since they are basically meaningless)
          // hash('http_path-service_abc-/users/{}') = '05574f79'
          // and then the final path param id...
          // hash('http_path_param-05574f79-userId') = 'fe171ec8cfd0b'
          id: 'fe171ec8cfd0b',
          name: 'userId',
          required: true,
          description: 'Id of an existing user.',
          style: 'simple',
          schema: {
            'x-stoplight': { id: '13ad531bed72e' },
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'integer',
          },
          examples: [],
        },
      ],
    },
    tags: [
      {
        // hash(`tag-${serviceId}-${tag.name}`)
        // always generate tags based on the serviceId, so ends up being...
        // hash('tag-service_abc-tag-without-root-def')
        id: '9862017e672e6',
        name: 'tag-without-root-def',
      },
    ],
    security: [],
    extensions: {},
  },

  /**
   * http_operation 2 of 2 (the POST operation)
   */
  {
    // Same process as first time... and yes, I know "POST" doesn't make sense on this path lol
    id: 'b16a96d287951',
    iid: 'post-users-userId',
    method: 'post',
    path: '/users/{userId}',
    summary: 'Create user',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-b16a96d287951-201')
        id: 'd8ca38606ee5d',
        code: '201',
        description: 'User Created',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-d8ca38606ee5d-application/json')
            id: '88460a8f1a612',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: 'de4f083463b7c' },
              title: 'User',
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  readOnly: true,
                },
                address: {
                  // @TODO
                  $ref: '#/components/schemas/Address',
                },
              },
              required: ['id'],
              examples: [],
            },
            examples: [],
            encodings: [],
          },
        ],
      },
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // This response was defined in shared components originally.. the closest parent with an
        // id is the service, and the key was ErrorResponse so ends up being...
        // hash('http_response-service_abc-ErrorResponse')
        // NOTE how this ID is the same as the 404 response from the get user operation...
        id: '437771f63f179',
        code: '400',
        description: 'A generic error response.',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-437771f63f179-application/json')
            // NOTE how this ID is the same as the 404 response json media type from the get user operation...
            id: '4d98be34f341a',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // hash(`schema-${parentId}-${key}`)
              // This schema was defined in shared components originally.. the closest parent with an
              // id is the service, and the key was ErrorResponse so ends up being...
              // hash('schema-4d98be34f341a-ErrorResponse')
              'x-stoplight': { id: '2691eb0db9efc' },
              type: 'object',
              properties: {
                error: {
                  // @TODO
                  $ref: '#/components/schemas/Error',
                },
              },
            },
            examples: [],
            encodings: [],
          },
        ],
      },
    ],
    servers: [
      {
        // hash(`http_server-${parentId}-${server.url}`)
        // this is coming from the service defined servers (rather than being defined specifically for this one operation)
        // so the ID ends up being the same as the service defined one (and also present in the get user op)...
        // look in file for "98ddf8a4b5bdc" to find the other defs above
        id: '98ddf8a4b5bdc',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    request: {
      body: {
        // hash(`http_request_body-${parentId}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_request_body-b16a96d287951')
        id: '07267ec331fc9',
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the request body, so ends up being...
            // hash('http_media-07267ec331fc9-application/json')
            id: '00db77c676e1a',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: 'de4f083463b7c' },
              title: 'User',
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  readOnly: true,
                },
                address: {
                  // @TODO
                  $ref: '#/components/schemas/Address',
                },
              },
              required: ['id'],
              examples: [],
            },
            examples: [
              {
                // hash(`example-${parentId}-${example key}`)
                // This example was defined in shared components originally.. the closest parent with an
                // id is the service, and the key was "A-Shared-Example" so ends up being...
                // hash('example-service_abc-A-Shared-Example')
                id: '5a69041e065b0',
                key: 'basic-example',
                value: {
                  id: 0,
                  address: {
                    street: 'string',
                  },
                },
              },
            ],
            encodings: [],
          },
        ],
      },
      headers: [
        {
          // hash(`http_header-${parentId}-${param.name}`)
          // This was defined directly on the operation (not a shared component), so the closest
          // parent with an id is the operation, so ends up being...
          // hash('http_header-b16a96d287951-Post-Specific-Header')
          id: '1ead595922478',
          name: 'Post-Specific-Header',
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': { id: 'de5897f178a5d' },
            type: 'integer',
          },
          examples: [],
        },
        {
          // hash(`http_header-${parentId}-${param.name}`)
          // This header was defined in shared components originally, note how this ends up appearing several times in this doc.
          // The closest parent with an id is the service, so ends up being...
          // hash('http_header-service_abc-A-Shared-Header')
          id: '21b1f96bd26ee',
          name: 'A-Shared-Header',
          required: false,
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': { id: 'be6b513de1b69' },
            type: 'string',
          },
          examples: [],
        },
      ],
      query: [],
      cookie: [],
      path: [
        {
          // Same process as other path param, resulting in the same
          // ID (so this path param node will end up as single instance in the graph, with an edge from each operation pointing at it)
          id: 'fe171ec8cfd0b',
          name: 'userId',
          required: true,
          description: 'Id of an existing user.',
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            // hash(`http_media-${parentId}-${key}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-437771f63f179-application/json')
            'x-stoplight': { id: '13ad531bed72e' },
            type: 'integer',
          },
          examples: [],
        },
      ],
    },
    tags: [
      {
        // hash(`tag-${serviceId}-${tag.name}`)
        // always generate tags based on the serviceId, so ends up being...
        // hash('tag-service_abc-mutates')
        id: '936737e88c6fa',
        name: 'mutates',
      },
    ],
    security: [
      [
        {
          // This is effectively a silly "fake" ref that openapi pulls... so
          // we can effectively just re-use the same ID for the relevant securityScheme
          // from the root.. note the ID is the same as the root securityScheme id
          id: '202a905f9dff6',
          key: 'api-key',
          type: 'apiKey',
          name: 'API Key',
          in: 'query',
        },
      ],
    ],
    extensions: {},
  },
];

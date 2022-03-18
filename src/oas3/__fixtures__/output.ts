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
        id: 'c79e6d33',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    securitySchemes: [
      {
        // hash(`http_security-${parentId}-${security.key || security.name}`)
        // closest parent with an id is the service, so ends up being...
        // hash('http_security-service_abc-api-key')
        id: 'e583d20a',
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
        id: 'f9770014',
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
    id: 'c24e2e86',
    iid: 'get-user',
    description: 'Retrieve the information of the user with the matching user ID.',
    method: 'get',
    path: '/users/{userId}',
    summary: 'Get User Info by User ID',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-c24e2e86-200')
        id: 'db8fc6a',
        code: '200',
        description: 'User Found',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-db8fc6a-application/json')
            id: '5f42ddcb',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // @TODO
              'x-stoplight-id': '#/components/schemas/User',
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
            // hash('http_media-db8fc6a-application/xml')
            id: 'f747e9ce',
            mediaType: 'application/xml',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // @TODO
              'x-stoplight-id': '#/paths/~1users~1{userId}/get/responses/200/content/application~1xml/schema',
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
        id: '54f681ac',
        code: '404',
        description: 'A generic error response.',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-54f681ac-application/json')
            id: '36bf7233',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // @TODO
              'x-stoplight-id': '#/components/responses/ErrorResponse',
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
        // so the ID ends up being the same as the service defined one... look in file for "c79e6d33" to find the other def above
        id: 'c79e6d33',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    request: {
      // Request doesn't need an id
      body: {
        // Really this doesn't even need to be here... there is no request body for this op
        contents: [],
      },
      headers: [
        {
          // hash(`http_header-${parentId}-${param.name}`)
          // This header was defined in shared components originally, note how this ends up appearing several times in this doc.
          // The closest parent with an id is the service, so ends up being...
          // hash('http_header-service_abc-A-Shared-Header')
          id: '7565f628',
          name: 'A-Shared-Header',
          required: false,
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            // @TODO
            // hash(`schema-${parentId}`)? Do we set "id", "$id", "x-stoplight-id"?
            'x-stoplight-id': '#/components/parameters/Some-Header',
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
          // hash('http_query-c24e2e86-summaryOnly')
          id: 'ee62f683',
          name: 'summaryOnly',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'boolean',
            // @TODO
            'x-stoplight-id': '#/paths/~1users~1{userId}/get/parameters/0/schema',
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
          // hash('http_path-service_abc-/users/{}') = '5574f79'
          // and then the final path param id...
          // hash('http_path_param-5574f79-userId') = 'e5aad2ac'
          id: 'e5aad2ac',
          name: 'userId',
          required: true,
          description: 'Id of an existing user.',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'integer',
            // @TODO
            'x-stoplight-id': '#/paths/~1users~1{userId}/parameters/0/schema',
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
        id: '58c8f083',
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
    id: '94973c6',
    iid: 'post-users-userId',
    method: 'post',
    path: '/users/{userId}',
    summary: 'Create user',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-94973c6-201')
        id: 'd2f61c4f',
        code: '201',
        description: 'User Created',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-d2f61c4f-application/json')
            id: '79d85165',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // @TODO
              'x-stoplight-id': '#/components/schemas/User',
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
        id: '54f681ac',
        code: '400',
        description: 'A generic error response.',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-54f681ac-application/json')
            // NOTE how this ID is the same as the 404 response json media type from the get user operation...
            id: '36bf7233',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // @TODO
              'x-stoplight-id': '#/components/responses/ErrorResponse',
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
        // look in file for "c79e6d33" to find the other defs above
        id: 'c79e6d33',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    request: {
      body: {
        // hash(`http_request_body-${parentId}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_request_body-94973c6')
        id: '42f2cb2a',
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the request body, so ends up being...
            // hash('http_media-42f2cb2a-application/json')
            id: '68198af7',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              // @TODO
              'x-stoplight-id': '#/components/schemas/User',
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
                id: '95db488b',
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
          // hash('http_header-94973c6-Post-Specific-Header')
          id: 'fde1cd99',
          name: 'Post-Specific-Header',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            // @TODO
            'x-stoplight-id': '#/paths/~1users~1{userId}/post/parameters/0/schema',
            type: 'integer',
          },
          examples: [],
        },
        {
          // hash(`http_header-${parentId}-${param.name}`)
          // This header was defined in shared components originally, note how this ends up appearing several times in this doc.
          // The closest parent with an id is the service, so ends up being...
          // hash('http_header-service_abc-A-Shared-Header')
          id: '7565f628',
          name: 'A-Shared-Header',
          required: false,
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            // @TODO
            'x-stoplight-id': '#/components/parameters/Some-Header',
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
          id: 'e5aad2ac',
          name: 'userId',
          required: true,
          description: 'Id of an existing user.',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            // @TODO
            'x-stoplight-id': '#/paths/~1users~1{userId}/parameters/0/schema',
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
        id: 'f9770014',
        name: 'mutates',
      },
    ],
    security: [
      [
        {
          // This is effectively a silly "fake" ref that openapi pulls... so
          // we can effectively just re-use the same ID for the relevant securityScheme
          // from the root.. note the ID is the same as the root securityScheme id
          id: 'e583d20a',
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

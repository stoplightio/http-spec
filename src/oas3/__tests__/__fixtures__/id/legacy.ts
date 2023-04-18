/**
 NOTE that if any object anywhere ever has an `x-stoplight.id` on it, prefer that
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
        id: 'http_server-service_abc-http://localhost:3000',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    securitySchemes: [
      {
        // hash(`http_security-${parentId}-${security.key || security.name}`)
        // closest parent with an id is the service, so ends up being...
        id: 'http_security-service_abc-api-key',
        key: 'api-key',
        type: 'apiKey',
        name: 'API Key',
        in: 'query',
        extensions: {},
      },
    ],
    tags: [
      {
        // hash(`tag-${tag.name}`)
        id: 'tag-mutates',
        name: 'mutates',
      },
    ],
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
    id: 'http_operation-service_abc-get-/users/{}',
    iid: 'get-user',
    description: 'Retrieve the information of the user with the matching user ID.',
    method: 'get',
    path: '/users/{userId}',
    summary: 'Get User Info by User ID',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-http_operation-service_abc-get-/users/{}-200')
        id: 'http_response-http_operation-service_abc-get-/users/{}-200',
        code: '200',
        description: 'User Found',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/json')
            id: 'http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: 'schema-service_abc-User' },
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
            // hash('http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/xml')
            id: 'http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/xml',
            mediaType: 'application/xml',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                id: 'schema-http_media-http_response-http_operation-service_abc-get-/users/{}-200-application/xml-',
              },
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
        id: 'http_response-service_abc-ErrorResponse',
        code: '404',
        description: 'A generic error response.',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-http_response-service_abc-ErrorResponse-application/json')
            id: 'http_media-http_response-service_abc-ErrorResponse-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-http_media-http_response-service_abc-ErrorResponse-application/json-')
                id: 'schema-http_media-http_response-service_abc-ErrorResponse-application/json-',
              },
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
        // so the ID ends up being the same as the service defined one... look in file for "http_server-service_abc-http://localhost:3000" to find the other def above
        id: 'http_server-service_abc-http://localhost:3000',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    request: {
      // Request doesn't need an id
      headers: [
        {
          // hash(`http_header-${parentId}-${key ?? param.name}`)
          // This header was defined in shared components originally, note how this ends up appearing several times in this doc.
          // The closest parent with an id is the service, so ends up being...
          // hash('http_header-service_abc-Some-Header')
          id: 'http_header-service_abc-Some-Header',
          name: 'A-Shared-Header',
          required: false,
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': {
              id: 'schema-http_header-service_abc-Some-Header-',
            },
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
          id: 'http_query-http_operation-service_abc-get-/users/{}-summaryOnly',
          name: 'summaryOnly',
          style: 'form',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'boolean',
            'x-stoplight': { id: 'schema-http_query-http_operation-service_abc-get-/users/{}-summaryOnly-' },
          },
          examples: [],
        },
      ],
      cookie: [],
      path: [
        {
          // hash(`http_path_param-${parentId}-${param.name}`)
          // This was defined on the path, so we use the *operation* to generate the id (thus if another operation on this path was in this doc, it would have path param with a different id)
          // path's id = hash(`http_path-${parentId}-${path}`)
          // The closest parent id to a operation, is the service, so this equals... (remember that path segments have characters removed, since they are basically meaningless)
          // hash('http_path-service_abc-/users/{}') = '05574f79'
          // and then the final path param id...
          // hash('http_path_param-05574f79-userId') = 'http_path_param-http_operation-service_abc-get-/users/{}-userId'
          id: 'http_path_param-http_operation-service_abc-get-/users/{}-userId',
          name: 'userId',
          required: true,
          description: 'Id of an existing user.',
          style: 'simple',
          schema: {
            'x-stoplight': { id: 'schema-http_path_param-http_operation-service_abc-get-/users/{}-userId-' },
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'integer',
          },
          examples: [],
        },
      ],
    },
    tags: [
      {
        // hash(`tag-${tag.name}`)
        // hash('tag-tag-without-root-def')
        id: 'tag-tag-without-root-def',
        name: 'tag-without-root-def',
      },
    ],
    security: [],
    securityDeclarationType: 'inheritedFromService',
    extensions: {},
  },

  /**
   * http_operation 2 of 2 (the POST operation)
   */
  {
    // Same process as first time... and yes, I know "POST" doesn't make sense on this path lol
    id: 'http_operation-service_abc-post-/users/{}',
    iid: 'post-users-userId',
    method: 'post',
    path: '/users/{userId}',
    summary: 'Create user',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-http_operation-service_abc-post-/users/{}-201')
        id: 'http_response-http_operation-service_abc-post-/users/{}-201',
        code: '201',
        description: 'User Created',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-http_response-http_operation-service_abc-post-/users/{}-201-application/json')
            id: 'http_media-http_response-http_operation-service_abc-post-/users/{}-201-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: 'schema-service_abc-User' },
              title: 'User',
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                  readOnly: true,
                },
                address: {
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
        id: 'http_response-service_abc-ErrorResponse',
        code: '400',
        description: 'A generic error response.',
        headers: [],
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-http_response-service_abc-ErrorResponse-application/json')
            // NOTE how this ID is the same as the 404 response json media type from the get user operation...
            id: 'http_media-http_response-service_abc-ErrorResponse-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-http_media-http_response-service_abc-ErrorResponse-application/json-')
                id: 'schema-http_media-http_response-service_abc-ErrorResponse-application/json-',
              },
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
        // look in file for "http_server-service_abc-http://localhost:3000" to find the other defs above
        id: 'http_server-service_abc-http://localhost:3000',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    request: {
      body: {
        // hash(`http_request_body-${parentId}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_request_body-http_operation-service_abc-post-/users/{}')
        id: 'http_request_body-http_operation-service_abc-post-/users/{}',
        contents: [
          {
            // hash(`http_media-${parentId}-${mediaType}`)
            // closest parent with an id is the request body, so ends up being...
            // hash('http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json')
            id: 'http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': { id: 'schema-service_abc-User' },
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
                id: 'example-service_abc-A-Shared-Example',
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
          // hash('http_header-http_operation-service_abc-post-/users/{}-Post-Specific-Header')
          id: 'http_header-http_operation-service_abc-post-/users/{}-Post-Specific-Header',
          name: 'Post-Specific-Header',
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': {
              id: 'schema-http_header-http_operation-service_abc-post-/users/{}-Post-Specific-Header-',
            },
            type: 'integer',
          },
          examples: [],
        },
        {
          // hash(`http_header-${parentId}-${key ?? param.name}`)
          // This header was defined in shared components originally, note how this ends up appearing several times in this doc.
          // The closest parent with an id is the service, so ends up being...
          // hash('http_header-service_abc-Some-Header')
          id: 'http_header-service_abc-Some-Header',
          name: 'A-Shared-Header',
          required: false,
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            'x-stoplight': {
              // hash('schema-http_header-service_abc-Some-Header-')
              id: 'schema-http_header-service_abc-Some-Header-',
            },
            type: 'string',
          },
          examples: [],
        },
      ],
      query: [],
      cookie: [],
      path: [
        {
          // Same process as other path param, resulting in a new
          // ID (so this path param node will end up as multiple instances in the graph, with an edge from each operation pointing at it)
          id: 'http_path_param-http_operation-service_abc-post-/users/{}-userId',
          name: 'userId',
          required: true,
          description: 'Id of an existing user.',
          style: 'simple',
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            // hash(`http_media-${parentId}-${key}`)
            // closest parent with an id is the response, so ends up being...
            // hash('http_media-http_response-service_abc-ErrorResponse-application/json')
            'x-stoplight': { id: 'schema-http_path_param-http_operation-service_abc-post-/users/{}-userId-' },
            type: 'integer',
          },
          examples: [],
        },
      ],
    },
    tags: [
      {
        // hash(`tag-${tag.name}`)
        // hash('tag-mutates')
        id: 'tag-mutates',
        name: 'mutates',
      },
    ],
    security: [
      [
        {
          // This is effectively a silly "fake" ref that openapi pulls... so
          // we can effectively just re-use the same ID for the relevant securityScheme
          // from the root.. note the ID is the same as the root securityScheme id
          id: 'http_security-service_abc-api-key',
          key: 'api-key',
          type: 'apiKey',
          name: 'API Key',
          in: 'query',
          extensions: {},
        },
      ],
    ],
    securityDeclarationType: 'declared',
    extensions: {},
  },
];

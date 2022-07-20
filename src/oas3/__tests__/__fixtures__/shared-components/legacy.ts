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
  },

  /**
   * http_operation 1 of 1 (the GET operation)
   */
  {
    // hash(`http_operation-${parentId}-${method}-${pathWithParamNamesEmpty}`)
    // for pathWithParamNamesEmpty, remove all characters between {} segments
    // closest parent with an id is the service, so ends up being...
    // hash('http_operation-service_abc-get-/orgs/{}/repos')
    id: '376a534068842',
    method: 'get',
    path: '/orgs/{org}/repos',
    summary: 'Get a organization repository',
    responses: [
      {
        // hash(`http_response-${parentId}-${response.code || response key (for shared response)}`)
        // closest parent with an id is the operation, so ends up being...
        // hash('http_response-service_abc-forbidden')
        id: 'c73bfcb376d49',
        code: '403',
        description: 'Forbidden',
        headers: [
          {
            // hash(`http_header-${parentId}-${header key}`)
            // it's a shared header, so the closest parent is the service.
            // hash('http_header-service_abc-X-Rate-Limit')
            id: '96620a275464f',
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
                id: '72da152ada960',
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
            // hash('http_media-c73bfcb376d49-application/json')
            id: '4143bd61bfef9',
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-07/schema#',
              'x-stoplight': {
                // hash('schema-service_abc-basic-error')
                id: '5cbb77597a983',
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
                id: '5a69041e065b0',
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
          id: 'd0b1db7d34de6',
          name: 'A-Shared-Header',
          required: false,
          schema: {
            $schema: 'http://json-schema.org/draft-07/schema#',
            type: 'string',
            'x-stoplight': {
              // hash('schema-d0b1db7d34de6-')
              id: '854607270d287',
            },
          },
          examples: [],
          style: 'simple',
        },
      ],
      query: [],
      cookie: [],
      path: [],
      unknown: [],
    },
    tags: [],
    security: [],
    extensions: {},
  },
];

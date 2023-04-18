export default [
  {
    id: 'service_abc',
    name: 'Users API',
    servers: [
      {
        id: 'http_server-service_abc-http://localhost:3000',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    version: '1.0',
    extensions: {
      'x-stoplight': {
        id: 'service_abc',
      },
    },
  },
  {
    id: 'http_operation-service_abc-post-/users/{}',
    extensions: {},
    method: 'post',
    path: '/users/{userId}',
    request: {
      body: {
        id: 'http_request_body-http_operation-service_abc-post-/users/{}',
        contents: [
          {
            id: 'http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json',
            encodings: [],
            examples: [
              {
                id: 'example-http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json-foo',
                key: 'foo',
                summary: 'A foo example',
                value: {
                  foo: 'bar',
                },
              },
              {
                id: 'example-http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json-bar',
                key: 'bar',
                summary: 'A bar example',
                value: {
                  bar: 'baz',
                },
              },
              {
                id: 'example-service_abc-baz',
                key: 'baz',
                summary: 'A baz example',
                value: {
                  baz: 'qux',
                },
              },
            ],
            mediaType: 'application/json',
          },
        ],
      },
      cookie: [],
      headers: [],
      path: [],
      query: [],
    },
    responses: [],
    security: [],
    servers: [
      {
        id: 'http_server-service_abc-http://localhost:3000',
        name: 'Users API',
        url: 'http://localhost:3000',
      },
    ],
    securityDeclarationType: 'inheritedFromService',
    tags: [],
  },
];

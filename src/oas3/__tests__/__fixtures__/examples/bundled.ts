export default {
  id: 'service_abc',
  name: 'Users API',
  version: '1.0',
  servers: [
    {
      id: 'http_server-service_abc-http://localhost:3000',
      name: 'Users API',
      url: 'http://localhost:3000',
    },
  ],
  operations: [
    {
      extensions: {},
      id: 'http_operation-service_abc-post-/users/{}',
      method: 'post',
      path: '/users/{userId}',
      request: {
        body: {
          id: 'http_request_body-http_operation-service_abc-post-/users/{}',
          contents: [
            {
              encodings: [],
              id: 'http_media-http_request_body-http_operation-service_abc-post-/users/{}-application/json',
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
                  $ref: '#/components/examples/0',
                  key: 'baz',
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
      securityDeclarationType: 'inheritedFromService',
      servers: [
        {
          id: 'http_server-service_abc-http://localhost:3000',
          name: 'Users API',
          url: 'http://localhost:3000',
        },
      ],
      tags: [],
    },
  ],
  components: {
    callbacks: [],
    cookie: [],
    examples: [
      {
        id: 'example-service_abc-baz',
        key: 'baz',
        summary: 'A baz example',
        value: {
          baz: 'qux',
        },
      },
      {
        externalValue: 'http://foo.bar/examples/frog-example.json',
        id: 'example-service_abc-frog-example',
        key: 'frog-example',
      },
    ],
    header: [],
    path: [],
    query: [],
    unknownParameters: [],
    requestBodies: [],
    responses: [],
    schemas: [],
    securitySchemes: [],
  },
  extensions: {
    'x-stoplight': {
      id: 'service_abc',
    },
  },
};

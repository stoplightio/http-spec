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
        headers: [],
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
            examples: [],
            encodings: [],
          },
        ],
      },
    ],
    servers: [],
    request: {
      body: {
        id: '913ab62a764b4',
        contents: [],
      },
      headers: [],
      query: [],
      cookie: [],
      path: [],
    },
    tags: [],
    security: [],
    extensions: {},
  },
];

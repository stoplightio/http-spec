import { lazyInlineResolver } from '@stoplight/json';

import { translateToResponses } from '../responses';

describe('translateToOas3Responses', () => {
  it('given empty dictionary should return empty array', () => {
    expect(translateToResponses({}, {})).toEqual([]);
  });

  it('given a response in dictionary should translate', () => {
    expect(
      translateToResponses(
        {},
        {
          default: {
            content: {
              'fake-content-type': {},
            },
            description: 'descr',
            headers: {
              'fake-header-name-1': {
                description: 'calls per hour allowed by the user',
                schema: {
                  type: 'integer',
                  format: 'int32',
                },
                example: 1000,
              },
              'fake-header-name-2': {
                description: 'calls per hour allowed by the user',
                schema: {
                  type: 'integer',
                  format: 'int32',
                },
                required: true,
                example: 1000,
              },
            },
          },
          200: {
            content: {
              'fake-content-type-200': {
                example: 'dumb',
              },
            },
            description: 'descr 200',
            headers: {
              'fake-header-name-200': {},
            },
          },
        },
      ),
    ).toMatchSnapshot();
  });

  it('given a response with nullish headers in dictionary should translate', () => {
    expect(
      translateToResponses(
        {},
        {
          200: {
            headers: {
              '0': null,
            },
          },
        },
      ),
    ).toStrictEqual([
      {
        code: '200',
        contents: [],
        description: void 0,
        headers: [],
      },
    ]);
  });

  it('should skip nullish responses', () => {
    expect(
      translateToResponses(
        {},
        {
          200: null,
          201: {
            description: 'description 201',
          },
        },
      ),
    ).toStrictEqual([
      {
        code: '201',
        contents: [],
        description: 'description 201',
        headers: [],
      },
    ]);
  });

  it('should resolve $refs nullish responses', () => {
    const document = lazyInlineResolver({
      openapi: '3.0.0',
      paths: {
        '/user': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                    examples: {
                      'my-example': {
                        $ref: '#/components/examples/Joe',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            title: 'User',
            type: 'object',
            properties: {
              id: {
                type: 'integer',
              },
            },
          },
        },
        examples: {
          Joe: {
            value: {
              id: 1,
            },
          },
        },
      },
    }) as any;

    expect(translateToResponses(document, document.paths['/user'].get.responses)).toEqual([
      {
        code: '200',
        contents: [
          {
            encodings: [],
            examples: [
              {
                key: 'my-example',
                value: {
                  id: 1,
                },
              },
            ],
            mediaType: 'application/json',
            schema: {
              $schema: 'http://json-schema.org/draft-04/schema#',
              properties: {
                id: {
                  type: 'integer',
                },
              },
              title: 'User',
              type: 'object',
            },
          },
        ],
        headers: [],
      },
    ]);
  });
});

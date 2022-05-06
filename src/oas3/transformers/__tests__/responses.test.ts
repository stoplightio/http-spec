import type { DeepPartial } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';

import { createContext } from '../../../oas/context';
import { translateToResponses as _translateToResponses } from '../responses';

const translateToResponses = (document: DeepPartial<OpenAPIObject>, responses: unknown) =>
  _translateToResponses.call(createContext(document), responses);

describe('translateToOas3Responses', () => {
  it('given empty dictionary should return empty array', () => {
    expect(translateToResponses({}, {})).toEqual([]);
  });

  it('given a response in dictionary should translate', () => {
    const responses = translateToResponses(
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
    );

    expect(responses).toHaveLength(2);
    expect(responses[0]).toMatchSnapshot({
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          examples: [
            {
              id: expect.any(String),
            },
          ],
        },
      ],
      headers: [
        {
          id: expect.any(String),
        },
      ],
    });
    expect(responses[1]).toMatchSnapshot({
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
        },
      ],
      headers: [
        {
          id: expect.any(String),
          examples: [
            {
              id: expect.any(String),
            },
          ],
          schema: {
            'x-stoplight': {
              id: expect.any(String),
            },
          },
        },
        {
          id: expect.any(String),
          examples: [
            {
              id: expect.any(String),
            },
          ],
          schema: {
            'x-stoplight': {
              id: expect.any(String),
            },
          },
        },
      ],
    });
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
        id: expect.any(String),
        code: '200',
        contents: [],
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
        id: expect.any(String),
        code: '201',
        contents: [],
        description: 'description 201',
        headers: [],
      },
    ]);
  });

  it('should resolve $refs nullish responses', () => {
    const document: DeepPartial<OpenAPIObject> = {
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
                      Bear: {
                        externalValue: 'https://stoplight.io/bear',
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
    };

    expect(translateToResponses(document, document.paths!['/user'].get.responses)).toEqual([
      {
        id: expect.any(String),
        code: '200',
        contents: [
          {
            id: expect.any(String),
            encodings: [],
            examples: [
              {
                id: expect.any(String),
                key: 'my-example',
                value: {
                  id: 1,
                },
              },
              {
                id: expect.any(String),
                key: 'Bear',
                externalValue: 'https://stoplight.io/bear',
              },
            ],
            mediaType: 'application/json',
            schema: {
              'x-stoplight': {
                id: expect.any(String),
              },
              $schema: 'http://json-schema.org/draft-07/schema#',
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

  it('dereference headers', () => {
    const translated = translateToResponses(
      {
        components: {
          headers: {
            xPage: {
              schema: {
                type: 'integer',
              },
              description: 'Current page (if pagination parameters were provided in the request)',
              example: 3,
            },
          },
        },
      },
      {
        200: {
          description: 'OK',
          headers: {
            'X-Page': {
              $ref: '#/components/headers/xPage',
            },
          },
        },
      },
    );

    const expected = [
      {
        id: expect.any(String),
        code: '200',
        contents: [],
        description: 'OK',
        headers: [
          {
            id: expect.any(String),
            name: 'X-Page',
            schema: {
              'x-stoplight': {
                id: expect.any(String),
              },
              $schema: 'http://json-schema.org/draft-07/schema#',
              type: 'integer',
            },
            style: 'simple',
            description: 'Current page (if pagination parameters were provided in the request)',
            encodings: [],
            examples: [
              {
                id: expect.any(String),
                key: '__default',
                value: 3,
              },
            ],
          },
        ],
      },
    ];
    expect(translated).toEqual(expected);
  });
});

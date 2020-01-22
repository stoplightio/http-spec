import { translateToResponses } from '../responses';

describe('translateToOas3Responses', () => {
  test('given empty dictionary should return empty array', () => {
    expect(translateToResponses({})).toEqual([]);
  });

  test('given a response in dictionary should translate', () => {
    expect(
      translateToResponses({
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
      }),
    ).toMatchSnapshot();
  });

  test('given a response with nullish headers in dictionary should translate', () => {
    expect(
      translateToResponses({
        200: {
          headers: {
            '0': null,
          },
        },
      }),
    ).toStrictEqual([
      {
        code: '200',
        contents: [],
        description: void 0,
        headers: [],
      },
    ]);
  });

  test('should skip nullish responses', () => {
    expect(
      translateToResponses({
        200: null,
        201: {
          description: 'description 201',
        },
      }),
    ).toStrictEqual([
      {
        code: '201',
        contents: [],
        description: 'description 201',
        headers: [],
      },
    ]);
  });
});

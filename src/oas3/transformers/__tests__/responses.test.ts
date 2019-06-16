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
            'fake-content-type-200': {},
          },
          description: 'descr 200',
          headers: {
            'fake-header-name-200': {},
          },
        },
      }),
    ).toMatchSnapshot();
  });
});

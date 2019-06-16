import { transformOas2Operation } from '../operation';
import { translateToRequest } from '../transformers/request';
import { translateToResponses } from '../transformers/responses';
import { translateToSecurities } from '../transformers/securities';

jest.mock('../transformers/responses');
jest.mock('../transformers/request');
jest.mock('../transformers/securities');

describe('transformOas2Operation', () => {
  beforeEach(() => {
    (translateToResponses as jest.Mock).mockReturnValueOnce({});
    (translateToRequest as jest.Mock).mockReturnValueOnce({});
    (translateToSecurities as jest.Mock).mockReturnValueOnce({});
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('should translate operation', () => {
    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
          swagger: '2.0',
          info: {
            title: 'title',
            version: '1.0',
          },
          paths: {
            '/users/{userId}': {
              get: {
                operationId: 'oid',
                description: 'odesc',
                deprecated: true,
                summary: 'osum',
                responses: {
                  response: {
                    description: 'desc',
                    examples: {
                      example: {},
                    },
                    headers: {
                      header: {
                        type: 'integer',
                      },
                    },
                    schema: {},
                  },
                },
              },
            },
          },
        },
      }),
    ).toMatchSnapshot();
  });
});

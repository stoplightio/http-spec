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
          securityDefinitions: {
            petstore_auth: {
              type: 'oauth2',
              authorizationUrl: 'https://petstore.swagger.io/oauth/dialog',
              flow: 'implicit',
              scopes: {
                'write:pets': 'modify pets in your account',
                'read:pets': 'read your pets',
              },
            },
            api_key: {
              type: 'apiKey',
              name: 'api_key',
              in: 'header',
            },
          },
        },
      }),
    ).toMatchSnapshot();
  });

  test('should return deprecated property in http operation root', () => {
    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document: {
          swagger: '2.0',
          servers: [
            {
              url: 'http://localhost:3000',
            },
          ],
          paths: {
            '/users/{userId}': {
              // @ts-ignore
              get: {
                deprecated: true,
              },
            },
          },
        },
      }),
    ).toHaveProperty('deprecated', true);
  });
});

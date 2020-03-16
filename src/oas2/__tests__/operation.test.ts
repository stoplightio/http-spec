import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';
import { transformOas2Operation } from '../operation';
import { DeepPartial } from 'utility-types';

describe('transformOas2Operation', () => {
  test('should translate operation', () => {
    const document: Partial<Spec> = {
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
            security: [
              {
                petstore_auth: ['write:pets'],
              },
              {
                api_key: [],
              },
            ],
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
          name: 'api_key_name',
          in: 'header',
        },
      },
    };

    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toMatchSnapshot();
  });

  test('should return deprecated property in http operation root', () => {
    const document: DeepPartial<Spec> = {
      swagger: '2.0',
      paths: {
        '/users/{userId}': {
          get: {
            deprecated: true,
          },
        },
      },
    };

    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toHaveProperty('deprecated', true);
  });

  test('given malformed parameters should translate operation with those parameters', () => {
    const document: Partial<OpenAPIObject> = {
      swagger: '2.0',
      paths: {
        '/users/{userId}': {
          get: {
            parameters: [
              {
                in: 'header',
                name: 'name',
              },
              null,
            ],
          },
        },
      },
    };

    expect(
      transformOas2Operation({
        path: '/users/{userId}',
        method: 'get',
        document,
      }),
    ).toStrictEqual({
      id: '?http-operation-id?',
      method: 'get',
      path: '/users/{userId}',
      request: {
        headers: [
          {
            name: 'name',
            schema: {},
            style: 'simple',
          },
        ],
      },
      responses: [],
      security: [],
      servers: [],
      tags: [],
    });
  });
});

import { OpenAPIObject } from 'openapi3-ts';

import { translateToSecurities } from '../securities';

describe('securities', () => {
  describe('translateToSecurities', () => {
    test('single http security', () => {
      expect(
        translateToSecurities(
          {
            openapi: '3.0.0',
            info: {
              title: 'OAS3',
              version: '1.0',
            },
            paths: {
              '/path': {
                $ref: '../test-api/openapi.yaml#/paths/~1path',
              },
            },
            components: {
              securitySchemes: {
                'http-security': {
                  type: 'http',
                  description: 'a description',
                },
              },
            },
          } as OpenAPIObject,
          [{ 'http-security': [] }],
        ),
      ).toEqual(
        expect.arrayContaining([
          [
            {
              type: 'http',
              description: 'a description',
              key: 'http-security',
            },
          ],
        ]),
      );
    });

    test('single apiKey security', () => {
      expect(
        translateToSecurities(
          {
            openapi: '3.0.0',
            info: {
              title: 'OAS3',
              version: '1.0',
            },
            paths: {
              '/path': {
                $ref: '../test-api/openapi.yaml#/paths/~1path',
              },
            },
            components: {
              securitySchemes: {
                'apiKey-security': {
                  type: 'apiKey',
                  name: 'a name',
                  in: 'header',
                  description: 'a description',
                },
              },
            },
          } as OpenAPIObject,
          [{ 'apiKey-security': [] }],
        ),
      ).toEqual(
        expect.arrayContaining([
          [
            {
              name: 'a name',
              type: 'apiKey',
              in: 'header',
              key: 'apiKey-security',
              description: 'a description',
            },
          ],
        ]),
      );
    });

    describe('single oauth2 security', () => {
      test('with implicit flow', () => {
        expect(
          translateToSecurities(
            {
              openapi: '3.0.0',
              info: {
                title: 'OAS3',
                version: '1.0',
              },
              paths: {
                '/path': {
                  $ref: '../test-api/openapi.yaml#/paths/~1path',
                },
              },
              components: {
                securitySchemes: {
                  'implicit-flow-security': {
                    type: 'oauth2',
                    description: 'a description',
                    flows: {
                      implicit: {
                        authorizationUrl: 'a url',
                        scopes: { scope: 'value' },
                      },
                    },
                  },
                },
              },
            } as OpenAPIObject,
            [{ 'implicit-flow-security': [] }],
          ),
        ).toEqual(
          expect.arrayContaining([
            [
              {
                description: 'a description',
                flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
                key: 'implicit-flow-security',
                type: 'oauth2',
              },
            ],
          ]),
        );
      });

      test('with password flow', () => {
        expect(
          translateToSecurities(
            {
              openapi: '3.0.0',
              info: {
                title: 'OAS3',
                version: '1.0',
              },
              paths: {
                '/path': {
                  $ref: '../test-api/openapi.yaml#/paths/~1path',
                },
              },
              components: {
                securitySchemes: {
                  'password-flow-security': {
                    type: 'oauth2',
                    description: 'a description',
                    flows: {
                      password: {
                        scopes: { scope: 'value' },
                        tokenUrl: 'a token url',
                      },
                    },
                  },
                },
              },
            } as OpenAPIObject,
            [{ 'password-flow-security': [] }],
          ),
        ).toEqual(
          expect.arrayContaining([
            [
              {
                description: 'a description',
                flows: { password: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
                key: 'password-flow-security',
                type: 'oauth2',
              },
            ],
          ]),
        );
      });

      test('with client credentials flow', () => {
        expect(
          translateToSecurities(
            {
              openapi: '3.0.0',
              info: {
                title: 'OAS3',
                version: '1.0',
              },
              paths: {
                '/path': {
                  $ref: '../test-api/openapi.yaml#/paths/~1path',
                },
              },
              components: {
                securitySchemes: {
                  'clientCredentials-flow-security': {
                    type: 'oauth2',
                    description: 'a description',
                    flows: {
                      clientCredentials: {
                        scopes: { scope: 'value' },
                        tokenUrl: 'a token url',
                      },
                    },
                  },
                },
              },
            } as OpenAPIObject,
            [{ 'clientCredentials-flow-security': [] }],
          ),
        ).toEqual(
          expect.arrayContaining([
            [
              {
                description: 'a description',
                flows: { clientCredentials: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
                key: 'clientCredentials-flow-security',
                type: 'oauth2',
              },
            ],
          ]),
        );
      });

      test('with authorizationCode flow', () => {
        expect(
          translateToSecurities(
            {
              openapi: '3.0.0',
              info: {
                title: 'OAS3',
                version: '1.0',
              },
              paths: {
                '/path': {
                  $ref: '../test-api/openapi.yaml#/paths/~1path',
                },
              },
              components: {
                securitySchemes: {
                  'authorizationCode-flow-security': {
                    type: 'oauth2',
                    description: 'a description',
                    flows: {
                      authorizationCode: {
                        scopes: { scope: 'value' },
                        tokenUrl: 'a token url',
                        authorizationUrl: 'an authorization url',
                      },
                    },
                  },
                },
              },
            } as OpenAPIObject,
            [{ 'authorizationCode-flow-security': [] }],
          ),
        ).toEqual(
          expect.arrayContaining([
            [
              {
                description: 'a description',
                flows: {
                  authorizationCode: {
                    tokenUrl: 'a token url',
                    scopes: { scope: 'value' },
                    authorizationUrl: 'an authorization url',
                  },
                },
                key: 'authorizationCode-flow-security',
                type: 'oauth2',
              },
            ],
          ]),
        );
      });
    });

    describe('multiple mixed securities', () => {
      const securitiesObject: OpenAPIObject = {
        openapi: '3.0.0',
        info: {
          title: 'OAS3',
          version: '1.0',
        },
        paths: {
          '/path': {
            $ref: '../test-api/openapi.yaml#/paths/~1path',
          },
        },
        components: {
          securitySchemes: {
            'http-security': {
              type: 'http',
              description: 'a description',
            },
            'implicit-security': {
              type: 'oauth2',
              description: 'a description',
              flows: {
                implicit: {
                  authorizationUrl: 'a url',
                  scopes: { scope: 'value' },
                },
              },
            },
            'api-security': {
              type: 'apiKey',
              name: 'a name',
              in: 'query',
              description: 'a description',
            },
          },
        },
      };

      test('OR relation between security schemes', () => {
        expect(
          translateToSecurities(securitiesObject, [
            { 'http-security': [] },
            { 'implicit-security': [] },
            { 'api-security': [] },
          ]),
        ).toEqual(
          expect.arrayContaining([
            [
              {
                type: 'http',
                description: 'a description',
                key: 'http-security',
              },
            ],
            [
              {
                description: 'a description',
                flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
                key: 'implicit-security',
                type: 'oauth2',
              },
            ],
            [
              {
                name: 'a name',
                type: 'apiKey',
                in: 'query',
                key: 'api-security',
                description: 'a description',
              },
            ],
          ]),
        );
      });

      test('AND relation between security schemes', () => {
        expect(
          translateToSecurities(securitiesObject, [
            { 'http-security': [], 'implicit-security': [], 'api-security': [] },
          ]),
        ).toEqual(
          expect.arrayContaining([
            [
              {
                type: 'http',
                description: 'a description',
                key: 'http-security',
              },
              {
                description: 'a description',
                flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
                key: 'implicit-security',
                type: 'oauth2',
              },
              {
                name: 'a name',
                type: 'apiKey',
                in: 'query',
                key: 'api-security',
                description: 'a description',
              },
            ],
          ]),
        );
      });
    });
  });
});

import { OpenAPIObject } from 'openapi3-ts';

import { translateToSecurities } from '../securities';

describe('securities', () => {
  describe('translateToSecurities', () => {
    it('should return empty if type is invalid', () => {
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
                'invalid-security': {
                  type: 'invalid' as any,
                },
              },
            },
          } as OpenAPIObject,
          [{ 'invalid-security': [] }],
        ),
      ).toEqual([[]]);
    });

    it('should return correct scheme for http basic security', () => {
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
                'basic-security': {
                  type: 'http',
                  description: 'a description',
                  scheme: 'basic',
                },
              },
            },
          } as OpenAPIObject,
          [{ 'basic-security': [] }],
        ),
      ).toEqual([
        [
          {
            key: 'basic-security',
            type: 'http',
            description: 'a description',
            scheme: 'basic',
          },
        ],
      ]);
    });

    it('should return correct scheme for http digest security', () => {
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
                'digest-security': {
                  type: 'http',
                  description: 'a description',
                  scheme: 'digest',
                },
              },
            },
          } as OpenAPIObject,
          [{ 'digest-security': [] }],
        ),
      ).toEqual([
        [
          {
            key: 'digest-security',
            type: 'http',
            description: 'a description',
            scheme: 'digest',
          },
        ],
      ]);
    });

    it('should return correct scheme for http bearer security', () => {
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
                'bearer-security': {
                  type: 'http',
                  description: 'a description',
                  scheme: 'bearer',
                  bearerFormat: 'authorization',
                },
              },
            },
          } as OpenAPIObject,
          [{ 'bearer-security': [] }],
        ),
      ).toEqual([
        [
          {
            key: 'bearer-security',
            type: 'http',
            description: 'a description',
            scheme: 'bearer',
            bearerFormat: 'authorization',
          },
        ],
      ]);
    });

    it('should return correct scheme for openIdConnect security', () => {
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
                'openIdConnect-security': {
                  type: 'openIdConnect',
                  description: 'a description',
                  openIdConnectUrl: 'openIdConnectUrl',
                },
              },
            },
          } as OpenAPIObject,
          [{ 'openIdConnect-security': [] }],
        ),
      ).toEqual([
        [
          {
            key: 'openIdConnect-security',
            type: 'openIdConnect',
            description: 'a description',
            openIdConnectUrl: 'openIdConnectUrl',
          },
        ],
      ]);
    });

    it('should return correct scheme for apiKey security', () => {
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
      ).toEqual([
        [
          {
            name: 'a name',
            type: 'apiKey',
            in: 'header',
            key: 'apiKey-security',
            description: 'a description',
          },
        ],
      ]);
    });

    describe('oauth2 security', () => {
      it('with implicit flow', () => {
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
        ).toEqual([
          [
            {
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
              key: 'implicit-flow-security',
              type: 'oauth2',
            },
          ],
        ]);
      });

      it('with password flow', () => {
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
        ).toEqual([
          [
            {
              description: 'a description',
              flows: { password: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'password-flow-security',
              type: 'oauth2',
            },
          ],
        ]);
      });

      it('with client credentials flow', () => {
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
        ).toEqual([
          [
            {
              description: 'a description',
              flows: { clientCredentials: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'clientCredentials-flow-security',
              type: 'oauth2',
            },
          ],
        ]);
      });

      it('with authorizationCode flow', () => {
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
        ).toEqual([
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
        ]);
      });
    });

    describe('multiple mixed securities', () => {
      const document: OpenAPIObject = {
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

      it('OR relation between security schemes', () => {
        expect(
          translateToSecurities(document, [
            { 'http-security': [] },
            { 'implicit-security': [] },
            { 'api-security': [] },
          ]),
        ).toEqual([
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
        ]);
      });

      it('AND relation between security schemes', () => {
        expect(
          translateToSecurities(document, [{ 'http-security': [], 'implicit-security': [], 'api-security': [] }]),
        ).toEqual([
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
        ]);
      });
    });
  });
});

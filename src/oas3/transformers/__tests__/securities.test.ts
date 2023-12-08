import { DeepPartial } from '@stoplight/types';

import { createContext } from '../../../oas/context';
import { OperationSecurities } from '../../accessors';
import { OpenAPIObject } from '../../types';
import { translateToSecurities as _translateToSecurities } from '../securities';

const translateToSecurities = (document: DeepPartial<OpenAPIObject>, operationSecurities: OperationSecurities) =>
  _translateToSecurities.call(createContext(document), operationSecurities, 'requirement');

describe('securities', () => {
  describe('translateToSecurities', () => {
    it('should return correct scheme for http basic security', () => {
      expect(
        translateToSecurities(
          {
            components: {
              securitySchemes: {
                'basic-security': {
                  type: 'http',
                  description: 'a description',
                  scheme: 'basic',
                },
              },
            },
          },
          [{ 'basic-security': [] }],
        ),
      ).toEqual([
        [
          {
            id: expect.any(String),
            key: 'basic-security',
            type: 'http',
            description: 'a description',
            scheme: 'basic',
            extensions: {},
          },
        ],
      ]);
    });

    it('should return correct scheme for http digest security', () => {
      expect(
        translateToSecurities(
          {
            components: {
              securitySchemes: {
                'digest-security': {
                  type: 'http',
                  description: 'a description',
                  scheme: 'digest',
                },
              },
            },
          },
          [{ 'digest-security': [] }],
        ),
      ).toEqual([
        [
          {
            id: expect.any(String),
            key: 'digest-security',
            type: 'http',
            description: 'a description',
            scheme: 'digest',
            extensions: {},
          },
        ],
      ]);
    });

    it('should return correct scheme for http bearer security', () => {
      expect(
        translateToSecurities(
          {
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
          },
          [{ 'bearer-security': [] }],
        ),
      ).toEqual([
        [
          {
            id: expect.any(String),
            key: 'bearer-security',
            type: 'http',
            description: 'a description',
            scheme: 'bearer',
            bearerFormat: 'authorization',
            extensions: {},
          },
        ],
      ]);
    });

    it('should return correct scheme for openIdConnect security', () => {
      expect(
        translateToSecurities(
          {
            components: {
              securitySchemes: {
                'openIdConnect-security': {
                  type: 'openIdConnect',
                  description: 'a description',
                  openIdConnectUrl: 'openIdConnectUrl',
                },
              },
            },
          },
          [{ 'openIdConnect-security': [] }],
        ),
      ).toEqual([
        [
          {
            id: expect.any(String),
            key: 'openIdConnect-security',
            type: 'openIdConnect',
            description: 'a description',
            openIdConnectUrl: 'openIdConnectUrl',
            extensions: {},
          },
        ],
      ]);
    });

    it('should return correct scheme for apiKey security', () => {
      expect(
        translateToSecurities(
          {
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
          },
          [{ 'apiKey-security': [] }],
        ),
      ).toEqual([
        [
          {
            id: expect.any(String),
            name: 'a name',
            type: 'apiKey',
            in: 'header',
            key: 'apiKey-security',
            description: 'a description',
            extensions: {},
          },
        ],
      ]);
    });

    it('should lowercase the http security scheme', () => {
      expect(
        translateToSecurities(
          {
            components: {
              securitySchemes: {
                'basic-security': {
                  type: 'http',
                  description: 'a description',
                  scheme: 'BASIC',
                },
              },
            },
          },
          [{ 'basic-security': [] }],
        ),
      ).toEqual([
        [
          {
            id: expect.any(String),
            key: 'basic-security',
            type: 'http',
            description: 'a description',
            scheme: 'basic',
            extensions: {},
          },
        ],
      ]);
    });

    it('should maintain x extensions', () => {
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
              'x-security-extension': {
                hello: 'world',
              },
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
              'x-security-extension': {
                hello: 'world',
              },
            },
            'api-security': {
              type: 'apiKey',
              name: 'a name',
              in: 'query',
              description: 'a description',
              'x-security-extension': {
                hello: 'world',
              },
            },
          },
        },
      };

      expect(
        translateToSecurities(document, [
          { 'http-security': [] },
          { 'implicit-security': ['scope'] },
          { 'api-security': [] },
        ]),
      ).toEqual([
        [
          {
            id: expect.any(String),
            type: 'http',
            description: 'a description',
            key: 'http-security',
            extensions: {
              'x-security-extension': {
                hello: 'world',
              },
            },
          },
        ],
        [
          {
            id: expect.any(String),
            description: 'a description',
            flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
            key: 'implicit-security',
            type: 'oauth2',
            extensions: {
              'x-security-extension': {
                hello: 'world',
              },
            },
          },
        ],
        [
          {
            id: expect.any(String),
            name: 'a name',
            type: 'apiKey',
            in: 'query',
            key: 'api-security',
            description: 'a description',
            extensions: {
              'x-security-extension': {
                hello: 'world',
              },
            },
          },
        ],
      ]);
    });

    describe('oauth2 security', () => {
      it('with implicit flow', () => {
        expect(
          translateToSecurities(
            {
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
            },
            [{ 'implicit-flow-security': ['scope'] }],
          ),
        ).toEqual([
          [
            {
              id: expect.any(String),
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
              key: 'implicit-flow-security',
              type: 'oauth2',
              extensions: {},
            },
          ],
        ]);
      });

      it('with password flow', () => {
        expect(
          translateToSecurities(
            {
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
            },
            [{ 'password-flow-security': ['scope'] }],
          ),
        ).toEqual([
          [
            {
              id: expect.any(String),
              description: 'a description',
              flows: { password: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'password-flow-security',
              type: 'oauth2',
              extensions: {},
            },
          ],
        ]);
      });

      it('with client credentials flow', () => {
        expect(
          translateToSecurities(
            {
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
            },
            [{ 'clientCredentials-flow-security': ['scope'] }],
          ),
        ).toEqual([
          [
            {
              id: expect.any(String),
              description: 'a description',
              flows: { clientCredentials: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'clientCredentials-flow-security',
              type: 'oauth2',
              extensions: {},
            },
          ],
        ]);
      });

      it('with authorizationCode flow', () => {
        expect(
          translateToSecurities(
            {
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
            },
            [{ 'authorizationCode-flow-security': ['scope'] }],
          ),
        ).toEqual([
          [
            {
              id: expect.any(String),
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
              extensions: {},
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
            { 'implicit-security': ['scope'] },
            { 'api-security': [] },
          ]),
        ).toEqual([
          [
            {
              id: expect.any(String),
              type: 'http',
              description: 'a description',
              key: 'http-security',
              extensions: {},
            },
          ],
          [
            {
              id: expect.any(String),
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
              key: 'implicit-security',
              type: 'oauth2',
              extensions: {},
            },
          ],
          [
            {
              id: expect.any(String),
              name: 'a name',
              type: 'apiKey',
              in: 'query',
              key: 'api-security',
              description: 'a description',
              extensions: {},
            },
          ],
        ]);
      });

      it('AND relation between security schemes', () => {
        expect(
          translateToSecurities(document, [
            { 'http-security': [], 'implicit-security': ['scope'], 'api-security': [] },
          ]),
        ).toEqual([
          [
            {
              id: expect.any(String),
              type: 'http',
              description: 'a description',
              key: 'http-security',
              extensions: {},
            },
            {
              id: expect.any(String),
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
              key: 'implicit-security',
              type: 'oauth2',
              extensions: {},
            },
            {
              id: expect.any(String),
              name: 'a name',
              type: 'apiKey',
              in: 'query',
              key: 'api-security',
              description: 'a description',
              extensions: {},
            },
          ],
        ]);
      });
    });
  });
});

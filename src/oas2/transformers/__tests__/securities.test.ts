import { Spec } from 'swagger-schema-official';

import { translateToSecurities } from '../securities';

describe('securities', () => {
  describe('translateToSecurities', () => {
    test('single basic security', () => {
      expect(
        translateToSecurities(
          {
            securityDefinitions: {
              'basic-security': {
                type: 'basic',
                description: 'a description',
              },
            },
          },
          [{ 'basic-security': [] }],
        ),
      ).toEqual([
        [
          {
            scheme: 'basic',
            type: 'http',
            description: 'a description',
            key: 'basic-security',
          },
        ],
      ]);
    });

    test('single apiKey security', () => {
      expect(
        translateToSecurities(
          {
            securityDefinitions: {
              'apiKey-security': {
                type: 'apiKey',
                name: 'a name',
                in: 'header',
                description: 'a description',
              },
            },
          },
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

    describe('single oauth2 security', () => {
      test('with implicit flow', () => {
        expect(
          translateToSecurities(
            {
              securityDefinitions: {
                'implicit-flow-security': {
                  type: 'oauth2',
                  description: 'a description',
                  authorizationUrl: 'a url',
                  scopes: { scope: 'value' },
                  flow: 'implicit',
                },
              },
            },
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

      test('with password flow', () => {
        expect(
          translateToSecurities(
            {
              securityDefinitions: {
                'password-flow-security': {
                  type: 'oauth2',
                  description: 'a description',
                  flow: 'password',
                  scopes: { scope: 'value' },
                  tokenUrl: 'a token url',
                },
              },
            },
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

      test('with application flow', () => {
        expect(
          translateToSecurities(
            {
              securityDefinitions: {
                'application-flow-security': {
                  type: 'oauth2',
                  description: 'a description',
                  flow: 'application',
                  scopes: { scope: 'value' },
                  tokenUrl: 'a token url',
                },
              },
            },
            [{ 'application-flow-security': [] }],
          ),
        ).toEqual([
          [
            {
              description: 'a description',
              flows: { clientCredentials: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'application-flow-security',
              type: 'oauth2',
            },
          ],
        ]);
      });

      test('with accessCode flow', () => {
        expect(
          translateToSecurities(
            {
              securityDefinitions: {
                'accessCode-flow-security': {
                  type: 'oauth2',
                  description: 'a description',
                  flow: 'accessCode',
                  scopes: { scope: 'value' },
                  tokenUrl: 'a token url',
                  authorizationUrl: 'an authorization url',
                },
              },
            },
            [{ 'accessCode-flow-security': [] }],
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
              key: 'accessCode-flow-security',
              type: 'oauth2',
            },
          ],
        ]);
      });
    });

    describe('multiple mixed securities', () => {
      const document: Partial<Spec> = {
        securityDefinitions: {
          'basic-security': {
            type: 'basic',
            description: 'a description',
          },
          'implicit-security': {
            type: 'oauth2',
            description: 'a description',
            authorizationUrl: 'a url',
            flow: 'implicit',
            scopes: { scope: 'value' },
          },
          'api-security': {
            type: 'apiKey',
            description: 'a description',
            in: 'query',
            name: 'a name',
          },
        },
      };

      test('OR relation between security schemes', () => {
        expect(
          translateToSecurities(document, [
            { 'basic-security': [] },
            { 'implicit-security': [] },
            { 'api-security': [] },
          ]),
        ).toEqual([
          [
            {
              scheme: 'basic',
              type: 'http',
              description: 'a description',
              key: 'basic-security',
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

      test('AND relation between security schemes', () => {
        expect(
          translateToSecurities(document, [{ 'basic-security': [], 'implicit-security': [], 'api-security': [] }]),
        ).toEqual([
          [
            {
              scheme: 'basic',
              type: 'http',
              description: 'a description',
              key: 'basic-security',
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

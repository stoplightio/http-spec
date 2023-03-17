import { DeepPartial } from '@stoplight/types';
import { Spec } from 'swagger-schema-official';

import { createContext } from '../../../oas/context';
import { translateToSecurities as _translateToSecurities } from '../securities';

const translateToSecurities = (document: DeepPartial<Spec>, ...params: Parameters<typeof _translateToSecurities>) =>
  _translateToSecurities.call(createContext(document), ...params);

describe('securities', () => {
  describe('translateToSecurities', () => {
    it('should return empty for invalid security type', () => {
      expect(
        translateToSecurities(
          {
            securityDefinitions: {
              'invalid-security': {
                type: 'invalid' as any,
              },
            },
          },
          [{ 'invalid-security': [] }],
        ),
      ).toEqual([[]]);
    });

    it('should return correct scheme for basic security', () => {
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
            id: expect.any(String),
            scheme: 'basic',
            type: 'http',
            description: 'a description',
            key: 'basic-security',
            extensions: {},
          },
        ],
      ]);
    });

    it('should return correct scheme for apiKey security', () => {
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

    it('should return empty string for apiKey security without name', () => {
      expect(
        translateToSecurities(
          {
            securityDefinitions: {
              'apiKey-security': {
                type: 'apiKey',
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
            id: expect.any(String),
            name: '',
            type: 'apiKey',
            in: 'header',
            key: 'apiKey-security',
            description: 'a description',
            extensions: {},
          },
        ],
      ]);
    });

    it('should return empty for apiKey security with invalid in', () => {
      expect(
        translateToSecurities(
          {
            securityDefinitions: {
              'apiKey-security': {
                type: 'apiKey',
                in: 'invalid' as any,
              },
            },
          },
          [{ 'apiKey-security': [] }],
        ),
      ).toEqual([[]]);
    });

    it('should maintain x-extensions', () => {
      const document: any = {
        securityDefinitions: {
          'basic-security': {
            type: 'basic',
            description: 'a description',
            'x-security-extension': {
              hello: 'world',
            },
          },
          'implicit-security': {
            type: 'oauth2',
            description: 'a description',
            authorizationUrl: 'a url',
            flow: 'implicit',
            scopes: { scope: 'value' },
            'x-security-extension': {
              hello: 'world',
            },
          },
          'api-security': {
            type: 'apiKey',
            description: 'a description',
            in: 'query',
            name: 'a name',
            'x-security-extension': {
              hello: 'world',
            },
          },
        },
      };
      expect(
        translateToSecurities(document, [
          { 'basic-security': [] },
          { 'implicit-security': [] },
          { 'api-security': [] },
        ]),
      ).toEqual([
        [
          {
            id: expect.any(String),
            scheme: 'basic',
            type: 'http',
            description: 'a description',
            key: 'basic-security',
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

    describe('single oauth2 security', () => {
      it('implicit flow with scopes', () => {
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

      it('implicit flow without scopes', () => {
        expect(
          translateToSecurities(
            {
              securityDefinitions: {
                'implicit-flow-security': {
                  type: 'oauth2',
                  description: 'a description',
                  authorizationUrl: 'a url',
                  flow: 'implicit',
                },
              },
            },
            [{ 'implicit-flow-security': [] }],
          ),
        ).toEqual([
          [
            {
              id: expect.any(String),
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: {} } },
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

      it('with application flow', () => {
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
              id: expect.any(String),
              description: 'a description',
              flows: { clientCredentials: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'application-flow-security',
              type: 'oauth2',
              extensions: {},
            },
          ],
        ]);
      });

      it('with accessCode flow', () => {
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
              id: expect.any(String),
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
              extensions: {},
            },
          ],
        ]);
      });

      it('with invalid flow', () => {
        expect(
          translateToSecurities(
            {
              securityDefinitions: {
                'accessCode-flow-security': {
                  type: 'oauth2',
                  flow: 'invalid-flow' as any,
                },
              },
            },
            [{ 'accessCode-flow-security': [] }],
          ),
        ).toEqual([[]]);
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

      it('OR relation between security schemes', () => {
        expect(
          translateToSecurities(document, [
            { 'basic-security': [] },
            { 'implicit-security': [] },
            { 'api-security': [] },
          ]),
        ).toEqual([
          [
            {
              id: expect.any(String),
              scheme: 'basic',
              type: 'http',
              description: 'a description',
              key: 'basic-security',
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
          translateToSecurities(document, [{ 'basic-security': [], 'implicit-security': [], 'api-security': [] }]),
        ).toEqual([
          [
            {
              id: expect.any(String),
              scheme: 'basic',
              type: 'http',
              description: 'a description',
              key: 'basic-security',
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

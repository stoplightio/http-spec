import { DeepPartial } from '@stoplight/types';
import { Spec } from 'swagger-schema-official';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import { translateToSecurities as _translateToSecurities } from '../securities';

const translateToSecurities = (document: DeepPartial<Spec>, ...params: Parameters<typeof _translateToSecurities>) =>
  _translateToSecurities.call(createContext(document, DEFAULT_ID_GENERATOR), ...params);

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
            scheme: 'basic',
            type: 'http',
            description: 'a description',
            key: 'basic-security',
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
            name: 'a name',
            type: 'apiKey',
            in: 'header',
            key: 'apiKey-security',
            description: 'a description',
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
            name: '',
            type: 'apiKey',
            in: 'header',
            key: 'apiKey-security',
            description: 'a description',
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
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: { scope: 'value' } } },
              key: 'implicit-flow-security',
              type: 'oauth2',
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
              description: 'a description',
              flows: { implicit: { authorizationUrl: 'a url', scopes: {} } },
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
              description: 'a description',
              flows: { clientCredentials: { tokenUrl: 'a token url', scopes: { scope: 'value' } } },
              key: 'application-flow-security',
              type: 'oauth2',
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

      it('AND relation between security schemes', () => {
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

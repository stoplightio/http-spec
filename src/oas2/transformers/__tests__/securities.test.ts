import {
  ApiKeySecurity,
  BasicAuthenticationSecurity,
  OAuth2AccessCodeSecurity,
  OAuth2ApplicationSecurity,
  OAuth2ImplicitSecurity,
  OAuth2PasswordSecurity,
} from 'swagger-schema-official';

import { translateToSecurities } from '../securities';

describe('securities', () => {
  describe('translateToSecurities', () => {
    test('single basic security', () => {
      const security: BasicAuthenticationSecurity = {
        type: 'basic',
        description: 'a description',
      };
      expect(translateToSecurities([security])).toMatchSnapshot();
    });

    test('single apiKey security', () => {
      const security: ApiKeySecurity = {
        type: 'apiKey',
        description: 'a description',
        in: 'query',
        name: 'a name',
      };
      expect(translateToSecurities([security])).toMatchSnapshot();
    });

    describe('single oauth2 security', () => {
      test('with implicit flow', () => {
        const security: OAuth2ImplicitSecurity = {
          type: 'oauth2',
          description: 'a description',
          authorizationUrl: 'a url',
          // @ts-ignore - OAuth2ImplicitSecurity misses scopes but oas2 supports it
          scopes: { scope: 'value' },
          flow: 'implicit',
        };
        expect(translateToSecurities([security])).toMatchSnapshot();
      });

      test('with password flow', () => {
        const security: OAuth2PasswordSecurity = {
          type: 'oauth2',
          description: 'a description',
          flow: 'password',
          scopes: { scope: 'value' },
          tokenUrl: 'a token url',
        };
        expect(translateToSecurities([security])).toMatchSnapshot();
      });

      test('with application flow', () => {
        const security: OAuth2ApplicationSecurity = {
          type: 'oauth2',
          description: 'a description',
          flow: 'application',
          scopes: { scope: 'value' },
          tokenUrl: 'a token url',
        };
        expect(translateToSecurities([security])).toMatchSnapshot();
      });

      test('with accessCode flow', () => {
        const security: OAuth2AccessCodeSecurity = {
          type: 'oauth2',
          description: 'a description',
          flow: 'accessCode',
          scopes: { scope: 'value' },
          tokenUrl: 'a token url',
          authorizationUrl: 'an authorization url',
        };
        expect(translateToSecurities([security])).toMatchSnapshot();
      });
    });

    test('multiple mixed securities', () => {
      const basicSecurity: BasicAuthenticationSecurity = {
        type: 'basic',
        description: 'a description',
      };
      const implicitSecurity: OAuth2ImplicitSecurity = {
        type: 'oauth2',
        description: 'a description',
        authorizationUrl: 'a url',
        flow: 'implicit',
      };
      const apiSecurity: ApiKeySecurity = {
        type: 'apiKey',
        description: 'a description',
        in: 'query',
        name: 'a name',
      };

      expect(translateToSecurities([basicSecurity, implicitSecurity, apiSecurity])).toMatchSnapshot();
    });
  });
});

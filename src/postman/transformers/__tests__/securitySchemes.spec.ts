import { HttpParamStyles } from '@stoplight/types/dist';
import { RequestAuth, RequestAuthDefinition } from 'postman-collection';
import { transformSecurityScheme } from '../securityScheme';

describe('transformSecurityScheme()', () => {
  describe('given basic auth', () => {
    it('transforms to standard security scheme of type http/basic', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'basic',
            basic: [
              {
                key: 'password',
                value: 'baton',
                type: 'string',
              },
              {
                key: 'username',
                value: 'liwko',
                type: 'string',
              },
            ],
          } as RequestAuthDefinition),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'securityScheme',
        securityScheme: {
          key: 'auth-http',
          type: 'http',
          scheme: 'basic',
        },
      });
    });
  });

  describe('given digest auth', () => {
    it('transforms to standard security scheme of type http/digest', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'digest',
            basic: [
              {
                key: 'username',
                value: 'liwko',
                type: 'string',
              },
              {
                key: 'password',
                value: 'baton',
                type: 'string',
              },
              {
                key: 'algorithm',
                value: 'MD5',
                type: 'string',
              },
            ],
          } as RequestAuthDefinition),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'securityScheme',
        securityScheme: {
          key: 'auth-http',
          type: 'http',
          scheme: 'digest',
        },
      });
    });
  });

  describe('given bearer auth', () => {
    it('transforms to standard security scheme of type http/bearer', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'bearer',
            bearer: [
              {
                key: 'token',
                value: 'TestToken',
                type: 'string',
              },
            ],
          } as RequestAuthDefinition),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'securityScheme',
        securityScheme: {
          key: 'auth-http',
          type: 'http',
          scheme: 'bearer',
        },
      });
    });
  });

  describe('given apikey auth', () => {
    describe('"in" set to query explicitly', () => {
      it('transforms to standard security scheme of type apiKey', () => {
        expect(
          transformSecurityScheme(
            new RequestAuth({
              type: 'apikey',
              apikey: [
                {
                  key: 'in',
                  value: 'query',
                  type: 'string',
                },
                {
                  key: 'value',
                  value: 'abc',
                  type: 'string',
                },
                {
                  key: 'key',
                  value: 'TestApiKey',
                  type: 'string',
                },
              ],
            } as RequestAuthDefinition),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'securityScheme',
          securityScheme: {
            key: 'auth-apiKey',
            type: 'apiKey',
            name: 'TestApiKey',
            in: 'query',
          },
        });
      });
    });

    describe('"in" not set', () => {
      it('transforms to standard security scheme of type apiKey', () => {
        expect(
          transformSecurityScheme(
            new RequestAuth({
              type: 'apikey',
              apikey: [
                {
                  key: 'value',
                  value: 'abc',
                  type: 'string',
                },
                {
                  key: 'key',
                  value: 'TestApiKey',
                  type: 'string',
                },
              ],
            } as RequestAuthDefinition),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'securityScheme',
          securityScheme: {
            key: 'auth-apiKey',
            type: 'apiKey',
            name: 'TestApiKey',
            in: 'header',
          },
        });
      });
    });
  });

  describe('given oauth1 auth', () => {
    const params = (addParamsToHeader: boolean) => [
      { key: 'addParamsToHeader', value: addParamsToHeader, type: 'boolean' },
      { key: 'realm', value: 'karol@stoplight.io', type: 'string' },
      { key: 'nonce', value: 'Nonce', type: 'string' },
      { key: 'timestamp', value: '123123123123', type: 'string' },
      { key: 'tokenSecret', value: 'TokenSecret', type: 'string' },
      { key: 'token', value: 'AccessToken', type: 'string' },
      { key: 'consumerSecret', value: 'ConsumerSecret', type: 'string' },
      { key: 'consumerKey', value: 'ConsumerKey', type: 'string' },
      { key: 'signatureMethod', value: 'HMAC-SHA1', type: 'string' },
      { key: 'version', value: '1.0', type: 'string' },
      { key: 'addEmptyParamsToSign', value: false, type: 'boolean' },
    ];

    describe('parameters in header', () => {
      it('transforms to header security scheme', () => {
        expect(
          transformSecurityScheme(
            new RequestAuth({
              type: 'oauth1',
              oauth1: params(true),
            } as RequestAuthDefinition),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'headerParams',
          headerParams: [
            {
              name: 'Authorization',
              style: HttpParamStyles.Simple,
              description: 'OAuth1 Authorization Header',
              required: true,
            },
          ],
        });
      });
    });

    describe('parameters in query', () => {
      it('transforms to query security scheme', () => {
        expect(
          transformSecurityScheme(
            new RequestAuth({
              type: 'oauth1',
              oauth1: params(false),
            } as RequestAuthDefinition),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'queryParams',
          queryParams: [
            { name: 'oauth_consumer_key', style: HttpParamStyles.Form, required: true },
            { name: 'oauth_token', style: HttpParamStyles.Form, required: true },
            {
              name: 'oauth_signature_method',
              style: HttpParamStyles.Form,
              required: true,
              examples: [{ key: 'signature_method', value: 'HMAC-SHA1' }],
            },
            { name: 'oauth_timestamp', style: HttpParamStyles.Form, required: true, schema: { type: 'integer' } },
            { name: 'oauth_nonce', style: HttpParamStyles.Form, required: true },
            {
              name: 'oauth_version',
              style: HttpParamStyles.Form,
              required: true,
              examples: [{ key: 'version', value: '1.0' }],
            },
            { name: 'oauth_signature', style: HttpParamStyles.Form, required: true },
          ],
        });
      });
    });
  });

  describe('given oauth2 auth', () => {
    describe('access token in header', () => {
      it('transforms to header security scheme', () => {
        expect(
          transformSecurityScheme(
            new RequestAuth({
              type: 'oauth2',
              oauth2: [
                {
                  key: 'addTokenTo',
                  value: 'header',
                  type: 'string',
                },
                {
                  key: 'accessToken',
                  value: '123',
                  type: 'string',
                },
              ],
            } as RequestAuthDefinition),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'securityScheme',
          securityScheme: {
            key: 'auth-oauth2',
            scheme: 'bearer',
            type: 'http',
            description: 'OAuth2 Access Token',
          },
        });
      });
    });

    describe('access token in query', () => {
      it('transforms to query security scheme', () => {
        expect(
          transformSecurityScheme(
            new RequestAuth({
              type: 'oauth2',
              oauth2: [
                {
                  key: 'addTokenTo',
                  value: 'queryParams',
                  type: 'string',
                },
                {
                  key: 'accessToken',
                  value: '123',
                  type: 'string',
                },
              ],
            } as RequestAuthDefinition),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'queryParams',
          queryParams: [
            {
              name: 'access_token',
              style: HttpParamStyles.Form,
              description: 'OAuth2 Access Token',
              required: true,
            },
          ],
        });
      });
    });
  });

  describe('given hawk auth', () => {
    it('transforms to header security scheme', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'hawk',
            hawk: [
              { key: 'timestamp', value: '123123123123', type: 'string' },
              { key: 'delegation', value: 'Dlg', type: 'string' },
              { key: 'app', value: 'App', type: 'string' },
              { key: 'extraData', value: 'Ext', type: 'string' },
              { key: 'nonce', value: 'Nonce', type: 'string' },
              { key: 'user', value: 'Username', type: 'string' },
              { key: 'authKey', value: 'HawkAuthKey', type: 'string' },
              { key: 'authId', value: 'HawkAuthId', type: 'string' },
              { key: 'algorithm', value: 'sha256', type: 'string' },
            ],
          } as RequestAuthDefinition),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            description: 'Hawk Authorization Header',
            required: true,
            schema: {
              type: 'string',
              pattern: '^Hawk .+$',
            },
          },
        ],
      });
    });
  });

  describe('given awsv4 auth', () => {
    it('transforms to header security scheme', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'awsv4',
            awsv4: [
              { key: 'sessionToken', value: 'TestSessionToken', type: 'string' },
              { key: 'service', value: 'TestS3', type: 'string' },
              { key: 'region', value: 'TestRegion', type: 'string' },
              { key: 'secretKey', value: 'TestSecretKey', type: 'string' },
              { key: 'accessKey', value: 'TestAccessKey', type: 'string' },
            ],
          } as RequestAuthDefinition),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            name: 'X-Amz-Security-Token',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            name: 'X-Amz-Date',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            required: true,
            description: 'AWS v4 Authorization Header',
          },
        ],
      });
    });
  });

  describe('given edgegrid auth', () => {
    it('transforms to header security scheme', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'edgegrid',
            edgegrid: [
              { key: 'headersToSign', value: 'TestHeader', type: 'string' },
              { key: 'baseURL', value: 'http://example.com', type: 'string' },
              { key: 'timestamp', value: '123123123123', type: 'string' },
              { key: 'nonce', value: 'TestNonce', type: 'string' },
              { key: 'clientSecret', value: 'TestClientSecret', type: 'string' },
              { key: 'clientToken', value: 'TestClientToken', type: 'string' },
              { key: 'accessToken', value: 'TestAccessToken', type: 'string' },
            ],
          } as RequestAuthDefinition),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            description: 'Akamai EdgeGrid Authorization Header',
            required: true,
          },
        ],
      });
    });
  });

  it('omits noauth', () => {
    expect(
      transformSecurityScheme(new RequestAuth({ type: 'noauth' } as RequestAuthDefinition), () => 'a'),
    ).toBeUndefined();
  });
});
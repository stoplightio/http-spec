import { HttpParamStyles } from '@stoplight/types';
import { Collection, RequestAuth, RequestAuthDefinition } from 'postman-collection';

import {
  isPostmanSecuritySchemeEqual,
  PostmanSecurityScheme,
  transformSecurityScheme,
  transformSecuritySchemes,
} from '../securityScheme';

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
          }),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'securityScheme',
        securityScheme: {
          id: expect.any(String),
          key: 'auth-http',
          type: 'http',
          scheme: 'basic',
          extensions: {},
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
          }),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'securityScheme',
        securityScheme: {
          id: expect.any(String),
          key: 'auth-http',
          type: 'http',
          scheme: 'digest',
          extensions: {},
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
          id: expect.any(String),
          key: 'auth-http',
          type: 'http',
          scheme: 'bearer',
          extensions: {},
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
            }),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'securityScheme',
          securityScheme: {
            id: expect.any(String),
            key: 'auth-apiKey',
            type: 'apiKey',
            name: 'TestApiKey',
            in: 'query',
            extensions: {},
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
            }),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'securityScheme',
          securityScheme: {
            id: expect.any(String),
            key: 'auth-apiKey',
            type: 'apiKey',
            name: 'TestApiKey',
            in: 'header',
            extensions: {},
          },
        });
      });
    });
  });

  describe('given oauth1 auth', () => {
    const params = (addParamsToHeader: boolean, addEmptyParamsToSign: boolean) => [
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
      { key: 'addEmptyParamsToSign', value: addEmptyParamsToSign, type: 'boolean' },
    ];

    describe('parameters in header', () => {
      describe('all parameters are defined', () => {
        it('transforms to header security scheme', () => {
          expect(
            transformSecurityScheme(
              new RequestAuth({
                type: 'oauth1',
                oauth1: params(true, true),
              }),
              type => `auth-${type}`,
            ),
          ).toEqual({
            type: 'headerParams',
            headerParams: [
              {
                id: expect.any(String),
                name: 'Authorization',
                style: HttpParamStyles.Simple,
                description: 'OAuth1 Authorization Header',
                required: true,
                examples: [
                  {
                    id: expect.any(String),
                    key: 'default',
                    value:
                      'OAuth realm="karol@stoplight.io",oauth_consumer_key="a_consumer_key",oauth_token="a_token",oauth_signature_method="HMAC-SHA1",oauth_timestamp="123123123123",oauth_nonce="a",oauth_version="1.0",oauth_signature="a_signature"',
                  },
                ],
              },
            ],
          });
        });
      });

      describe('some parameters are not defined', () => {
        it('transforms to header security scheme with some parameters set to defaults', () => {
          expect(
            transformSecurityScheme(
              new RequestAuth({
                type: 'oauth1',
                oauth1: params(true, true).filter(
                  ({ key }) => !['realm', 'timestamp', 'signatureMethod'].includes(key),
                ),
              }),
              type => `auth-${type}`,
            ),
          ).toEqual({
            type: 'headerParams',
            headerParams: [
              {
                id: expect.any(String),
                name: 'Authorization',
                style: HttpParamStyles.Simple,
                description: 'OAuth1 Authorization Header',
                required: true,
                examples: [
                  {
                    id: expect.any(String),
                    key: 'default',
                    value:
                      'OAuth realm="a_realm",oauth_consumer_key="a_consumer_key",oauth_token="a_token",oauth_signature_method="HMAC-SHA1",oauth_timestamp="0",oauth_nonce="a",oauth_version="1.0",oauth_signature="a_signature"',
                  },
                ],
              },
            ],
          });
        });
      });
    });

    describe('parameters in query', () => {
      describe('addEmptyParamsToSign is true', () => {
        describe('all parameters are defined', () => {
          it('transforms to query security scheme with required properties', () => {
            expect(
              transformSecurityScheme(
                new RequestAuth({
                  type: 'oauth1',
                  oauth1: params(false, true),
                }),
                type => `auth-${type}`,
              ),
            ).toEqual({
              type: 'queryParams',
              queryParams: [
                { id: expect.any(String), name: 'oauth_consumer_key', style: HttpParamStyles.Form, required: false },
                { id: expect.any(String), name: 'oauth_token', style: HttpParamStyles.Form, required: false },
                {
                  id: expect.any(String),
                  name: 'oauth_signature_method',
                  style: HttpParamStyles.Form,
                  required: false,
                  examples: [{ id: expect.any(String), key: 'default', value: 'HMAC-SHA1' }],
                },
                {
                  id: expect.any(String),
                  name: 'oauth_timestamp',
                  style: HttpParamStyles.Form,
                  required: false,
                  schema: { type: 'string' },
                  examples: [{ id: expect.any(String), key: 'default', value: '123123123123' }],
                },
                { id: expect.any(String), name: 'oauth_nonce', style: HttpParamStyles.Form, required: false },
                {
                  id: expect.any(String),
                  name: 'oauth_version',
                  style: HttpParamStyles.Form,
                  required: false,
                  examples: [{ id: expect.any(String), key: 'default', value: '1.0' }],
                },
                { id: expect.any(String), name: 'oauth_signature', style: HttpParamStyles.Form, required: false },
              ],
            });
          });
        });

        describe('some parameters are not defined', () => {
          it('transforms to header security scheme with some parameters set to defaults', () => {
            expect(
              transformSecurityScheme(
                new RequestAuth({
                  type: 'oauth1',
                  oauth1: params(false, true).filter(
                    ({ key }) => !['version', 'timestamp', 'signatureMethod'].includes(key),
                  ),
                }),
                type => `auth-${type}`,
              ),
            ).toEqual({
              type: 'queryParams',
              queryParams: [
                { id: expect.any(String), name: 'oauth_consumer_key', style: HttpParamStyles.Form, required: false },
                { id: expect.any(String), name: 'oauth_token', style: HttpParamStyles.Form, required: false },
                {
                  id: expect.any(String),
                  name: 'oauth_signature_method',
                  style: HttpParamStyles.Form,
                  required: false,
                  examples: [],
                },
                {
                  id: expect.any(String),
                  name: 'oauth_timestamp',
                  style: HttpParamStyles.Form,
                  required: false,
                  schema: { type: 'string' },
                  examples: [],
                },
                { id: expect.any(String), name: 'oauth_nonce', style: HttpParamStyles.Form, required: false },
                {
                  id: expect.any(String),
                  name: 'oauth_version',
                  style: HttpParamStyles.Form,
                  required: false,
                  examples: [],
                },
                { id: expect.any(String), name: 'oauth_signature', style: HttpParamStyles.Form, required: false },
              ],
            });
          });
        });
      });

      describe('addEmptyParamsToSign is false', () => {
        it('transforms to query security scheme with nullable properties', () => {
          expect(
            transformSecurityScheme(
              new RequestAuth({
                type: 'oauth1',
                oauth1: params(false, false),
              }),
              type => `auth-${type}`,
            ),
          ).toEqual({
            type: 'queryParams',
            queryParams: [
              { id: expect.any(String), name: 'oauth_consumer_key', style: HttpParamStyles.Form, required: true },
              { id: expect.any(String), name: 'oauth_token', style: HttpParamStyles.Form, required: true },
              {
                id: expect.any(String),
                name: 'oauth_signature_method',
                style: HttpParamStyles.Form,
                required: true,
                examples: [{ id: expect.any(String), key: 'default', value: 'HMAC-SHA1' }],
              },
              {
                id: expect.any(String),
                name: 'oauth_timestamp',
                style: HttpParamStyles.Form,
                required: true,
                schema: { type: 'string' },
                examples: [{ id: expect.any(String), key: 'default', value: '123123123123' }],
              },
              { id: expect.any(String), name: 'oauth_nonce', style: HttpParamStyles.Form, required: true },
              {
                id: expect.any(String),
                name: 'oauth_version',
                style: HttpParamStyles.Form,
                required: true,
                examples: [{ id: expect.any(String), key: 'default', value: '1.0' }],
              },
              { id: expect.any(String), name: 'oauth_signature', style: HttpParamStyles.Form, required: true },
            ],
          });
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
            }),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'securityScheme',
          securityScheme: {
            id: expect.any(String),
            key: 'auth-oauth2',
            description: 'OAuth2 Access Token',
            scheme: 'bearer',
            type: 'http',
            extensions: {},
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
            }),
            type => `auth-${type}`,
          ),
        ).toEqual({
          type: 'queryParams',
          queryParams: [
            {
              id: expect.any(String),
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
          }),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            id: expect.any(String),
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
          }),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            id: expect.any(String),
            name: 'X-Amz-Security-Token',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            id: expect.any(String),
            name: 'X-Amz-Date',
            style: HttpParamStyles.Simple,
            required: true,
          },
          {
            id: expect.any(String),
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
          }),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            id: expect.any(String),
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            description: 'Akamai EdgeGrid Authorization Header',
            required: true,
          },
        ],
      });
    });
  });

  describe('given ntlm auth', () => {
    it('transforms to header security scheme', () => {
      expect(
        transformSecurityScheme(
          new RequestAuth({
            type: 'ntlm',
            ntlm: [
              { key: 'workstation', value: 'Karol-MacBook', type: 'string' },
              { key: 'domain', value: 'example.com', type: 'string' },
              { key: 'password', value: '1235', type: 'string' },
              { key: 'username', value: 'Karol', type: 'string' },
            ],
          }),
          type => `auth-${type}`,
        ),
      ).toEqual({
        type: 'headerParams',
        headerParams: [
          {
            id: expect.any(String),
            name: 'Authorization',
            style: HttpParamStyles.Simple,
            description: 'NTLM Authorization Header',
            required: true,
            schema: {
              type: 'string',
              pattern: '^NTLM .+$',
            },
          },
        ],
      });
    });
  });

  it('ignores noauth', () => {
    expect(transformSecurityScheme(new RequestAuth({ type: 'noauth' }), () => 'a')).toBeUndefined();
  });

  it('ignores unknown auth type', () => {
    expect(
      transformSecurityScheme(
        new RequestAuth({ type: 'non-existing-type' } as unknown as RequestAuthDefinition),
        () => 'a',
      ),
    ).toBeUndefined();
  });
});

describe('transformPostmanSecuritySchemes()', () => {
  describe('has authorization defined on item group level', () => {
    it('reduces to single one', () => {
      expect(
        transformSecuritySchemes(
          new Collection({
            item: [
              {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path/a',
                    },
                  },
                ],
                auth: { type: 'basic' },
              },
              {
                request: {
                  method: 'get',
                  url: '/path/b',
                  auth: { type: 'digest' },
                },
              },
            ],
          }),
        ),
      ).toEqual([
        {
          securityScheme: {
            id: expect.any(String),
            key: 'http-0',
            scheme: 'basic',
            type: 'http',
            extensions: {},
          },
          type: 'securityScheme',
        },
        {
          securityScheme: {
            id: expect.any(String),
            key: 'http-1',
            scheme: 'digest',
            type: 'http',
            extensions: {},
          },
          type: 'securityScheme',
        },
      ]);
    });
  });

  describe('authorization is not defined', () => {
    it('reduces to single one', () => {
      expect(
        transformSecuritySchemes(
          new Collection({
            item: [
              {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path/a',
                    },
                  },
                ],
              },
              {
                request: {
                  method: 'get',
                  url: '/path/b',
                },
              },
            ],
          }),
        ),
      ).toEqual([]);
    });
  });

  describe('authorization is defined as noauth', () => {
    it('returns no security schemes', () => {
      expect(
        transformSecuritySchemes(
          new Collection({
            item: [
              {
                item: [
                  {
                    request: {
                      method: 'get',
                      url: '/path/a',
                    },
                  },
                ],
                auth: { type: 'noauth' },
              },
              {
                request: {
                  method: 'get',
                  url: '/path/b',
                  auth: { type: 'noauth' },
                },
              },
            ],
          }),
        ),
      ).toEqual([]);
    });
  });

  describe('has two similar request authorizations', () => {
    it('reduces to single one', () => {
      expect(
        transformSecuritySchemes(
          new Collection({
            item: [
              {
                request: {
                  method: 'get',
                  url: '/path/a',
                  auth: { type: 'basic' },
                },
                description: 'desc',
              },
              {
                request: {
                  method: 'get',
                  url: '/path/b',
                  auth: { type: 'basic' },
                },
                description: 'desc',
              },
            ],
          }),
        ),
      ).toEqual([
        {
          securityScheme: {
            id: expect.any(String),
            key: 'http-0',
            scheme: 'basic',
            type: 'http',
            extensions: {},
          },
          type: 'securityScheme',
        },
      ]);
    });
  });
});

describe.each<[string, PostmanSecurityScheme, PostmanSecurityScheme, boolean]>([
  [
    'two equal security schemes',
    { type: 'securityScheme', securityScheme: { id: '', key: '1', type: 'http', scheme: 'basic', extensions: {} } },
    { type: 'securityScheme', securityScheme: { id: '', key: '2', type: 'http', scheme: 'basic', extensions: {} } },
    true,
  ],
  [
    'different types',
    { type: 'securityScheme', securityScheme: { id: '', key: '1', type: 'http', scheme: 'basic', extensions: {} } },
    { type: 'headerParams', headerParams: [] },
    false,
  ],
  [
    'two different',
    {
      type: 'securityScheme',
      securityScheme: { id: '', key: '1', type: 'http', scheme: 'basic', extensions: {} },
    },
    {
      type: 'securityScheme',
      securityScheme: { id: '', key: '2', type: 'http', scheme: 'digest', extensions: {} },
    },
    false,
  ],
  [
    'two equal query params',
    { type: 'queryParams', queryParams: [{ id: '', name: 'token', style: HttpParamStyles.Form }] },
    { type: 'queryParams', queryParams: [{ id: '', name: 'token', style: HttpParamStyles.Form }] },
    true,
  ],
])('given %s security schemes', (desc, scheme1, scheme2, result) => {
  it(`returns ${result ? 'true' : 'false'}`, () => {
    expect(isPostmanSecuritySchemeEqual(scheme1, scheme2)).toEqual(result);
  });
});

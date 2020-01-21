import { RequestAuth, RequestAuthDefinition } from 'postman-collection';
import { transformSecurityScheme } from '../securityScheme';

describe('transformSecurityScheme', () => {
  it('transforms HTTP Basic', () => {
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
        () => 'a',
      ),
    ).toEqual({
      key: 'a',
      type: 'http',
      scheme: 'basic',
    });
  });

  it('transforms HTTP Digest', () => {
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
        () => 'a',
      ),
    ).toEqual({
      key: 'a',
      type: 'http',
      scheme: 'digest',
    });
  });

  describe('transforms ApiKey', () => {
    it('transforms ApiKey with "in" set explicitly', () => {
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
          () => 'a',
        ),
      ).toEqual({
        key: 'a',
        type: 'apiKey',
        name: 'TestApiKey',
        in: 'query',
      });
    });

    it('transforms ApiKey with "in" not set', () => {
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
          () => 'a',
        ),
      ).toEqual({
        key: 'a',
        type: 'apiKey',
        name: 'TestApiKey',
        in: 'header',
      });
    });
  });

  it('transforms HTTP Bearer', () => {
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
        () => 'a',
      ),
    ).toEqual({
      key: 'a',
      type: 'http',
      scheme: 'bearer',
    });
  });

  it('omits noauth', () => {
    expect(
      transformSecurityScheme(new RequestAuth({ type: 'noauth' } as RequestAuthDefinition), () => 'a'),
    ).toBeUndefined();
  });

  it('omits unknown auth', () => {
    expect(
      transformSecurityScheme(new RequestAuth({ type: 'akamai' } as RequestAuthDefinition), () => 'a'),
    ).toBeUndefined();
  });
});

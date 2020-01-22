import { Dictionary } from '@stoplight/types';
import { Security } from 'swagger-schema-official';
import { getConsumes, getProduces, getSecurities } from '../accessors';

const securityDefinitionsFixture: Dictionary<Security> = {
  api_key: {
    type: 'apiKey',
    name: 'api_key',
    in: 'header',
  },
  petstore_auth: {
    type: 'oauth2',
    authorizationUrl: 'http://swagger.io/api/oauth/dialog',
    flow: 'implicit',
    scopes: {
      'write:pets': 'modify pets in your account',
      'read:pets': 'read your pets',
    },
  },
};

describe('accessors', () => {
  const securityFixture: Array<Dictionary<string[], string>> = [
    {
      api_key: [],
      petstore_auth: ['write:pets', 'read:pets'],
    },
  ];

  describe('relation between schemes', () => {
    describe('when all of the given schemes are expected to be validated against', () => {
      const securityFixtureWithAndRelation = securityFixture;

      it('returns an array containing multiple elements', () => {
        expect(
          getSecurities(
            {
              securityDefinitions: securityDefinitionsFixture,
              security: [],
            },
            securityFixtureWithAndRelation,
          ),
        ).toEqual([
          [
            {
              key: 'api_key',
              in: 'header',
              name: 'api_key',
              type: 'apiKey',
            },
            {
              authorizationUrl: 'http://swagger.io/api/oauth/dialog',
              flow: 'implicit',
              scopes: {
                'write:pets': 'modify pets in your account',
                'read:pets': 'read your pets',
              },
              type: 'oauth2',
              key: 'petstore_auth',
            },
          ],
        ]);
      });
    });

    describe('when one of the given schemes is expected to be validated against', () => {
      it('returns arrays containing one element each', () => {
        const securityFixtureWithOrRelation: Array<Dictionary<string[], string>> = [
          {
            petstore_auth: ['write:pets', 'read:pets'],
          },
          {
            api_key: [],
          },
        ];

        expect(
          getSecurities(
            {
              securityDefinitions: securityDefinitionsFixture,
              security: [],
            },
            securityFixtureWithOrRelation,
          ),
        ).toEqual([
          [
            {
              authorizationUrl: 'http://swagger.io/api/oauth/dialog',
              flow: 'implicit',
              scopes: {
                'write:pets': 'modify pets in your account',
                'read:pets': 'read your pets',
              },
              type: 'oauth2',
              key: 'petstore_auth',
            },
          ],
          [
            {
              in: 'header',
              name: 'api_key',
              type: 'apiKey',
              key: 'api_key',
            },
          ],
        ]);
      });
    });
  });

  describe('getSecurities', () => {
    test('given no security definitions should return empty array', () => {
      expect(
        getSecurities(
          {
            securityDefinitions: {},
            security: securityFixture,
          },
          securityFixture,
        ),
      ).toEqual([]);

      expect(
        getSecurities(
          {
            securityDefinitions: undefined,
            security: securityFixture,
          },
          securityFixture,
        ),
      ).toEqual([]);
    });

    test('given no operation nor global security should return empty array', () => {
      expect(
        getSecurities(
          {
            securityDefinitions: securityDefinitionsFixture,
            security: undefined,
          },
          undefined,
        ),
      ).toEqual([]);
    });

    test('given an empty array in operation security should return empty array', () => {
      expect(
        getSecurities(
          {
            securityDefinitions: securityDefinitionsFixture,
            security: securityFixture,
          },
          [],
        ),
      ).toEqual([]);
    });

    test('given an operation security should return it', () => {
      expect(
        getSecurities(
          {
            securityDefinitions: securityDefinitionsFixture,
            security: securityFixture,
          },
          [
            {
              api_key: [],
            },
          ],
        ),
      ).toEqual([[{ in: 'header', name: 'api_key', type: 'apiKey', key: 'api_key' }]]);
    });

    test('given security with custom scopes should override global definition', () => {
      expect(
        getSecurities(
          {
            securityDefinitions: securityDefinitionsFixture,
            security: securityFixture,
          },
          [
            {
              petstore_auth: ['write:pets'],
            },
          ],
        ),
      ).toEqual([
        [
          {
            authorizationUrl: 'http://swagger.io/api/oauth/dialog',
            flow: 'implicit',
            scopes: { 'write:pets': 'modify pets in your account' },
            type: 'oauth2',
            key: 'petstore_auth',
          },
        ],
      ]);
    });

    test('given an operation security and no global security should return operation security', () => {
      expect(
        getSecurities(
          {
            securityDefinitions: securityDefinitionsFixture,
            security: [],
          },
          securityFixture,
        ),
      ).toEqual([
        [
          { in: 'header', name: 'api_key', type: 'apiKey', key: 'api_key' },
          {
            authorizationUrl: 'http://swagger.io/api/oauth/dialog',
            flow: 'implicit',
            scopes: {
              'write:pets': 'modify pets in your account',
              'read:pets': 'read your pets',
            },
            type: 'oauth2',
            key: 'petstore_auth',
          },
        ],
      ]);
    });
  });

  describe('getProduces', () => {
    test('given all empty arrays should return an empty array', () => {
      expect(getProduces({}, {})).toEqual([]);
      expect(getProduces({ produces: [] }, { produces: [] })).toEqual([]);
    });

    test('should fallback to spec produces', () => {
      expect(getProduces({ produces: ['text/plain'] }, {})).toEqual(['text/plain']);
    });

    test('should prefer operation produces', () => {
      expect(getProduces({ produces: ['text/plain'] }, { produces: ['text/poem'] })).toEqual(['text/poem']);
    });

    test('should handle malformed produces gracefully', () => {
      expect(getProduces({ produces: ['text/plain'] } as any, { produces: 2 as any })).toEqual([]);
      expect(getProduces({ produces: 2 } as any, {})).toEqual([]);
      expect(getProduces({}, { produces: ['text/plain', null] } as any)).toEqual(['text/plain']);
      expect(getProduces({ produces: ['text/plain', null] } as any, {})).toEqual(['text/plain']);
    });
  });

  describe('getConsumes', () => {
    test('given all empty arrays should return an empty array', () => {
      expect(getConsumes({}, {})).toEqual([]);
      expect(getConsumes({ consumes: [] }, { consumes: [] })).toEqual([]);
    });

    test('should fallback to spec consumes', () => {
      expect(getConsumes({ consumes: ['text/plain'] }, {})).toEqual(['text/plain']);
    });

    test('should prefer operation consumes', () => {
      expect(getConsumes({ consumes: ['text/plain'] }, { consumes: ['text/poem'] })).toEqual(['text/poem']);
    });

    test('should handle malformed consumes gracefully', () => {
      expect(getConsumes({ consumes: ['text/plain'] } as any, { consumes: 2 as any })).toEqual([]);
      expect(getConsumes({ consumes: 2 } as any, {})).toEqual([]);
      expect(getConsumes({}, { consumes: ['text/plain', null] } as any)).toEqual(['text/plain']);
      expect(getConsumes({ consumes: ['text/plain', null] } as any, {})).toEqual(['text/plain']);
    });
  });
});

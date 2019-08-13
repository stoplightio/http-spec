import { SecuritySchemeObject } from 'openapi3-ts';

import { translateToSecurities } from '../securities';

describe('translateOas3ToSecurities', () => {
  test('basic snapshot', () => {
    const collection: [SecuritySchemeObject[]] = [
      [
        {
          bearerFormat: 'Bearer',
          description: 'Description',
          in: 'header',
          name: 'oauth2',
          openIdConnectUrl: 'https://oaid.com/login',
          scheme: 'scheme',
          type: 'oauth2',
          flows: {
            authorizationCode: {
              tokenUrl: 'https://google.it/token',
              scopes: {
                'read:write': {},
              },
            },
          },
        },
      ],
    ];
    expect(translateToSecurities(collection)).toMatchSnapshot();
  });
});

import { SecuritySchemeObject } from 'openapi3-ts';
import { getSecurities } from '../accessors';

describe('getOas3Securities', () => {
  test('given no global securities should return empty array', () => {
    expect(getSecurities({}, {})).toEqual([]);
  });

  test('give global securities but no schemes should return empty array', () => {
    expect(
      getSecurities(
        {
          components: {
            securitySchemes: {
              scheme: {
                type: 'apiKey',
              } as SecuritySchemeObject,
            },
          },
        },
        {},
      ),
    ).toEqual([]);
  });

  test('given global securities and matching operation scheme should take from operation', () => {
    expect(
      getSecurities(
        {
          security: [{ operationScheme: [] }],
          components: {
            securitySchemes: {
              operationScheme: {
                type: 'apiKey',
              } as SecuritySchemeObject,
            },
          },
        },
        {},
      ),
    ).toStrictEqual([
      [
        {
          type: 'apiKey',
          key: 'operationScheme',
        },
      ],
    ]);
  });

  test('given global securities and matching spec scheme should take from spec', () => {
    expect(
      getSecurities(
        {
          components: {
            securitySchemes: {
              specScheme: {
                type: 'apiKey',
              } as SecuritySchemeObject,
            },
          },
        },
        {
          security: [{ specScheme: [] }],
        },
      ),
    ).toStrictEqual([
      [
        {
          type: 'apiKey',
          key: 'specScheme',
        },
      ],
    ]);
  });

  test('given global securities and matching spec and operation scheme should take from operation', () => {
    expect(
      getSecurities(
        {
          security: [{ operationScheme: [] }],
          components: {
            securitySchemes: {
              operationScheme: {
                type: 'http',
              } as SecuritySchemeObject,
              specScheme: {
                type: 'apiKey',
              } as SecuritySchemeObject,
            },
          },
        },
        {
          security: [{ specScheme: [] }],
        },
      ),
    ).toStrictEqual([
      [
        {
          type: 'apiKey',
          key: 'specScheme',
        },
      ],
    ]);
  });

  test('given global securities and matching spec and invalid operation scheme should return empty array', () => {
    expect(
      getSecurities(
        {
          security: [{ operationScheme: [] }],
          components: {
            securitySchemes: {
              operationScheme: {
                type: 'http',
              } as SecuritySchemeObject,
              specScheme: {
                type: 'apiKey',
              } as SecuritySchemeObject,
            },
          },
        },
        {
          security: [{ operationSchemeX: [] }],
        },
      ),
    ).toStrictEqual([[]]);
  });
});

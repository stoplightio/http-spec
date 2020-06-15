import { SecuritySchemeObject } from 'openapi3-ts';

import { getSecurities } from '../accessors';

describe('getOas3Securities', () => {
  it('given no global securities should return empty array', () => {
    expect(getSecurities({})).toEqual([]);
  });

  it('give global securities but no schemes should return empty array', () => {
    expect(
      getSecurities({
        components: {
          securitySchemes: {
            scheme: {
              type: 'apiKey',
            } as SecuritySchemeObject,
          },
        },
      }),
    ).toEqual([]);
  });

  it('given global securities and matching operation scheme should take from operation', () => {
    expect(
      getSecurities({
        security: [{ operationScheme: [] }],
        components: {
          securitySchemes: {
            operationScheme: {
              type: 'apiKey',
            } as SecuritySchemeObject,
          },
        },
      }),
    ).toStrictEqual([
      [
        {
          type: 'apiKey',
          key: 'operationScheme',
        },
      ],
    ]);
  });

  it('given global securities and matching spec scheme should take from spec', () => {
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
        [{ specScheme: [] }],
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

  it('given global securities and matching spec and operation scheme should take from operation', () => {
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
        [{ specScheme: [] }],
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

  it('given global securities and matching spec and invalid operation scheme should return empty array', () => {
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
        [{ operationSchemeX: [] }],
      ),
    ).toStrictEqual([[]]);
  });
});

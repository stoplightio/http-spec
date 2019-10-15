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
              },
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
              },
            },
          },
        },
        {},
      ),
    ).toStrictEqual([
      [
        {
          type: 'apiKey',
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
              },
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
              },
              specScheme: {
                type: 'apiKey',
              },
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
              },
              specScheme: {
                type: 'apiKey',
              },
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

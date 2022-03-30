import { DeepPartial } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';

import { getSecurities as _getSecurities, OperationSecurities } from '../accessors';

const getSecurities = (document: DeepPartial<OpenAPIObject>, operationSecurities?: OperationSecurities) =>
  _getSecurities(document, operationSecurities);

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
            },
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
            },
          },
        },
      }),
    ).toStrictEqual([
      [
        [
          'operationScheme',
          {
            type: 'apiKey',
          },
        ],
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
              },
            },
          },
        },
        [{ specScheme: [] }],
      ),
    ).toStrictEqual([
      [
        [
          'specScheme',
          {
            type: 'apiKey',
          },
        ],
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
              },
              specScheme: {
                type: 'apiKey',
              },
            },
          },
        },
        [{ specScheme: [] }],
      ),
    ).toStrictEqual([
      [
        [
          'specScheme',
          {
            type: 'apiKey',
          },
        ],
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
              },
              specScheme: {
                type: 'apiKey',
              },
            },
          },
        },
        [{ operationSchemeX: [] }],
      ),
    ).toStrictEqual([[]]);
  });
});

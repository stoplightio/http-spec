import { HttpParamStyles, IHttpHeaderParam } from '@stoplight/types';

import { translateToHeaderParams } from '../params';
import { translateToResponses } from '../responses';
import { Schema } from 'swagger-schema-official';

jest.mock('../params');

describe('responses', () => {
  const fakeHeaderParams: IHttpHeaderParam[] = [{ name: 'fake-header', style: HttpParamStyles.Simple }];
  const produces = ['application/json', 'application/xml'];

  beforeEach(() => {
    (translateToHeaderParams as jest.Mock).mockReturnValue(fakeHeaderParams);
  });

  test('should translate to multiple responses', () => {
    const responses = translateToResponses(
      {
        r1: {
          description: 'd1',
          examples: {
            'application/json': {},
          },
          headers: {},
          schema: {},
        },
        r2: {
          description: 'd2',
          examples: {
            'application/xml': {},
          },
          headers: {},
          schema: {},
        },
      },
      produces,
    );

    expect(responses).toMatchSnapshot();
  });

  test('should translate to response w/o headers', () => {
    expect(
      translateToResponses(
        {
          r1: {
            description: 'd1',
            examples: {
              'application/xml': {},
            },
            schema: {},
          },
        },
        produces,
      ),
    ).toMatchSnapshot();
  });

  test('should translate to response w/o examples', () => {
    expect(
      translateToResponses(
        {
          r1: {
            description: 'd1',
            schema: {},
          },
        },
        produces,
      ),
    ).toMatchSnapshot();
  });

  describe('should keep foreign examples', () => {
    it('aggregating them to the first example', () => {
      const responses = translateToResponses(
        {
          r1: {
            description: 'd1',
            examples: {
              'application/i-have-no-clue': {},
              'application/json': {},
            },
            headers: {},
            schema: {},
          },
        },
        produces,
      );

      expect(responses[0].contents).toBeDefined();
      expect(responses[0].contents![0]).toHaveProperty('mediaType', 'application/json');

      expect(responses[0].contents![0].examples).toBeDefined();
      expect(responses[0].contents![0].examples).toHaveLength(2);
    });
  });

  describe('schema examples', () => {
    describe('given a response with a schema with an example', () => {
      it('should translate to response with examples', () => {
        const responses = translateToResponses(
          {
            r1: {
              description: 'd1',
              headers: {},
              schema: {
                example: {
                  name: 'value',
                },
              },
            },
          },
          produces,
        );
        expect(responses[0].contents![0]).toHaveProperty('examples', [{ key: 'default', value: { name: 'value' } }]);
      });
    });

    describe('given multiple schema example properties', () => {
      it('should translate all examples', () => {
        const responses = translateToResponses(
          {
            r1: {
              description: 'd1',
              headers: {},
              schema: {
                example: {
                  name: 'example value',
                },
                ['x-examples']: {
                  'application/json': {
                    name: 'examples value',
                  },
                },
              } as Schema,
            },
          },
          produces,
        );
        expect(responses[0].contents![0]).toHaveProperty('examples', [
          { key: 'application/json', value: { name: 'examples value' } },
          { key: 'default', value: { name: 'example value' } },
        ]);
      });
    });

    describe('given response with examples in root and schema objects', () => {
      it('root examples should take precedence over schema examples', () => {
        const responses = translateToResponses(
          {
            r1: {
              description: 'd1',
              headers: {},
              examples: {
                'application/i-have-no-clue': {},
                'application/json': {},
              },
              schema: {
                example: {
                  name: 'value',
                },
              },
            },
          },
          produces,
        );
        expect(responses[0].contents![0].examples).toHaveLength(2);
        expect(responses[0].contents![0].examples).toEqual([
          { key: 'application/json', value: {} },
          { key: 'application/i-have-no-clue', value: {} },
        ]);
      });
    });
  });
});

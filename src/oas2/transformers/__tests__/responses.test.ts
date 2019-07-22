import { HttpParamStyles, IHttpHeaderParam } from '@stoplight/types';

import { translateToHeaderParams } from '../params';
import { translateToResponses } from '../responses';

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

    it('by creating a new content if necessary', () => {

      const responses = translateToResponses(
        {
          r1: {
            description: 'd1',
            examples: {
              'application/i-have-no-clue': {},
            },
            headers: {},
            schema: {},
          },
        },
        produces,
      );

      expect(responses[0].contents).toBeDefined();
      expect(responses[0].contents![0].examples).toBeDefined();
      expect(responses[0].contents![0].examples![0]).toBeDefined();
      expect(responses[0].contents![0].examples![0]).toHaveProperty('key', 'application/i-have-no-clue')
    })
    it('aggregating to the first example', () => {
      const responses = translateToResponses(
        {
          r1: {
            description: 'd1',
            examples: {
              'application/i-have-no-clue': {},
              'application/json': {}
            },
            headers: {},
            schema: {},
          },
        },
        produces,
      );

      expect(responses[0].contents).toBeDefined();
      expect(responses[0].contents![0].examples).toBeDefined();
      expect(responses[0].contents![0].examples![0]).toBeDefined();
      expect(responses[0].contents![0].examples![0]).toHaveProperty('key', 'application/json')
    })
  });
});

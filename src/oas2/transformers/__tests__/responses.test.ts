import { HttpParamStyles, IHttpHeaderParam } from '@stoplight/types';

import { translateToHeaderParams } from '../params';
import { translateToResponses } from '../responses';

jest.mock('../params');

describe('responses', () => {
  const fakeHeaderParams: IHttpHeaderParam[] = [{ name: 'fake-header', style: HttpParamStyles.Simple }];
  const produces = ['*'];

  beforeEach(() => {
    (translateToHeaderParams as jest.Mock).mockReturnValue(fakeHeaderParams);
  });
  test('should translate to multiple responses', () => {
    const responses = translateToResponses(
      {
        r1: {
          description: 'd1',
          examples: {
            e1: {},
          },
          headers: {},
          schema: {},
        },
        r2: {
          description: 'd2',
          examples: {
            e2: {},
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
              e1: {},
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
});

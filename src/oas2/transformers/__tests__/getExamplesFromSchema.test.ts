import { getExamplesFromSchema } from '../getExamplesFromSchema';

describe('getExamplesFromSchema', () => {
  it('should ignore invalid data', () => {
    // @ts-ignore
    expect(getExamplesFromSchema(null)).toEqual({});
  });

  it('should work with x-examples', () => {
    expect(
      getExamplesFromSchema({
        'x-examples': {
          'my-example': {},
        },
      }),
    ).toEqual({
      'my-example': {},
    });
  });

  it('should work with example', () => {
    expect(
      getExamplesFromSchema({
        example: 'my-example',
      }),
    ).toEqual({
      default: 'my-example',
    });
  });
});

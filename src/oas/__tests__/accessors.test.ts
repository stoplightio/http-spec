import { getOasParameters } from '../accessors';

describe('getOasParameters', () => {
  test('should return empty array', () => {
    expect(getOasParameters(undefined, undefined)).toEqual([]);
  });

  test('should fallback to operation parameters', () => {
    expect(
      getOasParameters(
        [
          { name: 'n1', in: 'i1' },
          { name: 'n2', in: 'i2' },
        ],
        undefined,
      ),
    ).toEqual([
      {
        in: 'i1',
        name: 'n1',
      },
      {
        in: 'i2',
        name: 'n2',
      },
    ]);
  });

  test('should fallback to path parameters', () => {
    expect(
      getOasParameters(undefined, [
        { name: 'n1', in: 'i1' },
        { name: 'n2', in: 'i2' },
      ]),
    ).toEqual([
      {
        in: 'i1',
        name: 'n1',
      },
      {
        in: 'i2',
        name: 'n2',
      },
    ]);
  });

  test('should prefer operation parameters', () => {
    expect(
      getOasParameters(
        [
          { name: 'n1', in: 'n1', type: 'array' },
          { name: 'no2', in: 'io2' },
        ],
        [
          { name: 'n1', in: 'n1', type: 'string' },
          { name: 'np3', in: 'ip3' },
        ],
      ),
    ).toEqual([
      {
        in: 'n1',
        name: 'n1',
        type: 'array',
      },
      {
        in: 'io2',
        name: 'no2',
      },
      {
        in: 'ip3',
        name: 'np3',
      },
    ]);
  });
});

import { getOasTags, getValidOasParameters } from '../accessors';

describe('getOasParameters', () => {
  it('should return empty array', () => {
    expect(getValidOasParameters(undefined, undefined)).toEqual([]);
  });

  it('should fallback to operation parameters', () => {
    expect(
      getValidOasParameters(
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

  it('should fallback to path parameters', () => {
    expect(
      getValidOasParameters(undefined, [
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

  it('should prefer operation parameters', () => {
    expect(
      getValidOasParameters(
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

describe('getOasTags', () => {
  describe.each([2, null, {}, '', 0])('when tags property is not an array', tags => {
    it('should return empty array', () => {
      expect(getOasTags(tags)).toEqual([]);
    });
  });

  it('should filter out invalid values', () => {
    expect(getOasTags([{}, null, 'foo'])).toEqual(['foo']);
  });

  it('should normalize values', () => {
    expect(getOasTags([0, 'foo', true])).toEqual(['0', 'foo', 'true']);
  });
});

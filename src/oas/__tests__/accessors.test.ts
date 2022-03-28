import { getValidOasParameters } from '../accessors';
import { OasVersion } from '../types';

describe('getOasParameters', () => {
  it('should return empty array', () => {
    expect(getValidOasParameters({}, OasVersion.OAS2, undefined, undefined)).toEqual([]);
  });

  it('should fallback to operation parameters', () => {
    expect(
      getValidOasParameters(
        {},
        OasVersion.OAS2,
        [
          { name: 'n1', in: 'header' },
          { name: 'n2', in: 'query' },
        ],
        undefined,
      ),
    ).toEqual([
      {
        in: 'header',
        name: 'n1',
      },
      {
        in: 'query',
        name: 'n2',
      },
    ]);
  });

  it('should fallback to path parameters', () => {
    expect(
      getValidOasParameters({}, OasVersion.OAS2, undefined, [
        { name: 'n1', in: 'header' },
        { name: 'n2', in: 'query' },
      ]),
    ).toEqual([
      {
        in: 'header',
        name: 'n1',
      },
      {
        in: 'query',
        name: 'n2',
      },
    ]);
  });

  it('should prefer operation parameters', () => {
    expect(
      getValidOasParameters(
        {},
        OasVersion.OAS3,
        [
          { name: 'n1', in: 'query', type: 'array' },
          { name: 'no2', in: 'header' },
        ],
        [
          { name: 'n1', in: 'query', type: 'string' },
          { name: 'np3', in: 'header' },
        ],
      ),
    ).toEqual([
      {
        in: 'query',
        name: 'n1',
        type: 'array',
      },
      {
        in: 'header',
        name: 'no2',
      },
      {
        in: 'header',
        name: 'np3',
      },
    ]);
  });
});

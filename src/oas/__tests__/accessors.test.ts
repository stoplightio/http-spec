import { Fragment } from '../../types';
import { createOasParamsIterator } from '../accessors';
import { createContext } from '../context';
import { OasVersion } from '../types';

const getValidOasParameters = (document: { paths: { '/': { get: Fragment } } }, spec: OasVersion) =>
  Array.from(
    createOasParamsIterator(spec as any).call(createContext(document), document.paths['/'], document.paths['/'].get),
  );

describe('createOasParamsIterator', () => {
  describe.each([OasVersion.OAS2, OasVersion.OAS3])('given %s spec', spec => {
    it('should return empty array', () => {
      const document = {
        paths: {
          '/': {
            get: {},
          },
        },
      };

      expect(getValidOasParameters(document, spec)).toEqual([]);
    });

    it('should fallback to operation parameters', () => {
      const document = {
        paths: {
          '/': {
            get: {
              parameters: [
                { name: 'n1', in: 'header' },
                { name: 'n2', in: 'query' },
              ],
            },
          },
        },
      };

      expect(getValidOasParameters(document, spec)).toEqual([
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
      const document = {
        paths: {
          '/': {
            parameters: [
              { name: 'n1', in: 'header' },
              { name: 'n2', in: 'query' },
            ],
            get: {},
          },
        },
      };

      expect(getValidOasParameters(document, spec)).toEqual([
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
      const document = {
        paths: {
          '/': {
            parameters: [
              { name: 'n1', in: 'query', type: 'string' },
              { name: 'np3', in: 'header' },
            ],
            get: {
              parameters: [
                { name: 'n1', in: 'query', type: 'array' },
                { name: 'no2', in: 'header' },
              ],
            },
          },
        },
      };

      expect(getValidOasParameters(document, spec)).toEqual([
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
});

import { createContext, DEFAULT_ID_GENERATOR } from '../../context';
import { translateToTags as _translateToTags } from '../tags';

const translateToTags = (tags: unknown) => _translateToTags.call(createContext({}, DEFAULT_ID_GENERATOR), tags);

describe('translateToTags', () => {
  describe.each([2, null, {}, '', 0])('when tags property is not an array', tags => {
    it('should return empty array', () => {
      expect(translateToTags(tags)).toStrictEqual([]);
    });
  });

  it('should filter out invalid values', () => {
    expect(translateToTags([{}, null, 'foo'])).toStrictEqual([
      {
        id: '#/tags/2',
        name: 'foo',
      },
    ]);
  });

  it('should normalize values', () => {
    expect(translateToTags([0, 'foo', true])).toStrictEqual([
      {
        id: '#/tags/0',
        name: '0',
      },
      {
        id: '#/tags/1',
        name: 'foo',
      },
      {
        id: '#/tags/2',
        name: 'true',
      },
    ]);
  });

  it('should translate array of strings to tags', () => {
    expect(translateToTags(['a', 'b', 'c'])).toStrictEqual([
      {
        id: '#/tags/0',
        name: 'a',
      },
      {
        id: '#/tags/1',
        name: 'b',
      },
      {
        id: '#/tags/2',
        name: 'c',
      },
    ]);
  });
});

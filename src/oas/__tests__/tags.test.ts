import { createContext } from '../../context';
import { translateToTags as _translateToTags } from '../tags';

const translateToTags = (tags: unknown) => _translateToTags.call(createContext({}), tags);

describe('translateToTags', () => {
  describe.each([2, null, {}, '', 0])('when tags property is not an array', tags => {
    it('should return empty array', () => {
      expect(translateToTags(tags)).toStrictEqual([]);
    });
  });

  it('should filter out invalid values', () => {
    expect(translateToTags([{}, null, 'foo'])).toStrictEqual([
      {
        name: 'foo',
      },
    ]);
  });

  it('should normalize values', () => {
    expect(translateToTags([0, 'foo', true])).toStrictEqual([
      {
        name: '0',
      },
      {
        name: 'foo',
      },
      {
        name: 'true',
      },
    ]);
  });

  it('should translate array of strings to tags', () => {
    expect(translateToTags(['a', 'b', 'c'])).toStrictEqual([
      {
        name: 'a',
      },
      {
        name: 'b',
      },
      {
        name: 'c',
      },
    ]);
  });
});

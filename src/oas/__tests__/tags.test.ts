import { createContext } from '../context';
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
        id: expect.any(String),
        name: 'foo',
      },
    ]);
  });

  it('should normalize values', () => {
    expect(translateToTags([0, 'foo', true])).toStrictEqual([
      {
        id: expect.any(String),
        name: '0',
      },
      {
        id: expect.any(String),
        name: 'foo',
      },
      {
        id: expect.any(String),
        name: 'true',
      },
    ]);
  });

  it('should translate array of strings to tags', () => {
    expect(translateToTags(['a', 'b', 'c'])).toStrictEqual([
      {
        id: expect.any(String),
        name: 'a',
      },
      {
        id: expect.any(String),
        name: 'b',
      },
      {
        id: expect.any(String),
        name: 'c',
      },
    ]);
  });
});

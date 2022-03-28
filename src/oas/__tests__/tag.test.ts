import { translateToTags } from '../tag';

describe('translateToTags', () => {
  it('should translate array of strings to tags', () => {
    expect(translateToTags(['a', 'b', 'c'])).toEqual([
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

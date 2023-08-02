import { toExternalDocs } from '../externalDocs';

describe('toExternalDocs', () => {
  it.each([null, undefined, ['array'], 'string', 1])(
    'returns empty object if supplied externalDocs is "%s"',
    externalDocs => {
      const actual = toExternalDocs(externalDocs);

      expect(actual).toEqual({});
    },
  );

  it.each([null, undefined, 1, ['array'], { object: 'type' }, '', '         '])(
    'returns emtpy object if url is "%s"',
    url => {
      const externalDocs = {
        url,
        description: 'some description',
      };

      const actual = toExternalDocs(externalDocs);
      expect(actual).toEqual({});
    },
  );

  it.each([null, undefined, 1, ['array'], { object: 'type' }, '', '      '])(
    'excludes description if it is "%s"',
    description => {
      const externalDocs = {
        url: 'http://some.url',
        description,
      };

      const actual = toExternalDocs(externalDocs);
      expect(actual).toEqual({ externalDocs: { url: 'http://some.url' } });
    },
  );

  it('includes both url and description if they are valid', () => {
    const externalDocs = {
      url: 'http://some.url',
      description: 'some description',
    };

    const actual = toExternalDocs(externalDocs);
    expect(actual).toEqual({
      externalDocs: {
        url: 'http://some.url',
        description: 'some description',
      },
    });
  });
});

import { translateToServers } from '../servers';

type GlobalWithLocation = typeof global & { location: Partial<Location> & { href: string } };

describe('translateToServers', () => {
  afterAll(() => {
    delete (global as GlobalWithLocation).location;
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-976
  test('given executed in a browser context and a query in location.href should not inherit that query', () => {
    (global as GlobalWithLocation).location = {
      href: 'https://www.someotherdomain.com?query=123',
    };
    expect(translateToServers({ host: 'stoplight.io' }, { schemes: ['http'] })).toEqual([
      { url: 'http://stoplight.io' },
    ]);
  });

  test('given operation schemes should return servers', () => {
    expect(
      translateToServers({ host: 'stoplight.io', basePath: '/base-path' }, { schemes: ['http', 'https'] }),
    ).toEqual([
      {
        url: 'http://stoplight.io/base-path',
      },
      {
        url: 'https://stoplight.io/base-path',
      },
    ]);
  });

  test('given spec schemes should return servers', () => {
    expect(
      translateToServers(
        {
          schemes: ['http', 'https'],
          host: 'stoplight.io',
          basePath: '/base-path',
        },
        {},
      ),
    ).toEqual([
      {
        url: 'http://stoplight.io/base-path',
      },
      {
        url: 'https://stoplight.io/base-path',
      },
    ]);
  });

  test('given operation and spec schemes should take operation schemes', () => {
    expect(
      translateToServers({ schemes: ['https'], host: 'stoplight.io', basePath: '/base-path' }, { schemes: ['http'] }),
    ).toEqual([
      {
        url: 'http://stoplight.io/base-path',
      },
    ]);
  });

  test('given no scheme should return empty array', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: '/base-path' }, {})).toEqual([]);
  });

  test('given no basePath should return servers', () => {
    expect(translateToServers({ schemes: ['http'], host: 'stoplight.io' }, {})).toEqual([
      {
        url: 'http://stoplight.io',
      },
    ]);
  });

  test('given empty host should return empty array', () => {
    expect(translateToServers({ host: '', basePath: '/base-path' }, { schemes: ['http', 'https'] })).toEqual([]);
  });

  test('should handle malformed spec scheme gracefully', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: '/base-path', schemes: 1 } as any, {})).toEqual([]);
    // covers TypeError: {value}.replace is not a function coming from URI.js
    expect(
      translateToServers({ host: 'stoplight.io', basePath: '/base-path', schemes: [null, 'test'] as any }, {}),
    ).toEqual([
      {
        url: 'test://stoplight.io/base-path',
      },
    ]);
  });

  test('should handle malformed operation scheme gracefully', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: '/base-path' }, { schemes: 1 } as any)).toEqual([]);
    // covers TypeError: {value}.replace is not a function coming from URI.js
    expect(
      translateToServers({ host: 'stoplight.io', basePath: '/base-path' }, { schemes: [null, 'test'] as any }),
    ).toEqual([
      {
        url: 'test://stoplight.io/base-path',
      },
    ]);
  });

  test('should handle invalid server host gracefully', () => {
    expect(translateToServers({ host: 123 as any, basePath: '/base-path' }, { schemes: ['http', 'https'] })).toEqual(
      [],
    );
  });

  test('should handle invalid server basePath gracefully', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: 123 as any }, { schemes: ['http', 'https'] })).toEqual([
      {
        url: 'http://stoplight.io',
      },
      {
        url: 'https://stoplight.io',
      },
    ]);
  });
});

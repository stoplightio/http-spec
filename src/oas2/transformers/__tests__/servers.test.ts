import { translateToServers } from '../servers';

type GlobalWithLocation = typeof global & { location: Partial<Location> & { href: string } };

describe('translateToServers', () => {
  afterAll(() => {
    delete (global as GlobalWithLocation).location;
  });

  // Assures: https://stoplightio.atlassian.net/browse/SL-976
  it('given executed in a browser context and a query in location.href should not inherit that query', () => {
    (global as GlobalWithLocation).location = {
      href: 'https://www.someotherdomain.com?query=123',
    };
    expect(translateToServers({ host: 'stoplight.io' }, { schemes: ['http'] })).toEqual([
      { url: 'http://stoplight.io' },
    ]);
  });

  it('given operation schemes should return servers', () => {
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

  it('given spec schemes should return servers', () => {
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

  it('given operation and spec schemes should take operation schemes', () => {
    expect(
      translateToServers({ schemes: ['https'], host: 'stoplight.io', basePath: '/base-path' }, { schemes: ['http'] }),
    ).toEqual([
      {
        url: 'http://stoplight.io/base-path',
      },
    ]);
  });

  it('given no scheme should return empty array', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: '/base-path' }, {})).toEqual([]);
  });

  it('given no basePath should return servers', () => {
    expect(translateToServers({ schemes: ['http'], host: 'stoplight.io' }, {})).toEqual([
      {
        url: 'http://stoplight.io',
      },
    ]);
  });

  it('given empty host should return empty array', () => {
    expect(translateToServers({ host: '', basePath: '/base-path' }, { schemes: ['http', 'https'] })).toEqual([]);
  });

  it('should handle malformed spec scheme gracefully', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: '/base-path', schemes: 1 } as any, {})).toEqual([]);
    // covers TypeError: {value}.replace is not a function coming from URI.js
    expect(
      translateToServers(
        { host: 'stoplight.io', basePath: '/base-path', schemes: [null, 'test', 'http ', '1https'] as any },
        {},
      ),
    ).toEqual([]);
  });

  it('should handle malformed operation scheme gracefully', () => {
    expect(translateToServers({ host: 'stoplight.io', basePath: '/base-path' }, { schemes: 1 } as any)).toEqual([]);
    // covers TypeError: {value}.replace is not a function coming from URI.js
    expect(
      translateToServers(
        { host: 'stoplight.io', basePath: '/base-path' },
        { schemes: [null, 'test', 'http ', '1https'] as any },
      ),
    ).toEqual([]);
  });

  it('should handle invalid server host gracefully', () => {
    expect(translateToServers({ host: 123 as any, basePath: '/base-path' }, { schemes: ['http', 'https'] })).toEqual(
      [],
    );
  });

  it('should handle invalid server basePath gracefully', () => {
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

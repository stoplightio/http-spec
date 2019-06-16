import { translateToServers } from '../servers';

describe('translateToServers', () => {
  // Assures: https://stoplightio.atlassian.net/browse/SL-976
  test('given executed in a browser context and a query in location.href should not inherit that query', () => {
    // @ts-ignore - ignore the fact that `location` does not exist on global object. Mimic browser.
    const loc = global.location;
    // @ts-ignore - ignore the fact that `location` does not exist on global object. Mimic browser.
    global.location = {
      href: 'https://www.someotherdomain.com?query=123',
    };
    expect(translateToServers({ host: 'stoplight.io' }, { schemes: ['http'] })).toEqual([
      { url: 'http://stoplight.io' },
    ]);
    // @ts-ignore - ignore the fact that `location` does not exist on global object. Mimic browser.
    global.location = loc;
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
});

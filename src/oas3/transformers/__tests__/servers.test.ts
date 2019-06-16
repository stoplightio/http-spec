import { translateToServers } from '../servers';

describe('translateToServers', () => {
  test('translate undefined to empty array', () => {
    expect(translateToServers(undefined)).toMatchSnapshot();
  });

  test('translate single ServerObject to IServer', () => {
    expect(
      translateToServers([
        {
          description: 'description',
          url: 'http://stoplight.io/path',
          variables: {
            a: {
              default: false,
              enum: [false, true, false],
              description: 'a - descr',
            },
            b: {
              default: 123,
              enum: [1, 2, 3],
              description: 'b - descr',
            },
          },
        },
      ]),
    ).toMatchSnapshot();
  });
});

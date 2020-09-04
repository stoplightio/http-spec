import { translateToServers } from '../servers';

describe('translateToServers', () => {
  it('translate single ServerObject to IServer', () => {
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

  it('filters out invalid variables', () => {
    expect(
      translateToServers([
        {
          description: 'description',
          url: 'http://stoplight.io/path',
          variables: {
            a: null,
            b: {
              default: 123,
              enum: [1, 2, 3],
              description: 'b - descr',
            },
            c: {},
            d: {
              default: {},
            },
          } as any,
        },
      ]),
    ).toStrictEqual([
      {
        description: 'description',
        id: 'server-0',
        url: 'http://stoplight.io/path',
        variables: {
          b: {
            default: '123',
            description: 'b - descr',
            enum: ['1', '2', '3'],
          },
        },
      },
    ]);
  });
});

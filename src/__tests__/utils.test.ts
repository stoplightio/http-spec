import { maybeResolveLocalRef } from '../utils';

describe('maybeResolveLocalRef()', () => {
  it('follows $refs', () => {
    expect(
      maybeResolveLocalRef(
        {
          a: {
            $ref: '#/b',
          },
          b: {
            c: 'woo',
          },
        },
        { $ref: '#/a/c' },
      ),
    ).toEqual('woo');
  });

  it('handles invalid $refs', () => {
    expect(maybeResolveLocalRef({ a: true }, { $ref: '#a' })).toStrictEqual({ $ref: '#a' });
  });

  it('handles circular references', () => {
    const document = {
      get a(): unknown {
        return this.a;
      },
    };

    expect(
      maybeResolveLocalRef(document, {
        $ref: '#/a',
      }),
    ).toStrictEqual({ $ref: '#/a' });
  });
});

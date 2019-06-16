import * as urijs from 'urijs';
import { URI } from '../utils';

describe('URI()', () => {
  test('instantiates from string', () => {
    const url = 'test:///path/to/api.yaml#/the/pointer';

    expect(URI(url).toString()).toEqual(url);
  });

  test('instantiates from urijs', () => {
    const url = 'test:///path/to/api.yaml#/the/pointer';

    expect(URI(urijs(url)).toString()).toEqual(url);
  });

  describe('type()', () => {
    test('sets type', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .scheme('test2')
          .toString(),
      ).toEqual('test2:///path/to/api.yaml#/the/pointer');
    });
  });

  describe('host()', () => {
    test('sets host', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .host('test2.com')
          .toString(),
      ).toEqual('test://test2.com/path/to/api.yaml#/the/pointer');
    });

    test('sets host and port', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .host('test2:3000')
          .toString(),
      ).toEqual('test://test2:3000/path/to/api.yaml#/the/pointer');
    });

    test('sets host and port (non-number port does not error)', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .host('test2:{$$.env.host}')
          .toString(),
      ).toEqual('test://test2:{$$.env.host}/path/to/api.yaml#/the/pointer');
    });
  });

  describe('port()', () => {
    test('sets port', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .host('test2')
          .port('3000')
          .toString(),
      ).toEqual('test://test2:3000/path/to/api.yaml#/the/pointer');
    });

    test('does not error on invalid port', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .host('test2')
          .port('invalid')
          .toString(),
      ).toEqual('test://test2/path/to/api.yaml#/the/pointer');
    });
  });

  describe('path()', () => {
    test('sets path', () => {
      const url = 'test:///path/to/api.yaml#/the/pointer';

      expect(
        URI(url)
          .path('/path/to/other/api.yaml')
          .toString(),
      ).toEqual('test:///path/to/other/api.yaml#/the/pointer');
    });
  });

  describe('pointer()', () => {
    describe('pointer is a string', () => {
      test('sets pointer', () => {
        const url = 'test:///path/to/api.yaml#/the/pointer';

        expect(
          URI(url)
            .pointer('#/new/pointer')
            .toString(),
        ).toEqual('test:///path/to/api.yaml#/new/pointer');
      });
    });

    describe('pointer is a path', () => {
      test('sets pointer', () => {
        const url = 'test:///path/to/api.yaml#/the/pointer';

        expect(
          URI(url)
            .pointer(['new', 'pointer'])
            .toString(),
        ).toEqual('test:///path/to/api.yaml#/new/pointer');
      });
    });
  });

  describe('append()', () => {
    describe('append pointer to uri having a pointer', () => {
      it('replaces pointer', () => {
        expect(
          URI('file:///path/to/api.yaml#/some/pointer')
            .append('#/some/other/pointer')
            .toString(),
        ).toEqual('file:///path/to/api.yaml#/some/other/pointer');
      });
    });

    describe('append element to uri having a pointer', () => {
      it('appends element to pointer', () => {
        expect(
          URI('file:///path/to/api.yaml#/some/pointer')
            .append('inner')
            .toString(),
        ).toEqual('file:///path/to/api.yaml#/some/pointer/inner');
      });
    });

    describe('append pointer to uri not having a pointer', () => {
      it('appends pointer to uri', () => {
        expect(
          URI('file:///path/to/api.yaml')
            .append('#/some')
            .toString(),
        ).toEqual('file:///path/to/api.yaml#/some');
      });
    });

    describe('append element to uri not having a pointer', () => {
      it('appends element to uri', () => {
        expect(
          URI('file:///path/to')
            .append('api.yaml')
            .toString(),
        ).toEqual('file:///path/to/api.yaml');
      });
    });
  });
});

import { Url } from 'postman-collection';
import { transformServer } from '../server';

describe('transformServer()', () => {
  describe('host is defined', () => {
    describe('port is defined', () => {
      it('produces server with port', () => {
        expect(transformServer(new Url('https://example.com:666/path'))).toEqual({ url: 'https://example.com:666' });
      });
    });

    describe('port is not defined', () => {
      it('produces server without port', () => {
        expect(transformServer(new Url('https://example.com/path'))).toEqual({ url: 'https://example.com' });
      });
    });
  });

  describe('host is not defined', () => {
    it('returns nothing', () => {
      expect(transformServer(new Url('/path'))).toBeUndefined();
    });
  });

  describe('protocol is not defined', () => {
    it('returns nothing', () => {
      expect(transformServer(new Url({ host: ['example', 'com'], path: '/' }))).toBeUndefined();
    });
  });
});

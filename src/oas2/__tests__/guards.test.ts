import { Parameter } from 'swagger-schema-official';
import { isSecurityScheme, isTagObject } from '../guards';

describe('guards', () => {
  describe('isSecurityScheme()', () => {
    it('should return true for scheme with type', () => {
      expect(
        isSecurityScheme({
          type: 'apiKey',
        }),
      ).toEqual(true);
    });

    it('should return false for non object', () => {
      expect(isSecurityScheme(undefined)).toEqual(false);
    });

    it('should return false for missing type property', () => {
      expect(isSecurityScheme({ foo: 'bar' })).toEqual(false);
    });
  });

  describe('isTagObject()', () => {
    it('should return true for scheme with name', () => {
      expect(
        isTagObject({
          name: 'foo',
        }),
      ).toEqual(true);
    });

    it('should return false for non object', () => {
      expect(isTagObject(undefined)).toEqual(false);
    });

    it('should return false for missing name property', () => {
      expect(isTagObject({ foo: 'bar' })).toEqual(false);
    });
  });
});

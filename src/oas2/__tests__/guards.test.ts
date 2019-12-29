import { Parameter } from 'swagger-schema-official';
import {
  isBodyParameter,
  isFormDataParameter,
  isHeaderParameter,
  isPathParameter,
  isQueryParameter,
  isSecurityScheme,
  isTagObject,
} from '../guards';

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

  describe('isBodyParameter()', () => {
    it('should return true for parameter where "in" is body', () => {
      expect(
        isBodyParameter({
          name: 'n',
          in: 'body',
        }),
      ).toEqual(true);
    });

    it('should return false for parameter where "in" is not body', () => {
      expect(
        isBodyParameter({
          name: 'n',
          in: 'formData',
          type: 'string',
        }),
      ).toEqual(false);
    });
  });

  describe('isFormDataParameter()', () => {
    it('should return true for parameter where "in" is formData', () => {
      const param: Parameter = {
        name: 'n',
        in: 'formData',
        type: 'number',
      };
      expect(isFormDataParameter(param)).toEqual(true);
    });

    it('should return false for parameter where "in" is not formData', () => {
      expect(
        isFormDataParameter({
          name: 'n',
          in: 'body',
          type: 'string',
        }),
      ).toEqual(false);
    });
  });

  describe('isQueryParameter()', () => {
    it('should return true for parameter where "in" is query', () => {
      const param: Parameter = {
        name: 'n',
        in: 'query',
        type: 'string',
      };
      expect(isQueryParameter(param)).toEqual(true);
    });

    it('should return false for parameter where "in" is not query', () => {
      expect(
        isQueryParameter({
          name: 'n',
          in: 'body',
          type: 'string',
        }),
      ).toEqual(false);
    });
  });

  describe('isPathParameter()', () => {
    it('should return true for parameter where "in" is path', () => {
      const param: Parameter = {
        name: 'n',
        in: 'path',
        type: 'string',
        required: true,
      };
      expect(isPathParameter(param)).toEqual(true);
    });

    it('should return false for parameter where "in" is not path', () => {
      expect(
        isPathParameter({
          name: 'n',
          in: 'body',
          type: 'string',
        }),
      ).toEqual(false);
    });
  });

  describe('isHeaderParameter()', () => {
    it('should return true for parameter where "in" is header', () => {
      const param: Parameter = {
        name: 'n',
        in: 'header',
        type: 'string',
      };
      expect(isHeaderParameter(param)).toEqual(true);
    });

    it('should return false for parameter where "in" is not header', () => {
      expect(
        isHeaderParameter({
          name: 'n',
          in: 'body',
          type: 'string',
        }),
      ).toEqual(false);
    });
  });
});

import { transformPostmanCollectionService } from '../service';

describe('transformPostmanCollectionService()', () => {
  describe('version is defined', () => {
    it('transforms version correctly', () => {
      expect(transformPostmanCollectionService({ info: { version: '1.2.3-4' } })).toEqual({
        version: '1.2.3-4',
        id: expect.any(String),
        securitySchemes: [],
      });
    });
  });

  describe('description is defined', () => {
    it('transforms version correctly', () => {
      expect(transformPostmanCollectionService({ description: 'a desc' })).toEqual({
        description: 'a desc',
        version: '1.0.0',
        id: expect.any(String),
        securitySchemes: [],
      });
    });
  });

  describe('security scheme is defined', () => {
    it('lists them', () => {
      expect(transformPostmanCollectionService({ item: [{ request: { url: '/', auth: { type: 'basic' } } }] })).toEqual(
        {
          version: '1.0.0',
          id: expect.any(String),
          securitySchemes: [
            {
              id: expect.any(String),
              key: 'http-0',
              scheme: 'basic',
              type: 'http',
            },
          ],
        },
      );
    });
  });
});

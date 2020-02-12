import { transformPostmanCollectionService } from '../service';

describe('transformPostmanCollectionService()', () => {
  describe('version is defined', () => {
    it('transforms version correctly', () => {
      expect(transformPostmanCollectionService({ info: { version: '1.2.3-4' } })).toEqual({
        version: '1.2.3-4',
        description: undefined,
        id: expect.any(String),
        name: undefined,
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
        name: undefined,
        securitySchemes: [],
      });
    });
  });

  describe('security scheme is defined', () => {
    it('lists them', () => {
      expect(transformPostmanCollectionService({ item: [{ request: { url: '/', auth: { type: 'basic' } } }] })).toEqual(
        {
          description: undefined,
          version: '1.0.0',
          id: expect.any(String),
          name: undefined,
          securitySchemes: [
            {
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

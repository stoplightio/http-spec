import { HeaderDefinition, RequestBody } from 'postman-collection';
import { transformPostmanCollectionOperation } from '../operation';

describe('transformPostmanCollectionOperation()', () => {
  describe('operation can be found', () => {
    describe('description is set', () => {
      it.only('', () => {
        const petstore = require('./fixtures/petstore.json');
        transformPostmanCollectionOperation({ document: petstore, path: '/pets', method: 'get' });
      });

      it('returns operation with description', () => {
        expect(
          transformPostmanCollectionOperation({
            document: {
              item: [
                {
                  request: {
                    method: 'get',
                    url: '/path/:param?a=b',
                    body: { mode: 'raw', raw: 'test' } as RequestBody,
                    header: [{ key: 'header', value: 'a header' }] as HeaderDefinition,
                  },
                  description: 'desc',
                },
              ],
            },
            method: 'get',
            path: '/path/{param}',
          }),
        ).toEqual({
          description: 'desc',
          id: '?http-operation-id?',
          iid: expect.stringMatching(/^[a-z0-9]{8}-([a-z0-9]{4}-){3}[a-z0-9]{12}$/),
          method: 'get',
          path: '/path/{param}',
          request: expect.any(Object),
          responses: [],
          summary: undefined,
        });
      });
    });

    describe('description is not set', () => {
      it('returns operation without description', () => {
        expect(
          transformPostmanCollectionOperation({
            document: { item: [{ request: { method: 'get', url: '/path' } }] },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(expect.objectContaining({ description: undefined }));
      });
    });

    describe('content-type is set', () => {
      it('returns operation with body media-type set', () => {
        expect(
          transformPostmanCollectionOperation({
            document: {
              item: [
                {
                  request: {
                    method: 'get',
                    url: '/path',
                    header: [{ key: 'content-type', value: 'application/json' }] as HeaderDefinition,
                    body: {
                      mode: 'raw',
                      raw: '{}',
                    } as RequestBody,
                  },
                },
              ],
            },
            method: 'get',
            path: '/path',
          }),
        ).toEqual(expect.objectContaining({ description: undefined }));
      });
    });
  });

  describe('operation cannot be found', () => {
    it('throws an error', () => {
      expect(() =>
        transformPostmanCollectionOperation({
          document: { item: [{ request: { method: 'get', url: '/path' } }] },
          method: 'get',
          path: '/non-existing',
        }),
      ).toThrowError('Unable to find "get /non-existing"');
    });
  });
});

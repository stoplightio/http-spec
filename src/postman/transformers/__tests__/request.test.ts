import { QueryParam, RequestBody } from 'postman-collection';
import { transformBody, transformHeader, transformPathParams, transformQueryParam } from '../request';

describe('transformQueryParam()', () => {
  describe('value is set', () => {
    it('transforms correctly', () => {
      expect(transformQueryParam(new QueryParam({ key: 'testKey', value: 'testValue' }))).toEqual({
        examples: [
          {
            key: 'default',
            value: 'testValue',
          },
        ],
        name: 'testKey',
        style: 'form',
      });
    });
  });

  describe('value is null', () => {
    it('transforms correctly', () => {
      expect(transformQueryParam(new QueryParam({ key: 'testKey', value: null }))).toEqual({
        name: 'testKey',
        style: 'form',
      });
    });
  });
});

describe('transformHeader()', () => {
  describe('value is defined', () => {
    it('result contains schema', () => {
      expect(transformHeader({ key: 'testKey', value: '<string>' })).toEqual({
        name: 'testKey',
        schema: {
          type: 'string',
        },
        style: 'simple',
      });
    });
  });

  describe('value is not defined', () => {
    it('results does not contain schema', () => {
      expect(transformHeader({ key: 'testKey' })).toEqual({
        name: 'testKey',
        style: 'simple',
      });
    });
  });
});

describe('transformPathParams()', () => {
  it('transforms correctly', () => {
    expect(transformPathParams(['elem1', ':param1', ':param2', 'elem2'])).toEqual([
      { name: 'param1', style: 'simple' },
      { name: 'param2', style: 'simple' },
    ]);
  });
});

describe('transformBody()', () => {
  describe('body is passed in raw mode', () => {
    describe('body is defined', () => {
      describe('body is a json', () => {
        describe('media type is defined', () => {
          it('returns body containing example, schema and given media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: '{"a":"b"}' }), 'application/nice+json')).toEqual({
              contents: [
                {
                  examples: [{ key: 'default', value: { a: 'b' } }],
                  mediaType: 'application/nice+json',
                  schema: {
                    properties: { a: { type: 'string' } },
                    type: 'object',
                  },
                },
              ],
            });
          });
        });

        describe('media type is not defined', () => {
          it('returns body containing example, schema and application/json media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: '{"a":"b"}' }))).toEqual({
              contents: [
                {
                  examples: [{ key: 'default', value: { a: 'b' } }],
                  mediaType: 'application/json',
                  schema: {
                    properties: { a: { type: 'string' } },
                    type: 'object',
                  },
                },
              ],
            });
          });
        });
      });

      describe('body is not a json', () => {
        describe('media type is defined', () => {
          it('returns body containing example and given media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: '<a />' }), 'application/xml')).toEqual({
              contents: [
                {
                  examples: [{ key: 'default', value: '<a />' }],
                  mediaType: 'application/xml',
                },
              ],
            });
          });
        });

        describe('media type is not defined', () => {
          it('returns body containing example and text/plain media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: "I'm a goat. Bleeet!" }))).toEqual({
              contents: [
                {
                  examples: [{ key: 'default', value: "I'm a goat. Bleeet!" }],
                  mediaType: 'text/plain',
                },
              ],
            });
          });
        });
      });
    });

    describe('body is not defined', () => {
      it('returns no body', () => {
        expect(transformBody(new RequestBody({ mode: 'raw' }))).toBeUndefined();
      });
    });
  });

  describe('body is passed in formdata mode', () => {
    describe('body is defined', () => {
      describe('media type is defined', () => {
        it('returns body containing schema, example and given media type', () => {
          expect(
            transformBody(
              new RequestBody({
                mode: 'formdata',
                formdata: [
                  { key: 'k1', value: 'v1' },
                  { key: 'k2', value: 'v2', description: 'd2' },
                ],
              }),
              'multipart/test+form-data',
            ),
          ).toEqual({
            contents: [
              {
                examples: [{ key: 'default', value: { k1: 'v1', k2: 'v2' } }],
                mediaType: 'multipart/test+form-data',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string', description: undefined },
                    k2: { type: 'string', description: 'd2' },
                  },
                },
              },
            ],
          });
        });
      });

      describe('media type is not defined', () => {
        it('returns body containing schema, example and multipart/form-data media type', () => {
          expect(
            transformBody(
              new RequestBody({
                mode: 'formdata',
                formdata: [{ key: 'k1', value: 'v1' }],
              }),
            ),
          ).toEqual({
            contents: [
              {
                examples: [{ key: 'default', value: { k1: 'v1' } }],
                mediaType: 'multipart/form-data',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string', description: undefined },
                  },
                },
              },
            ],
          });
        });
      });
    });

    describe('body is not defined', () => {
      it('returns default empty body', () => {
        expect(transformBody(new RequestBody({ mode: 'formdata' }))).toEqual({
          contents: [
            {
              examples: [{ key: 'default', value: {} }],
              mediaType: 'multipart/form-data',
              schema: { properties: {}, type: 'object' },
            },
          ],
        });
      });

      it('returns no body', () => {
        expect(transformBody({ mode: 'formdata' } as RequestBody)).toBeUndefined();
      });
    });
  });

  describe('body is passed in urlencoded mode', () => {
    describe('body is defined', () => {
      describe('media type is defined', () => {
        it('returns body containing schema, example and given media type', () => {
          expect(
            transformBody(
              new RequestBody({
                mode: 'urlencoded',
                urlencoded: [
                  { key: 'k1', value: 'v1' },
                  { key: 'k2', value: 'v2', description: 'd2' },
                ],
              }),
              'application/test+x-www-form-urlencoded',
            ),
          ).toEqual({
            contents: [
              {
                examples: [{ key: 'default', value: { k1: 'v1', k2: 'v2' } }],
                mediaType: 'application/test+x-www-form-urlencoded',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string', description: undefined },
                    k2: { type: 'string', description: 'd2' },
                  },
                },
              },
            ],
          });
        });
      });

      describe('media type is not defined', () => {
        it('returns body containing schema, example and application/x-www-form-urlencoded media type', () => {
          expect(
            transformBody(
              new RequestBody({
                mode: 'urlencoded',
                urlencoded: [{ key: 'k1', value: 'v1' }],
              }),
            ),
          ).toEqual({
            contents: [
              {
                examples: [{ key: 'default', value: { k1: 'v1' } }],
                mediaType: 'application/x-www-form-urlencoded',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string', description: undefined },
                  },
                },
              },
            ],
          });
        });
      });
    });

    describe('body is not defined', () => {
      it('returns default empty body', () => {
        expect(transformBody(new RequestBody({ mode: 'urlencoded' }))).toEqual({
          contents: [
            {
              examples: [{ key: 'default', value: {} }],
              mediaType: 'application/x-www-form-urlencoded',
              schema: { properties: {}, type: 'object' },
            },
          ],
        });
      });

      it('returns no body', () => {
        expect(transformBody({ mode: 'urlencoded' } as RequestBody)).toBeUndefined();
      });
    });
  });

  describe('body is passed in unknown mode', () => {
    it('returns no body', () => {
      expect(transformBody({ mode: 'unknown' } as RequestBody)).toBeUndefined();
    });
  });
});

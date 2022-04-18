import { INodeExample } from '@stoplight/types';
import { Header, QueryParam, RequestBody } from 'postman-collection';

import { transformBody, transformHeader, transformPathParams, transformQueryParam } from '../params';

describe('transformQueryParam()', () => {
  describe('value is set', () => {
    it('transforms correctly', () => {
      expect(transformQueryParam(new QueryParam({ key: 'testKey', value: 'testValue' }))).toEqual({
        id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
        examples: [
          {
            id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
            key: 'default',
            value: 'testValue',
          },
        ],
        schema: {
          type: 'string',
        },
        name: 'testKey',
        style: 'form',
        required: true,
      });
    });
  });

  describe('value is null', () => {
    it('transforms correctly', () => {
      expect(transformQueryParam(new QueryParam({ key: 'testKey', value: null }))).toEqual({
        id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
        name: 'testKey',
        style: 'form',
        required: true,
      });
    });
  });

  describe('key is null', () => {
    it('transforms correctly with key being empty string', () => {
      expect(transformQueryParam(new QueryParam({ key: null, value: null }))).toEqual({
        id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
        name: '',
        style: 'form',
        required: true,
      });
    });
  });
});

describe('transformHeader()', () => {
  describe('value is defined', () => {
    it('result contains schema', () => {
      expect(transformHeader(new Header({ key: 'testKey', value: 'some string' }))).toEqual({
        id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
        name: 'testkey',
        schema: {
          type: 'string',
        },
        style: 'simple',
        required: true,
        examples: [
          {
            id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
            key: 'default',
            value: 'some string',
          },
        ],
      });
    });
  });

  describe('value is not defined', () => {
    it('results does not contain schema', () => {
      expect(transformHeader(new Header({ key: 'testKey' }))).toEqual({
        id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
        name: 'testkey',
        style: 'simple',
        required: true,
      });
    });
  });
});

describe('transformPathParams()', () => {
  it('transforms correctly', () => {
    expect(transformPathParams(['elem1', ':param1', ':param2', 'elem2'])).toEqual([
      { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), name: 'param1', style: 'simple', required: true },
      { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), name: 'param2', style: 'simple', required: true },
    ]);
  });
});

describe('transformBody()', () => {
  describe('body is passed in raw mode', () => {
    describe('body is defined', () => {
      describe('mediaType is JSON-ish', () => {
        describe('body is correctly defined json', () => {
          it('returns body containing example, schema and media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: '{"a":"b"}' }), 'application/nice+json')).toEqual({
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              contents: [
                {
                  id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                  examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: { a: 'b' } }],
                  mediaType: 'application/nice+json',
                  schema: {
                    $schema: 'http://json-schema.org/draft-07/schema#',
                    properties: {
                      a: {
                        type: 'string',
                      },
                    },
                    type: 'object',
                  },
                },
              ],
            });
          });
        });

        describe('body is not a correct JSON', () => {
          it('returns body containing example and media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: '"a":"b"' }), 'application/json')).toEqual({
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              contents: [
                {
                  id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                  examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: '"a":"b"' }],
                  mediaType: 'application/json',
                },
              ],
            });
          });
        });
      });

      describe('mediaType is not JSON-ish', () => {
        describe('media type is defined', () => {
          it('returns body containing example and given media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: '<a />' }), 'application/xml')).toEqual({
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              contents: [
                {
                  id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                  examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: '<a />' }],
                  mediaType: 'application/xml',
                },
              ],
            });
          });
        });

        describe('media type is not defined', () => {
          it('returns body containing example and text/plain media type', () => {
            expect(transformBody(new RequestBody({ mode: 'raw', raw: "I'm a goat. Bleeet!" }))).toEqual({
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              contents: [
                {
                  id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                  examples: [
                    { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: "I'm a goat. Bleeet!" },
                  ],
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
                mode: RequestBody.MODES.formdata,
                formdata: [
                  { key: 'k1', value: 'v1' },
                  { key: 'k2', value: 'v2', description: 'd2' },
                ],
              }),
              'multipart/test+form-data',
            ),
          ).toEqual({
            id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
            contents: [
              {
                id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                examples: [
                  { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: { k1: 'v1', k2: 'v2' } },
                ],
                mediaType: 'multipart/test+form-data',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string' },
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
            id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
            contents: [
              {
                id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: { k1: 'v1' } }],
                mediaType: 'multipart/form-data',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string' },
                  },
                },
              },
            ],
          });
        });
      });
    });

    describe('some keys are not defined', () => {
      it('returns body containing schema and example with generated keys', () => {
        const result = transformBody(
          new RequestBody({
            mode: RequestBody.MODES.formdata,
            formdata: [{ value: 'v1' }, { value: 'v2', description: 'd2' }],
          }),
          'multipart/test+form-data',
        );

        expect(result).toEqual({
          id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
          contents: [
            {
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              examples: [
                { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: expect.any(Object) },
              ],
              mediaType: 'multipart/test+form-data',
              schema: {
                type: 'object',
                properties: expect.any(Object),
              },
            },
          ],
        });

        // verify shape of schema object
        expect(Object.entries(result!.contents![0].schema!.properties!)).toEqual(
          expect.arrayContaining([
            [expect.stringMatching(/^_gen_[0-9a-f]{6}$/), { type: 'string' }],
            [expect.stringMatching(/^_gen_[0-9a-f]{6}$/), { type: 'string', description: 'd2' }],
          ]),
        );

        // verify shape of example object
        expect(Object.entries((result!.contents![0].examples![0] as INodeExample).value as unknown[])).toEqual(
          expect.arrayContaining([
            [expect.stringMatching(/^_gen_[0-9a-f]{6}$/), 'v1'],
            [expect.stringMatching(/^_gen_[0-9a-f]{6}$/), 'v2'],
          ]),
        );

        // ensure both share exactly the same keys
        expect(Object.keys(result!.contents![0].schema!.properties!).sort()).toEqual(
          Object.keys((result!.contents![0].examples![0] as INodeExample).value as unknown[]).sort(),
        );
      });
    });

    describe('body is not defined', () => {
      it('returns default empty body', () => {
        expect(transformBody(new RequestBody({ mode: 'formdata' }))).toEqual({
          id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
          contents: [
            {
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: {} }],
              mediaType: 'multipart/form-data',
              schema: { properties: {}, type: 'object' },
            },
          ],
        });
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
            id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
            contents: [
              {
                id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                examples: [
                  { id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: { k1: 'v1', k2: 'v2' } },
                ],
                mediaType: 'application/test+x-www-form-urlencoded',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string' },
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
            id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
            contents: [
              {
                id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
                examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: { k1: 'v1' } }],
                mediaType: 'application/x-www-form-urlencoded',
                schema: {
                  type: 'object',
                  properties: {
                    k1: { type: 'string' },
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
          id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
          contents: [
            {
              id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/),
              examples: [{ id: expect.stringMatching(/^_gen_[0-9a-f]{6}$/), key: 'default', value: {} }],
              mediaType: 'application/x-www-form-urlencoded',
              schema: { properties: {}, type: 'object' },
            },
          ],
        });
      });
    });
  });

  describe('body is passed in unknown mode', () => {
    it('returns no body', () => {
      expect(transformBody(new RequestBody({ mode: 'unknown' }))).toBeUndefined();
    });
  });
});

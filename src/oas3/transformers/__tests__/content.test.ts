import type { SchemaObject } from 'openapi3-ts';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import { resolveRef } from '../../../oas/resolver';
import {
  translateHeaderObject as _translateHeaderObject,
  translateMediaTypeObject as _translateMediaTypeObject,
} from '../content';

const translateMediaTypeObject = (document: any, object: unknown, key: string) =>
  _translateMediaTypeObject.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), [key, object], 0, []);

const translateHeaderObject = (object: unknown, key: string) =>
  _translateHeaderObject.call(createContext({}, resolveRef, DEFAULT_ID_GENERATOR), [key, object], 0, []);

describe('translateMediaTypeObject', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should gracefully handle invalid data', () => {
    expect(translateMediaTypeObject({}, null, 'mediaType')).toBeUndefined();
  });

  it('given empty object, should return nothing', () => {
    expect(translateMediaTypeObject({}, {}, 'mediaType')).toStrictEqual({
      id: expect.any(String),
      encodings: [],
      examples: [],
      mediaType: 'mediaType',
    });
  });

  it('given non-object schema, should return nothing', () => {
    expect(
      translateMediaTypeObject(
        {},
        {
          schema: 'foo',
        },
        'mediaType',
      ),
    ).toStrictEqual({
      id: expect.any(String),
      encodings: [],
      examples: [],
      mediaType: 'mediaType',
    });
  });

  it('given single example should translate to IHttpContent', () => {
    expect(
      translateMediaTypeObject(
        {},
        {
          schema: {},
          example: 'hey',
          encoding: {},
        },
        'mediaType',
      ),
    ).toMatchSnapshot({
      id: expect.any(String),
      examples: [
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight-id': expect.any(String),
      },
    });
  });

  it('given multiple examples should translate to IHttpContent', () => {
    expect(
      translateMediaTypeObject(
        {},
        {
          schema: {},
          examples: { example: { summary: 'multi example', value: 'hey' } },
          encoding: {},
        },
        'mediaType',
      ),
    ).toMatchSnapshot({
      id: expect.any(String),
      examples: [
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight-id': expect.any(String),
      },
    });
  });

  it('given encodings should translate each encoding to array item', () => {
    expect(
      translateMediaTypeObject(
        {},
        {
          schema: {},
          examples: {
            example: {
              id: 12133433,
              summary: 'multi example',
              value: 'hey',
            },
          },
          encoding: {
            enc1: {
              contentType: 'text/plain',
              headers: {
                h1: {},
              },
              style: 'form',
              explode: true,
              allowReserved: true,
            },
            enc2: {
              contentType: 'text/plain',
              headers: {
                h1: {},
              },
              style: 'form',
              explode: true,
              allowReserved: true,
            },
          },
        },
        'mediaType',
      ),
    ).toMatchSnapshot({
      id: expect.any(String),
      encodings: [
        {
          headers: [
            {
              id: expect.any(String),
            },
          ],
        },
        {
          headers: [
            {
              id: expect.any(String),
            },
          ],
        },
      ],
      examples: [
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight-id': expect.any(String),
      },
    });
  });

  it('given complex nested media type object should translate correctly', () => {
    expect(
      translateMediaTypeObject(
        {},
        {
          schema: {},
          examples: { example: { summary: 'multi example', value: 'hey' } },
          encoding: {
            enc1: {
              contentType: 'text/plain',
              style: 'form',
              headers: {
                h1: {
                  description: 'descr',
                  style: 'matrix',
                  examples: {
                    a: {
                      summary: 'example summary',
                      value: 'hey',
                    },
                  },
                  content: {
                    'nested/media': {},
                  },
                },
              },
            },
          },
        },
        'mediaType',
      ),
    ).toMatchSnapshot({
      id: expect.any(String),
      encodings: [
        {
          headers: [
            {
              id: expect.any(String),
              examples: [
                {
                  id: expect.any(String),
                },
              ],
            },
          ],
        },
      ],
      examples: [
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight-id': expect.any(String),
      },
    });
  });

  it('should skip nullish headers', () => {
    expect(
      translateMediaTypeObject(
        {},
        {
          schema: {},
          examples: { example: { summary: 'multi example', value: 'hey' } },
          encoding: {
            enc1: {
              contentType: 'text/plain',
              style: 'form',
              headers: {
                '0': null,
              },
            },
          },
        },
        'mediaType',
      ),
    ).toMatchSnapshot({
      id: expect.any(String),
      examples: [
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight-id': expect.any(String),
      },
    });
  });

  it('given encoding with no style it should not throw an error', () => {
    const testedFunction = () => {
      translateMediaTypeObject(
        {},
        {
          schema: {},
          examples: { example: { summary: 'multi example' } },
          encoding: {
            enc1: {
              contentType: 'text/plain',
            },
          },
        },
        'mediaType',
      );
    };
    expect(() => testedFunction()).not.toThrow();
  });

  describe('schema integrity after transform', () => {
    const schema = {
      type: 'string',
      nullable: true,
      description: 'A simple string',
      example: 'hello',
      deprecated: true,
      writeOnly: true,
      readOnly: true,
      externalDocs: { url: 'http://example.com/docs', description: 'Shiny docs' },
      xml: {},
    };

    const originalSchema = JSON.parse(JSON.stringify(schema));
    const translatedObject = translateMediaTypeObject(
      {},
      {
        schema,
        example: 'hey',
        encoding: {},
      },
      'mediaType',
    )!;

    it('will not modify the original schema so it can be reused in references ', () => {
      expect(schema).toStrictEqual(originalSchema);
    });

    it('will keep the deprecated property', () => {
      expect(translatedObject.schema).toHaveProperty('deprecated', true);
    });

    it('will keep the writeOnly property', () => {
      expect(translatedObject.schema).toHaveProperty('writeOnly', true);
    });

    it('will keep the readOnly property', () => {
      expect(translatedObject.schema).toHaveProperty('readOnly', true);
    });

    it('will keep the xml property', () => {
      expect(translatedObject.schema).toHaveProperty('xml', {});
    });

    it('will keep the externalDocs property', () => {
      expect(translatedObject.schema).toHaveProperty('externalDocs', {
        url: 'http://example.com/docs',
        description: 'Shiny docs',
      });
    });
  });

  describe('schema examples', () => {
    const defaultExample = {
      name: 'default value',
    };

    describe('given response with schema with examples', () => {
      it('should translate to IHttpContent', () => {
        expect(
          translateMediaTypeObject(
            {},
            {
              schema: {
                example: defaultExample,
              },
              encoding: {},
            },
            'mediaType',
          ),
        ).toHaveProperty('examples', [{ id: expect.any(String), key: 'default', value: defaultExample }]);
      });
    });

    describe('given response with examples in media and schema objects', () => {
      it('root example should take precedence over schema example', () => {
        expect(
          translateMediaTypeObject(
            {},
            {
              schema: {
                example: defaultExample,
              },
              examples: { example: { value: { name: 'root example value' } } },
              example: {
                name: 'root default value',
              },
              encoding: {},
            },
            'mediaType',
          ),
        ).toHaveProperty('examples', [
          { id: expect.any(String), key: 'default', value: { name: 'root default value' } },
          { id: expect.any(String), key: 'example', value: { name: 'root example value' } },
        ]);
      });
    });
  });
});

describe('schema invalid', () => {
  it('type as array does not throw error', () => {
    const schema = {
      type: ['string', 'object'],
      description: 'A simple string',
      example: 'hello',
    } as unknown as SchemaObject;

    expect(() =>
      translateMediaTypeObject(
        {},
        {
          schema,
        },
        'mediaType',
      ),
    ).not.toThrow();
  });

  it('nullish values in arrays', () => {
    /*
      # Equivalent in YAML
      type: array
      items:
        -
        - object
     */
    const schema = {
      type: 'array',
      items: [null, 'object'],
    };

    expect(() =>
      translateMediaTypeObject(
        {},
        {
          schema,
        },
        'mediaType',
      ),
    ).not.toThrow();
  });

  it('nullish mapping value', () => {
    /*
     # Equivalent in YAML
     type: array
     items:
    */
    const schema = {
      type: 'array',
      items: null,
    } as any;

    expect(() =>
      translateMediaTypeObject(
        {},
        {
          schema,
        },
        'mediaType',
      ),
    ).not.toThrow();
  });
});

describe('translateHeaderObject', () => {
  it('should translate to IHttpHeaderParam', () => {
    expect(
      translateHeaderObject(
        {
          description: 'descr',
          required: true,
          deprecated: true,
          allowEmptyValue: true,
          style: 'matrix',
          explode: true,
          allowReserved: true,
          schema: {},
          examples: {
            a: {
              summary: 'example summary',
              value: 'hey',
            },
          },
          example: {},
          content: {},
        },
        'header-name',
      ),
    ).toMatchSnapshot({
      id: expect.any(String),
      examples: [
        {
          id: expect.any(String),
        },
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight-id': expect.any(String),
      },
    });
  });

  it('should handle nullish value gracefully', () => {
    expect(translateHeaderObject(null, 'header')).toBeUndefined();
  });
});

import { translateHeaderObject, translateMediaTypeObject } from '../content';

describe('translateMediaTypeObject', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('given single example should translate to IHttpContent', () => {
    expect(
      translateMediaTypeObject(
        {
          schema: {},
          example: 'hey',
          encoding: {},
        },
        'mediaType',
      ),
    ).toMatchSnapshot();
  });

  test('given multiple examples should translate to IHttpContent', () => {
    expect(
      translateMediaTypeObject(
        {
          schema: {},
          examples: { example: { summary: 'multi example', value: 'hey' } },
          encoding: {},
        },
        'mediaType',
      ),
    ).toMatchSnapshot();
  });

  test('given encodings should translate each encoding to array item', () => {
    expect(
      translateMediaTypeObject(
        {
          schema: {},
          examples: { example: { summary: 'multi example', value: 'hey' } },
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
    ).toMatchSnapshot();
  });

  test('given complex nested media type object should translate correctly', () => {
    expect(
      translateMediaTypeObject(
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
    ).toMatchSnapshot();
  });

  test('given encoding with incorrect style should throw an error', () => {
    const testedFunction = () => {
      translateMediaTypeObject(
        {
          schema: {},
          examples: { example: { summary: 'multi example' } },
          encoding: {
            enc1: {
              contentType: 'text/plain',
              style: 'xyz',
            },
          },
        },
        'mediaType',
      );
    };
    expect(testedFunction).toThrowErrorMatchingSnapshot();
  });

  test('given encoding with no style it should not throw an error', () => {
    const testedFunction = () => {
      translateMediaTypeObject(
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

  test('will not modify the original schema so it can be reused in references ', () => {
    const schema = {
      type: 'string',
      nullable: true,
      description: 'A simple string',
    };

    const originalSchema = JSON.parse(JSON.stringify(schema));

    translateMediaTypeObject(
      {
        schema,
        example: 'hey',
        encoding: {},
      },
      'mediaType',
    );

    expect(schema).toStrictEqual(originalSchema);
  });
});

describe('translateHeaderObject', () => {
  test('should translate to IHttpHeaderParam', () => {
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
    ).toMatchSnapshot();
  });
});

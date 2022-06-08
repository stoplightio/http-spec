import { createContext } from '../../../oas/context';
import { translateHeaderObject as _translateHeaderObject } from '../headers';

const translateHeaderObject = (object: unknown, key: string) =>
  _translateHeaderObject.call(createContext({}), [key, object]);

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
            b: {
              summary: 'example summary',
              externalValue: 'https://stoplight.io/b',
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
        {
          id: expect.any(String),
        },
      ],
      schema: {
        'x-stoplight': {
          id: expect.any(String),
        },
      },
    });
  });

  it('should handle nullish value gracefully', () => {
    expect(translateHeaderObject(null, 'header')).toBeUndefined();
  });
});

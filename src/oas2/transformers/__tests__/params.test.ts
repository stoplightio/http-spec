import { FormDataParameter, QueryParameter } from 'swagger-schema-official';

import { HttpParamStyles } from '@stoplight/types';
import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToHeaderParams,
  translateToPathParameter,
  translateToQueryParameter,
} from '../params';

describe('params.translator', () => {
  let consumes = ['*'];

  describe('translateToHeaderParam', () => {
    test('should translate header param', () => {
      expect(
        translateToHeaderParam({
          required: true,
          name: 'name',
          type: 'integer',
          in: 'header',
          minimum: 12,
          description: 'desc',
        }),
      ).toMatchSnapshot();
    });
  });

  describe('translateToHeaderParams', () => {
    test('should translate empty dictionary to empty array', () => {
      expect(translateToHeaderParams({})).toMatchSnapshot();
    });

    test('should translate to simple header param', () => {
      expect(
        translateToHeaderParams({
          'header-name': {
            description: 'a description',
            type: 'string',
          },
        }),
      ).toMatchSnapshot();
    });

    test('should translate to multiple header params', () => {
      expect(
        translateToHeaderParams({
          'header-name': {
            description: 'a description',
            type: 'string',
          },
          'plain-tex': {
            description: 'another description',
            type: 'string',
          },
        }),
      ).toMatchSnapshot();
    });
  });

  describe('translateToBodyParameter', () => {
    test('should translate to body parameter', () => {
      expect(
        translateToBodyParameter(
          {
            in: 'body',
            name: 'name',
            required: true,
            description: 'descr',
            schema: {
              format: 'e-mail',
            },
          },
          consumes,
        ),
      ).toMatchSnapshot();
    });

    test('should preserve readOnly flag in schema', () => {
      expect(
        translateToBodyParameter(
          {
            in: 'body',
            name: 'name',
            required: true,
            description: 'descr',
            schema: {
              readOnly: true,
            },
          },
          consumes,
        ),
      ).toEqual(
        expect.objectContaining({
          contents: expect.arrayContaining([expect.objectContaining({ schema: { readOnly: true } })]),
        }),
      );
    });

    test('given x-examples should translate to body parameter with multiple examples', () => {
      expect(
        translateToBodyParameter(
          {
            in: 'body',
            name: 'name',
            required: true,
            description: 'descr',
            schema: {
              format: 'e-mail',
            },
            // @ts-ignore: "x-examples" isn't technically supported by the OAS2 spec
            'x-examples': {
              'example-1': {
                hello: 'world',
              },
              'example-2': {
                foo: 'bar',
              },
            },
          },
          consumes,
        ),
      ).toMatchSnapshot();
    });
  });

  describe('translateToFormDataParameter', () => {
    beforeAll(() => {
      consumes = ['application/x-www-form-urlencoded', 'multipart/form-data'];
    });

    const formDataParameterString: FormDataParameter = {
      in: 'formData',
      name: 'str',
      type: 'string',
      format: 'date',
      description: 'desc',
      required: true,
      allowEmptyValue: false,
      default: '25-07-2019',
    };

    const formDataParameterArray: FormDataParameter = {
      in: 'formData',
      name: 'arr',
      type: 'array',
      description: 'desc',
      collectionFormat: 'multi',
      items: {
        type: 'number',
      },
      required: true,
      maxItems: 10,
      minItems: 1,
    };

    const formDataParameterInteger: FormDataParameter = {
      in: 'formData',
      name: 'int',
      type: 'integer',
      description: 'desc',
      required: true,
      maximum: 3,
      minimum: 0,
    };

    test('converts parameters into schema', () => {
      const expectedContent = {
        encodings: [
          {
            explode: true,
            property: 'arr',
            style: 'form',
          },
        ],
        schema: {
          properties: {
            arr: {
              description: 'desc',
              items: {
                type: 'number',
              },
              maxItems: 10,
              minItems: 1,
              type: 'array',
            },
            int: {
              description: 'desc',
              maximum: 3,
              minimum: 0,
              type: 'integer',
            },
            str: {
              allowEmptyValue: false,
              minLength: 1,
              default: '25-07-2019',
              description: 'desc',
              format: 'date',
              type: 'string',
            },
          },
          required: ['str', 'arr', 'int'],
          type: 'object',
        },
      };

      expect(
        translateFromFormDataParameters(
          [formDataParameterString, formDataParameterArray, formDataParameterInteger],
          consumes,
        ),
      ).toEqual({
        contents: [
          Object.assign({}, expectedContent, { mediaType: 'application/x-www-form-urlencoded' }),
          Object.assign({}, expectedContent, { mediaType: 'multipart/form-data' }),
        ],
      });
    });
  });

  describe('translateToQueryParameter', () => {
    const parameter: QueryParameter = {
      required: true,
      description: 'descr',
      name: 'name',
      in: 'query',
      type: 'number',
      allowEmptyValue: true,
    };

    test.each([
      { oasStyle: 'pipes', expectedStyle: HttpParamStyles.PipeDelimited },
      { oasStyle: 'ssv', expectedStyle: HttpParamStyles.SpaceDelimited },
      { oasStyle: 'csv', expectedStyle: HttpParamStyles.CommaDelimited },
      { oasStyle: 'multi', expectedStyle: HttpParamStyles.Form },
      { oasStyle: 'nasino', expectedStyle: HttpParamStyles.Form },
    ])('translate style: %s', ({ oasStyle, expectedStyle }) => {
      expect(translateToQueryParameter({ ...parameter, collectionFormat: oasStyle } as QueryParameter)).toHaveProperty(
        'style',
        expectedStyle,
      );
    });
  });

  describe('translateToPathParameter', () => {
    test('should translate', () => {
      expect(
        translateToPathParameter({
          required: true,
          description: 'descr',
          name: 'name',
          in: 'path',
          type: 'string',
        }),
      ).toMatchSnapshot();
    });
  });
});

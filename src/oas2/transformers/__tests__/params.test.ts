import { DeepPartial, HttpParamStyles } from '@stoplight/types';
import { FormDataParameter, QueryParameter, Spec } from 'swagger-schema-official';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import { resolveRef } from '../../../oas/resolver';
import {
  translateFromFormDataParameters as _translateFromFormDataParameters,
  translateToBodyParameter as _translateToBodyParameter,
  translateToHeaderParam as _translateToHeaderParam,
  translateToHeaderParams as _translateToHeaderParams,
  translateToPathParameter as _translateToPathParameter,
  translateToQueryParameter as _translateToQueryParameter,
} from '../params';

const translateFromFormDataParameters = (
  document: DeepPartial<Spec>,
  ...params: Parameters<typeof _translateFromFormDataParameters>
) => _translateFromFormDataParameters.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), ...params);

const translateToBodyParameter = (
  document: DeepPartial<Spec>,
  ...params: Parameters<typeof _translateToBodyParameter>
) => _translateToBodyParameter.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), ...params);

const translateToHeaderParam = (document: DeepPartial<Spec>, ...params: Parameters<typeof _translateToHeaderParam>) =>
  _translateToHeaderParam.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), ...params);

const translateToHeaderParams = (document: DeepPartial<Spec>, ...params: Parameters<typeof _translateToHeaderParams>) =>
  _translateToHeaderParams.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), ...params);

const translateToPathParameter = (
  document: DeepPartial<Spec>,
  ...params: Parameters<typeof _translateToPathParameter>
) => _translateToPathParameter.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), ...params);

const translateToQueryParameter = (
  document: DeepPartial<Spec>,
  ...params: Parameters<typeof _translateToQueryParameter>
) => _translateToQueryParameter.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), ...params);

describe('params.translator', () => {
  let consumes = ['*'];

  describe('translateToHeaderParam', () => {
    it('should translate header param', () => {
      expect(
        translateToHeaderParam(
          {},
          {
            required: true,
            name: 'name',
            type: 'integer',
            in: 'header',
            minimum: 12,
            description: 'desc',
          },
        ),
      ).toMatchSnapshot({
        id: expect.any(String),
        schema: {
          'x-stoplight-id': expect.any(String),
        },
      });
    });
  });

  describe('translateToHeaderParams', () => {
    it('should translate empty dictionary to empty array', () => {
      expect(translateToHeaderParams({}, {})).toMatchSnapshot();
    });

    it('should translate to simple header param', () => {
      expect(
        translateToHeaderParams(
          {},
          {
            'header-name': {
              description: 'a description',
              type: 'string',
            },
          },
        ),
      ).toMatchSnapshot();
    });

    it('should translate to multiple header params', () => {
      expect(
        translateToHeaderParams(
          {},
          {
            'header-name': {
              description: 'a description',
              type: 'string',
            },
            'plain-tex': {
              description: 'another description',
              type: 'string',
            },
          },
        ),
      ).toMatchSnapshot();
    });
  });

  describe('translateToBodyParameter', () => {
    it('should translate to body parameter', () => {
      expect(
        translateToBodyParameter(
          {},
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
      ).toMatchSnapshot({
        id: expect.any(String),
        contents: [
          {
            id: expect.any(String),
            schema: {
              'x-stoplight-id': expect.any(String),
            },
          },
        ],
      });
    });

    it('should preserve readOnly flag in schema', () => {
      expect(
        translateToBodyParameter(
          {},
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
          contents: expect.arrayContaining([
            expect.objectContaining({
              schema: {
                'x-stoplight-id': expect.any(String),
                $schema: 'http://json-schema.org/draft-07/schema#',
                readOnly: true,
              },
            }),
          ]),
        }),
      );
    });

    it('given x-examples should translate to body parameter with multiple examples', () => {
      expect(
        translateToBodyParameter(
          {},
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
      ).toMatchSnapshot({
        id: expect.any(String),
        contents: [
          {
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
          },
        ],
      });
    });

    describe('schema examples', () => {
      describe('given response with schema with x-examples', () => {
        it('should translate to body parameter with examples', () => {
          const body = translateToBodyParameter(
            {},
            {
              in: 'body',
              name: 'name',
              schema: {
                // @ts-ignore: "x-examples" as schema extension
                'x-examples': {
                  'example-1': {
                    hello: 'world',
                  },
                  'example-2': {
                    foo: 'bar',
                  },
                },
              },
            },
            consumes,
          );

          expect(body).toEqual(
            expect.objectContaining({
              contents: expect.arrayContaining([
                expect.objectContaining({
                  examples: [
                    { id: expect.any(String), key: 'example-1', value: { hello: 'world' } },
                    { id: expect.any(String), key: 'example-2', value: { foo: 'bar' } },
                  ],
                }),
              ]),
            }),
          );
        });
      });

      describe('given response with body param and schema examples', () => {
        it('root x-examples should take precedence over schema examples', () => {
          const body = translateToBodyParameter(
            {},
            {
              in: 'body',
              name: 'name',
              schema: {
                // @ts-ignore: "x-examples" as schema and oas extension
                'x-examples': {
                  'example-1': {
                    hello: 'world',
                  },
                },
              },
              'x-examples': {
                'example-2': {
                  foo: 'bar',
                },
              },
            },
            consumes,
          );

          expect(body).toEqual(
            expect.objectContaining({
              contents: expect.arrayContaining([
                expect.objectContaining({
                  examples: [{ id: expect.any(String), key: 'example-2', value: { foo: 'bar' } }],
                }),
              ]),
            }),
          );
        });
      });
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

    it('converts parameters into schema', () => {
      const expectedContent = {
        id: expect.any(String),
        encodings: [
          {
            explode: true,
            property: 'arr',
            style: 'form',
          },
        ],
        schema: {
          'x-stoplight-id': expect.any(String),
          $schema: 'http://json-schema.org/draft-07/schema#',
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
          {},
          [formDataParameterString, formDataParameterArray, formDataParameterInteger],
          consumes,
        ),
      ).toEqual({
        id: expect.any(String),
        contents: [
          Object.assign({}, expectedContent, { mediaType: 'application/x-www-form-urlencoded' }),
          Object.assign({}, expectedContent, { mediaType: 'multipart/form-data' }),
        ],
      });
    });
  });

  describe('translateToQueryParameter', () => {
    const parameter: QueryParameter & { 'x-deprecated'?: boolean } = {
      required: true,
      description: 'descr',
      name: 'name',
      in: 'query',
      type: 'number',
      allowEmptyValue: true,
      ['x-deprecated']: true,
    };

    it.each([
      { oasStyle: 'pipes', expectedStyle: HttpParamStyles.PipeDelimited },
      { oasStyle: 'ssv', expectedStyle: HttpParamStyles.SpaceDelimited },
      { oasStyle: 'csv', expectedStyle: HttpParamStyles.CommaDelimited },
      { oasStyle: 'multi', expectedStyle: HttpParamStyles.Form },
      { oasStyle: 'nasino', expectedStyle: HttpParamStyles.Form },
    ])('translate style: %s', ({ oasStyle, expectedStyle }) => {
      expect(
        translateToQueryParameter({}, { ...parameter, collectionFormat: oasStyle } as QueryParameter),
      ).toHaveProperty('style', expectedStyle);
    });

    it('translate x-deprecated', () => {
      expect(translateToQueryParameter({}, parameter)).toHaveProperty('deprecated', true);
    });
  });

  describe('translateToPathParameter', () => {
    it('should translate', () => {
      expect(
        translateToPathParameter(
          {},
          {
            required: true,
            description: 'descr',
            name: 'name',
            in: 'path',
            type: 'string',
          },
        ),
      ).toMatchSnapshot({
        id: expect.any(String),
        schema: {
          'x-stoplight-id': expect.any(String),
        },
      });
    });
  });
});

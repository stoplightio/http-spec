import { HttpParamStyles } from '@stoplight/types';
import { QueryParameter } from 'swagger-schema-official';

import {
  translateFromFormDataParameter,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToHeaderParams,
  translateToPathParameter,
  translateToQueryParameter,
} from '../params';

describe('params.translator', () => {
  const consumes = ['*'];

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
    test('given request body with empty encodings should create encoding', () => {
      expect(
        translateFromFormDataParameter(
          {
            name: 'name',
            type: 'string',
            description: 'desc',
            required: true,
            in: 'formData',
          },
          {
            contents: [
              {
                mediaType: 'application/json',
              },
            ],
          },
          consumes,
        ),
      ).toMatchSnapshot();
    });

    test('given request body with existing encoding should append', () => {
      expect(
        translateFromFormDataParameter(
          {
            name: 'name',
            type: 'string',
            description: 'desc',
            required: true,
            in: 'formData',
          },
          {
            contents: [
              {
                examples: [],
                mediaType: 'application/json',
                encodings: [
                  {
                    headers: [],
                    property: 'prop',
                    style: HttpParamStyles.SpaceDelimited,
                  },
                ],
              },
            ],
          },
          consumes,
        ),
      ).toMatchSnapshot();
    });

    test('given no request body should create one', () => {
      expect(
        translateFromFormDataParameter(
          {
            name: 'name',
            type: 'string',
            description: 'desc',
            required: true,
            in: 'formData',
          },
          null,
          consumes,
        ),
      ).toMatchSnapshot();
    });

    test('given a request body it should add a property to the schema', () => {
      expect(
        translateFromFormDataParameter(
          {
            name: 'name',
            type: 'string',
            description: 'desc',
            required: true,
            in: 'formData',
          },
          {
            contents: [
              {
                examples: [],
                mediaType: 'application/json',
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    count: { type: 'number' },
                  },
                  required: ['id'],
                },
              },
            ],
          },
          consumes,
        ),
      ).toMatchSnapshot();
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

    test.each(['pipes', 'ssv', 'csv', 'multi', 'something-else'])('translate style: %s', style => {
      expect(translateToQueryParameter({ ...parameter, collectionFormat: style } as QueryParameter)).toMatchSnapshot();
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

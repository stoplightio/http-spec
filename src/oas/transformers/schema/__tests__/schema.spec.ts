import { createContext } from '../../../context';
import { translateSchemaObject } from '..';
import type { OASSchemaObject } from '../types';

const translate = (schemaObject: OASSchemaObject) => translateSchemaObject.call(createContext({}), schemaObject);

describe('translateSchemaObject', () => {
  it('should translate id', () => {
    expect(
      translate({
        type: 'object',
        properties: {
          test: {
            id: 'test',
          },
        },
      }),
    ).toStrictEqual({
      'x-stoplight': {
        id: expect.any(String),
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        test: {
          $id: 'test',
        },
      },
    });
  });

  it('should translate exclusiveMinimum/exclusiveMaximum', () => {
    expect(
      translate({
        anyOf: [
          {
            type: 'integer',
            minimum: 2,
            maximum: 10,
            exclusiveMinimum: true,
            exclusiveMaximum: true,
          },
          {
            type: 'integer',
            minimum: 2,
            maximum: 10,
            exclusiveMinimum: false,
            exclusiveMaximum: true,
          },
          {
            type: 'integer',
            minimum: 2,
            maximum: 10,
            exclusiveMinimum: true,
            exclusiveMaximum: false,
          },
          {
            type: 'integer',
            minimum: 2,
            maximum: 10,
            exclusiveMinimum: false,
            exclusiveMaximum: false,
          },
        ],
      }),
    ).toStrictEqual({
      'x-stoplight': {
        id: expect.any(String),
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      anyOf: [
        {
          type: 'integer',
          exclusiveMinimum: 2,
          exclusiveMaximum: 10,
        },
        {
          type: 'integer',
          minimum: 2,
          exclusiveMaximum: 10,
        },
        {
          type: 'integer',
          exclusiveMinimum: 2,
          maximum: 10,
        },
        {
          type: 'integer',
          minimum: 2,
          maximum: 10,
        },
      ],
    });
  });

  it('should translate numeric formats', () => {
    expect(
      translate({
        anyOf: [
          {
            type: 'integer',
            format: 'int64',
            maximum: 2 ** 40,
          },
          {
            type: 'integer',
            format: 'int32',
            minimum: 0,
          },
          {
            type: 'number',
            format: 'float',
          },
          {
            type: 'string',
            format: 'byte',
          },
        ],
      }),
    ).toStrictEqual({
      'x-stoplight': {
        id: expect.any(String),
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      anyOf: [
        {
          type: 'integer',
          format: 'int64',
          minimum: 0 - 2 ** 63,
          maximum: 2 ** 40,
        },
        {
          type: 'integer',
          format: 'int32',
          minimum: 0,
          maximum: 2 ** 31 - 1,
        },
        {
          type: 'number',
          format: 'float',
          minimum: 0 - 2 ** 128,
          maximum: 2 ** 128 - 1,
        },
        {
          type: 'string',
          format: 'byte',
          pattern: '^[\\w\\d+\\/=]*$',
        },
      ],
    });
  });

  it('should keep properties using keywords as keys', () => {
    expect(
      translate({
        properties: {
          exclusiveMinimum: {
            type: 'integer',
          },
          minimum: {
            type: 'number',
          },
        },
      }),
    ).toStrictEqual({
      'x-stoplight': {
        id: expect.any(String),
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
      properties: {
        exclusiveMinimum: {
          type: 'integer',
        },
        minimum: {
          type: 'number',
        },
      },
    });
  });

  it('should not mutate schema', () => {
    let before: OASSchemaObject = {
      type: 'object',
      properties: {
        test: {
          id: 'test',
        },
      },
    };

    translate(before);

    expect(before).toStrictEqual({
      type: 'object',
      properties: {
        test: {
          id: 'test',
        },
      },
    });
  });

  it('should handle circular references', () => {
    const schema = {
      type: 'object',
      properties: {
        id: {
          type: 'string',
        },
        address: {
          type: 'object',
          properties: {
            city: {},
          },
        },
        location: {},
      },
    };

    schema.properties.location = schema.properties.address;
    schema.properties.address.properties.city = schema.properties.location;

    expect(translate.bind(null, schema as OASSchemaObject)).not.toThrow();
  });

  describe('OAS2 Schema Object', () => {
    it('should translate x-nullable', () => {
      expect(
        translate({
          type: 'string',
          'x-nullable': true,
        }),
      ).toStrictEqual({
        'x-stoplight': {
          id: expect.any(String),
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: ['string', 'null'],
      });
    });

    it('should translate x-example', () => {
      expect(
        translate({
          type: 'string',
          'x-example': 'Cat',
        }),
      ).toStrictEqual({
        'x-stoplight': {
          id: expect.any(String),
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        examples: ['Cat'],
      });
    });
  });

  describe('OAS3.0 Schema Object', () => {
    it('should translate nullable', () => {
      expect(
        translate({
          type: 'string',
          nullable: true,
        }),
      ).toStrictEqual({
        'x-stoplight': {
          id: expect.any(String),
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: ['string', 'null'],
      });
    });

    it('should translate example', () => {
      expect(
        translate({
          type: 'string',
          example: 'Cat',
        }),
      ).toStrictEqual({
        'x-stoplight': {
          id: expect.any(String),
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        examples: ['Cat'],
      });
    });

    it('should translate format=base64', () => {
      expect(
        translate({
          type: 'string',
          format: 'base64',
        }),
      ).toStrictEqual({
        'x-stoplight': {
          id: expect.any(String),
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        contentEncoding: 'base64',
      });
    });

    it('should translate format=binary', () => {
      expect(
        translate({
          type: 'string',
          format: 'binary',
        }),
      ).toStrictEqual({
        'x-stoplight': {
          id: expect.any(String),
        },
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        contentMediaType: 'application/octet-stream',
      });
    });
  });
});

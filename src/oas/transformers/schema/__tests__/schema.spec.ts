import { translateSchemaObject } from '..';
import { OASSchemaObject } from '../types';

const translate = (schemaObject: OASSchemaObject) => translateSchemaObject({}, schemaObject);

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
        type: 'integer',
        minimum: 2,
        maximum: 10,
        exclusiveMinimum: true,
        exclusiveMaximum: true,
      }),
    ).toStrictEqual({
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'integer',
      exclusiveMinimum: 2,
      exclusiveMaximum: 10,
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
      $schema: 'http://json-schema.org/draft-07/schema#',
      anyOf: [
        {
          type: 'integer',
          minimum: 0 - 2 ** 63,
          maximum: 2 ** 40,
        },
        {
          type: 'integer',
          minimum: 0,
          maximum: 2 ** 31 - 1,
        },
        {
          type: 'number',
          minimum: 0 - 2 ** 128,
          maximum: 2 ** 128 - 1,
        },
        {
          type: 'string',
          pattern: '^[\\w\\d+\\/=]*$',
        },
      ],
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

  describe('OAS2 Schema Object', () => {
    it('should translate x-nullable', () => {
      expect(
        translate({
          type: 'string',
          'x-nullable': true,
        }),
      ).toStrictEqual({
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
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'string',
        contentMediaType: 'application/octet-stream',
      });
    });
  });
});

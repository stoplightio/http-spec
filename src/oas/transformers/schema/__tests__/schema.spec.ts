import { translateSchemaObject } from '..';
import { OASSchemaObject } from '../types';

const translate = (schemaObject: OASSchemaObject) => translateSchemaObject(schemaObject, { pruneNotSupported: [] });

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

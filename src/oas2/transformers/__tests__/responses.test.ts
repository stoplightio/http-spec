import { DeepPartial } from '@stoplight/types';
import { Operation, Schema, Spec } from 'swagger-schema-official';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import { resolveRef } from '../../../oas/resolver';
import { translateToResponses as _translateToResponses } from '../responses';

const translateToResponses = (document: DeepPartial<Spec>, responses: DeepPartial<Operation['responses']>) =>
  _translateToResponses.call(createContext(document, resolveRef, DEFAULT_ID_GENERATOR), { responses });

describe('responses', () => {
  const produces = ['application/json', 'application/xml'];

  it('should translate to multiple responses', () => {
    const responses = translateToResponses(
      { produces },
      {
        r1: {
          description: 'd1',
          examples: {
            'application/json': {},
          },
          headers: {},
          schema: {},
        },
        r2: {
          description: 'd2',
          examples: {
            'application/xml': {},
          },
          headers: {},
          schema: {},
        },
      },
    );

    expect(responses).toHaveLength(2);
    expect(responses[0]).toMatchSnapshot({
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
          examples: [
            {
              id: expect.any(String),
            },
          ],
        },
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
          examples: [],
        },
      ],
    });
    expect(responses[1]).toMatchSnapshot({
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
        },
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
          examples: [
            {
              id: expect.any(String),
            },
          ],
        },
      ],
    });
  });

  it('should translate to response w/o headers', () => {
    const responses = translateToResponses(
      { produces },
      {
        r1: {
          description: 'd1',
          examples: {
            'application/xml': {},
          },
          schema: {},
        },
      },
    );

    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchSnapshot({
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
        },
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
          examples: [
            {
              id: expect.any(String),
            },
          ],
        },
      ],
    });
  });

  it('should translate to response w/o examples', () => {
    const responses = translateToResponses(
      { produces },
      {
        r1: {
          description: 'd1',
          schema: {},
        },
      },
    );

    expect(responses).toHaveLength(1);
    expect(responses[0]).toMatchSnapshot({
      id: expect.any(String),
      contents: [
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
        },
        {
          id: expect.any(String),
          schema: {
            'x-stoplight-id': expect.any(String),
          },
        },
      ],
    });
  });

  describe('should keep foreign examples', () => {
    it('aggregating them to the first example', () => {
      const responses = translateToResponses(
        { produces },
        {
          r1: {
            description: 'd1',
            examples: {
              'application/i-have-no-clue': {},
              'application/json': {},
            },
            headers: {},
            schema: {},
          },
        },
      );

      expect(responses[0].contents).toBeDefined();
      expect(responses[0].contents![0]).toHaveProperty('mediaType', 'application/json');

      expect(responses[0].contents![0].examples).toBeDefined();
      expect(responses[0].contents![0].examples).toHaveLength(2);
    });
  });

  describe('schema examples', () => {
    describe('given a response with a schema with an example', () => {
      it('should translate to response with examples', () => {
        const responses = translateToResponses(
          { produces },
          {
            r1: {
              description: 'd1',
              headers: {},
              schema: {
                example: {
                  name: 'value',
                },
              },
            },
          },
        );
        expect(responses[0].contents![0]).toHaveProperty('examples', [
          { id: expect.any(String), key: 'default', value: { name: 'value' } },
        ]);
      });
    });

    describe('given multiple schema example properties', () => {
      it('should translate all examples', () => {
        const responses = translateToResponses(
          { produces },
          {
            r1: {
              description: 'd1',
              headers: {},
              schema: {
                example: {
                  name: 'example value',
                },
                ['x-examples']: {
                  'application/json': {
                    name: 'examples value',
                  },
                },
              } as Schema,
            },
          },
        );
        expect(responses[0].contents![0]).toHaveProperty('examples', [
          { id: expect.any(String), key: 'application/json', value: { name: 'examples value' } },
          { id: expect.any(String), key: 'default', value: { name: 'example value' } },
        ]);
      });
    });

    describe('given response with examples in root and schema objects', () => {
      it('root examples should take precedence over schema examples', () => {
        const responses = translateToResponses(
          { produces },
          {
            r1: {
              description: 'd1',
              headers: {},
              examples: {
                'application/i-have-no-clue': {},
                'application/json': {},
              },
              schema: {
                example: {
                  name: 'value',
                },
              },
            },
          },
        );
        expect(responses[0].contents![0].examples).toHaveLength(2);
        expect(responses[0].contents![0].examples).toEqual([
          { id: expect.any(String), key: 'application/json', value: {} },
          { id: expect.any(String), key: 'application/i-have-no-clue', value: {} },
        ]);
      });
    });
  });
});

import { DeepPartial } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import { resolveRef } from '../../../oas/resolver';
import { translateToServers as _translateToServers } from '../servers';

const translateToServers = (
  document: DeepPartial<OpenAPIObject> & { paths: { '/pet': { get: Record<string, unknown> } } },
) =>
  _translateToServers.call(
    createContext(document, resolveRef, DEFAULT_ID_GENERATOR),
    document.paths['/pet'],
    document.paths['/pet'].get,
  );

describe('translateToServers', () => {
  it('translate single ServerObject to IServer', () => {
    const document = {
      servers: [
        {
          description: 'description',
          url: 'http://stoplight.io/path',
          variables: {
            a: {
              default: false,
              enum: [false, true, false],
              description: 'a - descr',
            },
            b: {
              default: 123,
              enum: [1, 2, 3],
              description: 'b - descr',
            },
          },
        },
      ],
      paths: {
        '/pet': {
          get: {},
        },
      },
    };

    expect(translateToServers(document)).toStrictEqual([
      {
        id: expect.any(String),
        description: 'description',
        url: 'http://stoplight.io/path',
        variables: {
          a: {
            default: 'false',
            description: 'a - descr',
            enum: ['false', 'true', 'false'],
          },
          b: {
            default: '123',
            description: 'b - descr',
            enum: ['1', '2', '3'],
          },
        },
      },
    ]);
  });

  it('filters out invalid variables', () => {
    const document = {
      servers: [
        {
          description: 'description',
          url: 'http://stoplight.io/path',
          variables: {
            a: null,
            b: {
              default: 123,
              enum: [1, 2, 3],
              description: 'b - descr',
            },
            c: {},
            d: {
              default: {},
            },
          } as any,
        },
      ],
      paths: {
        '/pet': {
          get: {},
        },
      },
    };

    expect(translateToServers(document)).toStrictEqual([
      {
        id: expect.any(String),
        description: 'description',
        url: 'http://stoplight.io/path',
        variables: {
          b: {
            default: '123',
            description: 'b - descr',
            enum: ['1', '2', '3'],
          },
        },
      },
    ]);
  });

  it('prefers operation servers over any other servers', () => {
    const document = {
      servers: [
        {
          description: 'description',
          url: 'http://stoplight.io/path',
        },
      ],
      paths: {
        '/pet': {
          servers: [
            {
              description: 'description',
              url: 'http://stoplight.io/pet',
            },
          ],

          get: {
            servers: [
              {
                description: 'description',
                url: 'http://stoplight.io/pet.get',
              },
            ],
          },
        },
      },
    };

    expect(translateToServers(document)).toStrictEqual([
      {
        id: expect.any(String),
        description: 'description',
        url: 'http://stoplight.io/pet.get',
      },
    ]);
  });

  it('given missing operation servers, prefers path servers over any document servers', () => {
    const document = {
      servers: [
        {
          description: 'description',
          url: 'http://stoplight.io/path',
        },
      ],
      paths: {
        '/pet': {
          servers: [
            {
              description: 'description',
              url: 'http://stoplight.io/pet',
            },
          ],

          get: {},
        },
      },
    };

    expect(translateToServers(document)).toStrictEqual([
      {
        id: expect.any(String),
        description: 'description',
        url: 'http://stoplight.io/pet',
      },
    ]);
  });
});

import { DeepPartial } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import { translateToServers as _translateToServers } from '../servers';

const translateToServers = (
  document: DeepPartial<OpenAPIObject> & { paths: { '/pet': { get: Record<string, unknown> } } },
) => {
  const ctx = createContext(document, DEFAULT_ID_GENERATOR);
  ctx.state.enter('paths', '/pet', 'get');

  return _translateToServers.call(ctx, document.paths['/pet'], document.paths['/pet'].get);
};

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

    expect(translateToServers(document)).toMatchSnapshot();
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
        id: '#/servers/0',
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
        id: '#/paths/~1pet/get/servers/0',
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
        id: '#/paths/~1pet/servers/0',
        description: 'description',
        url: 'http://stoplight.io/pet',
      },
    ]);
  });
});

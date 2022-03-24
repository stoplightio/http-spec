import { mockPassthroughImplementation } from '@stoplight/test-utils';

import { createContext } from '../../../context';
import { translateMediaTypeObject } from '../content';
import { translateToRequest as _translateToRequest } from '../request';

jest.mock('../content');

const translateToRequest = (path: Record<string, unknown>, operation: Record<string, unknown>) => {
  const ctx = createContext({ paths: { '/api': path } });
  return _translateToRequest.call(ctx, path, operation);
};

describe('translateOas3ToRequest', () => {
  beforeEach(() => {
    mockPassthroughImplementation(translateMediaTypeObject);
  });

  it('given no request body should translate parameters', () => {
    const operation = {
      parameters: [
        {
          name: 'param-name-2',
          in: 'query',
          description: 'descr',
          content: {
            'content-b': {
              schema: {},
            },
          },
        },
        {
          name: 'param-name-3',
          in: 'header',
          description: 'descr',
          content: {
            'content-c': {
              schema: {},
            },
          },
        },
      ],
    };

    const path = {
      parameters: [
        {
          name: 'param-name-1',
          in: 'query',
          description: 'descr',
          deprecated: true,
          content: {
            'content-a': {
              schema: {},
            },
          },
        },
      ],
      get: operation,
    };

    expect(translateToRequest(path, operation)).toMatchSnapshot();
  });

  it('give a request body should translate it', () => {
    const operation = {
      requestBody: {
        description: 'descr',
        required: true,
        content: {
          'content-a': {
            schema: {
              deprecated: true,
            },
          },
        },
      },
    };

    const path = {
      post: operation,
    };

    expect(translateToRequest(path, operation)).toMatchSnapshot();
  });
});

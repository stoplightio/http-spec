import { IHttpQueryParam } from '@stoplight/types';

import { createContext } from '../../../oas/context';
import { translateToRequest as _translateToRequest } from '../request';

const translateToRequest = (path: Record<string, unknown>, operation: Record<string, unknown>, operationId: string) =>
  _translateToRequest.call(createContext({}), path, operation, { id: operationId });

describe('translateOas3ToRequest', () => {
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

    expect(translateToRequest(path, operation, 'get')).toMatchSnapshot({
      headers: [
        {
          id: expect.any(String),
        },
      ],
      query: [
        {
          id: expect.any(String),
        },
        {
          id: expect.any(String),
        },
      ],
    });
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

    expect(translateToRequest(path, operation, 'post')).toMatchSnapshot({
      body: {
        id: expect.any(String),
        contents: [
          {
            id: expect.any(String),
            schema: {
              'x-stoplight': {
                id: expect.any(String),
              },
            },
          },
        ],
      },
    });
  });

  it('given path-defined parameters should create unique ids', () => {
    const getOperation = {
      parameters: [],
    };
    const postOperation = {
      parameters: [],
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
      get: getOperation,
      post: postOperation,
    };

    const getRequest = translateToRequest(path, getOperation, 'get');
    const postRequest = translateToRequest(path, postOperation, 'post');
    const getQueryId = (getRequest.query?.[0] as IHttpQueryParam<true>).id;
    const postQueryId = (postRequest.query?.[0] as IHttpQueryParam<true>).id;

    expect(getQueryId).not.toEqual(postQueryId);
  });
});

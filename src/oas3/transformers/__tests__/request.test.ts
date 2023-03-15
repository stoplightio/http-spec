import { IHttpOperationRequest } from '@stoplight/types';

import { createContext } from '../../../oas/context';
import { bundleOas3Service } from '../../service';
import { translateToRequest as _translateToRequest } from '../request';

const translateToRequest = (path: Record<string, unknown>, operation: Record<string, unknown>) =>
  _translateToRequest.call(createContext({}), path, operation);

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

    expect(translateToRequest(path, operation)).toMatchSnapshot({
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

    expect(translateToRequest(path, operation)).toMatchSnapshot({
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

  it('given path-defined parameters should create unique parameters', () => {
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

    const service = {
      paths: {
        '/': path,
      },
    };

    const bundledService = bundleOas3Service({
      document: service,
    });

    const getRequest = bundledService.operations[0].request as IHttpOperationRequest<true>;
    const postRequest = bundledService.operations[1].request as IHttpOperationRequest<true>;

    const getQueryParam = getRequest.query?.[0];
    const postQueryParam = postRequest.query?.[0];

    expect(getQueryParam).not.toEqual(postQueryParam);
  });
});

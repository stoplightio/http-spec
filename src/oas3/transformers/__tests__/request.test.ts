import { mockPassthroughImplementation } from '@stoplight/test-utils';

import { translateMediaTypeObject } from '../content';
import { translateToRequest } from '../request';

jest.mock('../content');

describe('translateOas3ToRequest', () => {
  beforeEach(() => {
    mockPassthroughImplementation(translateMediaTypeObject);
  });

  it('given no request body should translate parameters', () => {
    expect(
      translateToRequest({}, [
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
      ]),
    ).toMatchSnapshot();
  });

  it('give a request body should translate it', () => {
    expect(
      translateToRequest({}, [], {
        description: 'descr',
        required: true,
        content: {
          'content-a': {
            schema: {
              deprecated: true,
            },
          },
        },
      }),
    ).toMatchSnapshot();
  });
});

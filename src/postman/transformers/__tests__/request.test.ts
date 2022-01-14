import postmanCollection from 'postman-collection';

import { transformRequest } from '../request';

const { Request } = postmanCollection;

describe('transformRequest()', () => {
  it('transforms correctly', () => {
    expect(
      transformRequest(
        new Request({
          method: 'get',
          url: '/path/:param?a=b',
          body: { mode: 'raw', raw: 'test' },
          header: [{ key: 'header', value: 'a header' }],
        }),
      ),
    ).toEqual({
      body: {
        id: expect.any(String),
        contents: [
          {
            id: expect.any(String),
            examples: [{ id: expect.any(String), key: 'default', value: 'test' }],
            mediaType: 'text/plain',
          },
        ],
      },
      headers: [
        {
          id: expect.any(String),
          name: 'header',
          schema: { type: 'string' },
          examples: [{ id: expect.any(String), key: 'default', value: 'a header' }],
          style: 'simple',
          required: true,
        },
      ],
      path: [{ id: expect.any(String), name: 'param', style: 'simple', required: true }],
      query: [
        {
          id: expect.any(String),
          examples: [{ id: expect.any(String), key: 'default', value: 'b' }],
          schema: { type: 'string' },
          name: 'a',
          style: 'form',
          required: true,
        },
      ],
    });
  });
});

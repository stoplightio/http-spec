import { INodeExample } from '@stoplight/types';
import { Request } from 'postman-collection';
import { transformRequest } from '../request';

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
        contents: [
          {
            examples: [{ key: 'default', value: 'test' }],
            mediaType: 'text/plain',
          },
        ],
      },
      headers: [
        {
          name: 'header',
          schema: { type: 'string' },
          examples: [{ key: 'default', value: 'a header' }],
          style: 'simple',
          required: true,
        },
      ],
      path: [{ name: 'param', style: 'simple', required: true }],
      query: [
        {
          examples: [{ key: 'default', value: 'b' }],
          schema: { type: 'string' },
          name: 'a',
          style: 'form',
          required: true,
        },
      ],
    });
  });
});

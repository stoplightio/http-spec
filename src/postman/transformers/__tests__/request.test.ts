import { INodeExample } from '@stoplight/types';
import { HeaderDefinition, Request, RequestBody } from 'postman-collection';
import { transformRequest } from '../request';

describe('transformRequest()', () => {
  it('transforms correctly', () => {
    expect(
      transformRequest(
        new Request({
          method: 'get',
          url: '/path/:param?a=b',
          body: { mode: 'raw', raw: 'test' } as RequestBody,
          header: [{ key: 'header', value: 'a header' }] as HeaderDefinition,
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
        },
      ],
      path: [{ name: 'param', style: 'simple' }],
      query: [
        {
          examples: [{ key: 'default', value: 'b' }],
          schema: { type: 'string' },
          name: 'a',
          style: 'form',
        },
      ],
    });
  });
});

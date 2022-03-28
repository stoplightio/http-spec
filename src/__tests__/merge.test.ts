import { HttpParamStyles } from '@stoplight/types';

import { mergeOperations, mergeResponses } from '../merge';

describe('mergeResponses()', () => {
  it('merges headers correctly', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            headers: [
              { id: 'b', name: '200h1', style: HttpParamStyles.Simple, required: true },
              { id: 'c', name: '200h2', style: HttpParamStyles.Simple, required: true },
            ],
          },
          {
            id: 'd',
            code: '400',
            headers: [
              { id: 'e', name: '400h1', style: HttpParamStyles.Simple, required: true },
              { id: 'f', name: '400h2', style: HttpParamStyles.Simple, required: true },
            ],
          },
        ],
        [
          {
            id: 'g',
            code: '200',
            headers: [
              { id: 'h', name: '200h2', style: HttpParamStyles.Simple, required: true },
              { id: 'i', name: '200h3', style: HttpParamStyles.Simple, required: true },
            ],
          },
          {
            id: 'j',
            code: '500',
            headers: [
              { id: 'k', name: '500h1', style: HttpParamStyles.Simple, required: true },
              { id: 'l', name: '500h2', style: HttpParamStyles.Simple, required: true },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        headers: [
          { id: 'b', name: '200h1', style: HttpParamStyles.Simple, required: false },
          { id: 'c', name: '200h2', style: HttpParamStyles.Simple, required: true },
          { id: 'i', name: '200h3', style: HttpParamStyles.Simple, required: false },
        ],
        contents: [],
      },
      {
        id: 'd',
        code: '400',
        headers: [
          { id: 'e', name: '400h1', style: HttpParamStyles.Simple, required: true },
          { id: 'f', name: '400h2', style: HttpParamStyles.Simple, required: true },
        ],
      },
      {
        id: 'j',
        code: '500',
        headers: [
          { id: 'k', name: '500h1', style: HttpParamStyles.Simple, required: true },
          { id: 'l', name: '500h2', style: HttpParamStyles.Simple, required: true },
        ],
      },
    ]);
  });

  it('merges schemas of headers correctly', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            headers: [
              { id: 'b', name: 'h1', style: HttpParamStyles.Simple, required: true },
              { id: 'c', name: 'h2', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
              { id: 'd', name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
            ],
          },
        ],
        [
          {
            id: 'e',
            code: '200',
            headers: [
              { id: 'f', name: 'h1', style: HttpParamStyles.Simple, required: true },
              { id: 'g', name: 'h2', style: HttpParamStyles.Simple, required: true, schema: { type: 'string' } },
              { id: 'h', name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
            ],
          },
          {
            id: 'i',
            code: '200',
            headers: [
              { id: 'j', name: 'h1', style: HttpParamStyles.Simple, required: true },
              { id: 'k', name: 'h2', style: HttpParamStyles.Simple, required: true, schema: { type: 'boolean' } },
              { id: 'l', name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        headers: [
          { id: 'b', name: 'h1', style: HttpParamStyles.Simple, required: true },
          {
            id: 'c',
            name: 'h2',
            style: HttpParamStyles.Simple,
            required: true,
            schema: { anyOf: [{ type: 'number' }, { type: 'string' }, { type: 'boolean' }] },
          },
          { id: 'd', name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
        ],
        contents: [],
      },
    ]);
  });

  it('merges same headers with difference in required flag correctly', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            headers: [{ id: 'b', name: 'h', style: HttpParamStyles.Simple, required: true }],
          },
        ],
        [
          {
            id: 'c',
            code: '200',
            headers: [{ id: 'd', name: 'h', style: HttpParamStyles.Simple, required: false }],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        headers: [{ id: 'b', name: 'h', style: HttpParamStyles.Simple, required: false }],
        contents: [],
      },
    ]);
  });

  it('merges headers having differently cased letters in name', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            headers: [{ id: 'b', name: 'Oo', style: HttpParamStyles.Simple, required: true }],
          },
        ],
        [
          {
            id: 'c',
            code: '200',
            headers: [{ id: 'd', name: 'oO', style: HttpParamStyles.Simple, required: true }],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        headers: [{ id: 'b', name: 'Oo', style: HttpParamStyles.Simple, required: true }],
        contents: [],
      },
    ]);
  });

  it('merges contents correctly', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            contents: [
              { id: 'a1', mediaType: '200-tion/a-son' },
              { id: 'a2', mediaType: '200-tion/b-son' },
            ],
          },
          {
            id: 'b',
            code: '400',
            contents: [
              { id: 'b1', mediaType: '400-tion/a-son' },
              { id: 'b2', mediaType: '400-tion/b-son' },
            ],
          },
        ],
        [
          {
            id: 'c',
            code: '200',
            contents: [
              { id: 'c1', mediaType: '200-tion/b-son' },
              { id: 'c2', mediaType: '200-tion/c-son' },
            ],
          },
          {
            id: 'd',
            code: '500',
            contents: [
              { id: 'd1', mediaType: '500-tion/a-son' },
              { id: 'd2', mediaType: '500-tion/b-son' },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        contents: [
          { id: 'a1', mediaType: '200-tion/a-son' },
          { id: 'a2', mediaType: '200-tion/b-son' },
          { id: 'c2', mediaType: '200-tion/c-son' },
        ],
        headers: [],
      },
      {
        id: 'b',
        code: '400',
        contents: [
          { id: 'b1', mediaType: '400-tion/a-son' },
          { id: 'b2', mediaType: '400-tion/b-son' },
        ],
      },
      {
        id: 'd',
        code: '500',
        contents: [
          { id: 'd1', mediaType: '500-tion/a-son' },
          { id: 'd2', mediaType: '500-tion/b-son' },
        ],
      },
    ]);
  });

  it('merges content schemas correctly', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            contents: [
              {
                id: 'a1',
                mediaType: 'application/json',
                schema: { type: 'object', properties: { a: { type: 'string' } } },
              },
            ],
          },
        ],
        [
          {
            id: 'b',
            code: '200',
            contents: [
              {
                id: 'b1',
                mediaType: 'application/json',
                schema: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } },
              },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        contents: [
          {
            id: 'a1',
            mediaType: 'application/json',
            schema: {
              anyOf: [
                { type: 'object', properties: { a: { type: 'string' } } },
                { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } },
              ],
            },
          },
        ],
        headers: [],
      },
    ]);
  });

  it('merges contents having differently cased letters in name', () => {
    expect(
      mergeResponses(
        [
          {
            id: 'a',
            code: '200',
            contents: [{ id: 'a1', mediaType: 'Aa/Oo' }],
          },
        ],
        [
          {
            id: 'b',
            code: '200',
            contents: [{ id: 'b1', mediaType: 'aA/oO' }],
          },
        ],
      ),
    ).toEqual([
      {
        id: 'a',
        code: '200',
        contents: [{ id: 'a1', mediaType: 'Aa/Oo' }],
        headers: [],
      },
    ]);
  });
});

describe('mergeOperations()', () => {
  it('merges responses correctly', () => {
    expect(
      mergeOperations(
        [
          {
            id: '1',
            method: 'get',
            path: '/a',
            responses: [
              { id: 'a', code: '200' },
              { id: 'b', code: '400' },
            ],
          },
          { id: '2', method: 'get', path: '/b', responses: [{ id: 'c', code: '200' }] },
        ],
        [
          {
            id: '3',
            method: 'get',
            path: '/a',
            responses: [
              { id: 'd', code: '200' },
              { id: 'e', code: '500' },
            ],
          },
          { id: '4', method: 'get', path: '/c', responses: [{ id: 'f', code: '200' }] },
        ],
      ),
    ).toEqual([
      {
        id: '1',
        method: 'get',
        path: '/a',
        responses: [
          { id: 'a', code: '200', contents: [], headers: [] },
          { id: 'b', code: '400' },
          { id: 'e', code: '500' },
        ],
        servers: [],
        request: {},
      },
      { id: '2', method: 'get', path: '/b', responses: [{ id: 'c', code: '200' }] },
      { id: '4', method: 'get', path: '/c', responses: [{ id: 'f', code: '200' }] },
    ]);
  });

  it('merges servers correctly', () => {
    expect(
      mergeOperations(
        [
          {
            id: '1',
            method: 'get',
            path: '/a',
            responses: [{ id: 'a', code: '200' }],
            servers: [{ id: 'b', url: 'http://example.com' }],
          },
        ],
        [
          {
            id: '2',
            method: 'get',
            path: '/a',
            responses: [{ id: 'c', code: '200' }],
            servers: [{ id: 'd', url: 'https://example.com' }],
          },
        ],
      ),
    ).toEqual([
      {
        id: '1',
        method: 'get',
        path: '/a',
        responses: [{ id: 'a', code: '200', headers: [], contents: [] }],
        servers: [
          { id: 'b', url: 'http://example.com' },
          { id: 'd', url: 'https://example.com' },
        ],
        request: {},
      },
    ]);
  });

  it('merges request correctly', () => {
    expect(
      mergeOperations(
        [
          {
            id: '1',
            method: 'get',
            path: '/a',
            responses: [{ id: 'a', code: '200' }],
            request: {
              headers: [
                { id: 'b', name: 'a', style: HttpParamStyles.Simple, required: true },
                { id: 'c', name: 'b', style: HttpParamStyles.Simple, required: true },
              ],
              query: [
                { id: 'd', name: 'a', style: HttpParamStyles.Form, required: true },
                { id: 'e', name: 'b', style: HttpParamStyles.Form, required: true },
              ],
              path: [{ id: 'f', name: 'a', style: HttpParamStyles.Simple, required: true }],
              body: {
                id: 'g',
                description: 'The cadillac stood by the house',
                required: true,
                contents: [
                  {
                    id: 'g1',
                    mediaType: 'application/json',
                    schema: { type: 'string' },
                  },
                ],
              },
            },
          },
        ],
        [
          {
            id: '2',
            method: 'get',
            path: '/a',
            responses: [{ id: '11', code: '200' }],
            request: {
              headers: [
                { id: 'b1', name: 'b', style: HttpParamStyles.Simple, required: true },
                { id: 'c1', name: 'c', style: HttpParamStyles.Simple, required: true },
              ],
              query: [
                { id: 'd1', name: 'b', style: HttpParamStyles.Form, required: true },
                { id: 'e1', name: 'c', style: HttpParamStyles.Form, required: true },
              ],
              path: [
                { id: 'f1', name: 'a', style: HttpParamStyles.Simple, required: true },
                { id: 'g1', name: 'b', style: HttpParamStyles.Simple, required: true },
              ],
              body: {
                id: 'h1',
                description: 'And the yanks they were within',
                required: true,
                contents: [
                  {
                    id: 'h2',
                    mediaType: 'application/json',
                    schema: { type: 'number' },
                  },
                ],
              },
            },
          },
        ],
      ),
    ).toEqual([
      {
        id: '1',
        method: 'get',
        path: '/a',
        responses: [{ id: 'a', code: '200', headers: [], contents: [] }],
        request: {
          headers: [
            { id: 'b', name: 'a', style: HttpParamStyles.Simple, required: false },
            { id: 'c', name: 'b', style: HttpParamStyles.Simple, required: true },
            { id: 'c1', name: 'c', style: HttpParamStyles.Simple, required: false },
          ],
          query: [
            { id: 'd', name: 'a', style: HttpParamStyles.Form, required: false },
            { id: 'e', name: 'b', style: HttpParamStyles.Form, required: true },
            { id: 'e1', name: 'c', style: HttpParamStyles.Form, required: false },
          ],
          path: [
            { id: 'f', name: 'a', style: HttpParamStyles.Simple, required: true },
            { id: 'g1', name: 'b', style: HttpParamStyles.Simple, required: false },
          ],
          body: {
            id: 'g',
            required: true,
            description: 'The cadillac stood by the house; And the yanks they were within',
            contents: [
              {
                id: 'g1',
                mediaType: 'application/json',
                schema: { anyOf: [{ type: 'string' }, { type: 'number' }] },
              },
            ],
          },
        },
        servers: [],
      },
    ]);
  });
});

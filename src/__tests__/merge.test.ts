import { HttpParamStyles } from '@stoplight/types';

import { mergeOperations, mergeResponses } from '../merge';

describe('mergeResponses()', () => {
  it('merges headers correctly', () => {
    expect(
      mergeResponses(
        [
          {
            code: '200',
            headers: [
              { name: '200h1', style: HttpParamStyles.Simple, required: true },
              { name: '200h2', style: HttpParamStyles.Simple, required: true },
            ],
          },
          {
            code: '400',
            headers: [
              { name: '400h1', style: HttpParamStyles.Simple, required: true },
              { name: '400h2', style: HttpParamStyles.Simple, required: true },
            ],
          },
        ],
        [
          {
            code: '200',
            headers: [
              { name: '200h2', style: HttpParamStyles.Simple, required: true },
              { name: '200h3', style: HttpParamStyles.Simple, required: true },
            ],
          },
          {
            code: '500',
            headers: [
              { name: '500h1', style: HttpParamStyles.Simple, required: true },
              { name: '500h2', style: HttpParamStyles.Simple, required: true },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        headers: [
          { name: '200h1', style: HttpParamStyles.Simple, required: false },
          { name: '200h2', style: HttpParamStyles.Simple, required: true },
          { name: '200h3', style: HttpParamStyles.Simple, required: false },
        ],
        contents: [],
      },
      {
        code: '400',
        headers: [
          { name: '400h1', style: HttpParamStyles.Simple, required: true },
          { name: '400h2', style: HttpParamStyles.Simple, required: true },
        ],
      },
      {
        code: '500',
        headers: [
          { name: '500h1', style: HttpParamStyles.Simple, required: true },
          { name: '500h2', style: HttpParamStyles.Simple, required: true },
        ],
      },
    ]);
  });

  it('merges schemas of headers correctly', () => {
    expect(
      mergeResponses(
        [
          {
            code: '200',
            headers: [
              { name: 'h1', style: HttpParamStyles.Simple, required: true },
              { name: 'h2', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
              { name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
            ],
          },
        ],
        [
          {
            code: '200',
            headers: [
              { name: 'h1', style: HttpParamStyles.Simple, required: true },
              { name: 'h2', style: HttpParamStyles.Simple, required: true, schema: { type: 'string' } },
              { name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
            ],
          },
          {
            code: '200',
            headers: [
              { name: 'h1', style: HttpParamStyles.Simple, required: true },
              { name: 'h2', style: HttpParamStyles.Simple, required: true, schema: { type: 'boolean' } },
              { name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        headers: [
          { name: 'h1', style: HttpParamStyles.Simple, required: true, schema: undefined },
          {
            name: 'h2',
            style: HttpParamStyles.Simple,
            required: true,
            schema: { anyOf: [{ type: 'number' }, { type: 'string' }, { type: 'boolean' }] },
          },
          { name: 'h3', style: HttpParamStyles.Simple, required: true, schema: { type: 'number' } },
        ],
        contents: [],
      },
    ]);
  });

  it('merges headers having differently cased letters in name', () => {
    expect(
      mergeResponses(
        [
          {
            code: '200',
            headers: [{ name: 'Oo', style: HttpParamStyles.Simple, required: true }],
          },
        ],
        [
          {
            code: '200',
            headers: [{ name: 'oO', style: HttpParamStyles.Simple, required: true }],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        headers: [{ name: 'Oo', style: HttpParamStyles.Simple, required: true }],
        contents: [],
      },
    ]);
  });

  it('merges contents correctly', () => {
    expect(
      mergeResponses(
        [
          {
            code: '200',
            contents: [{ mediaType: '200-tion/a-son' }, { mediaType: '200-tion/b-son' }],
          },
          {
            code: '400',
            contents: [{ mediaType: '400-tion/a-son' }, { mediaType: '400-tion/b-son' }],
          },
        ],
        [
          {
            code: '200',
            contents: [{ mediaType: '200-tion/b-son' }, { mediaType: '200-tion/c-son' }],
          },
          {
            code: '500',
            contents: [{ mediaType: '500-tion/a-son' }, { mediaType: '500-tion/b-son' }],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        contents: [{ mediaType: '200-tion/a-son' }, { mediaType: '200-tion/b-son' }, { mediaType: '200-tion/c-son' }],
        headers: [],
      },
      {
        code: '400',
        contents: [{ mediaType: '400-tion/a-son' }, { mediaType: '400-tion/b-son' }],
      },
      {
        code: '500',
        contents: [{ mediaType: '500-tion/a-son' }, { mediaType: '500-tion/b-son' }],
      },
    ]);
  });

  it('merges content schemas correctly', () => {
    expect(
      mergeResponses(
        [
          {
            code: '200',
            contents: [
              { mediaType: 'application/json', schema: { type: 'object', properties: { a: { type: 'string' } } } },
            ],
          },
        ],
        [
          {
            code: '200',
            contents: [
              {
                mediaType: 'application/json',
                schema: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' } } },
              },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        contents: [
          {
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
            code: '200',
            contents: [{ mediaType: 'Aa/Oo' }],
          },
        ],
        [
          {
            code: '200',
            contents: [{ mediaType: 'aA/oO' }],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        contents: [{ mediaType: 'Aa/Oo' }],
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
          { id: '1', method: 'get', path: '/a', responses: [{ code: '200' }, { code: '400' }] },
          { id: '2', method: 'get', path: '/b', responses: [{ code: '200' }] },
        ],
        [
          { id: '3', method: 'get', path: '/a', responses: [{ code: '200' }, { code: '500' }] },
          { id: '4', method: 'get', path: '/c', responses: [{ code: '200' }] },
        ],
      ),
    ).toEqual([
      {
        id: '1',
        method: 'get',
        path: '/a',
        responses: [{ code: '200', contents: [], headers: [] }, { code: '400' }, { code: '500' }],
        servers: [],
        request: { headers: undefined, path: undefined, query: undefined, body: undefined },
      },
      { id: '2', method: 'get', path: '/b', responses: [{ code: '200' }] },
      { id: '4', method: 'get', path: '/c', responses: [{ code: '200' }] },
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
            responses: [{ code: '200' }],
            servers: [{ url: 'http://example.com' }],
          },
        ],
        [
          {
            id: '2',
            method: 'get',
            path: '/a',
            responses: [{ code: '200' }],
            servers: [{ url: 'https://example.com' }],
          },
        ],
      ),
    ).toEqual([
      {
        id: '1',
        method: 'get',
        path: '/a',
        responses: [{ code: '200', headers: [], contents: [] }],
        servers: [{ url: 'http://example.com' }, { url: 'https://example.com' }],
        request: { headers: undefined, path: undefined, query: undefined, body: undefined },
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
            responses: [{ code: '200' }],
            request: {
              headers: [
                { name: 'a', style: HttpParamStyles.Simple, required: true },
                { name: 'b', style: HttpParamStyles.Simple, required: true },
              ],
              query: [
                { name: 'a', style: HttpParamStyles.Form, required: true },
                { name: 'b', style: HttpParamStyles.Form, required: true },
              ],
              path: [{ name: 'a', style: HttpParamStyles.Simple, required: true }],
              body: {
                required: true,
                contents: [
                  {
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
            responses: [{ code: '200' }],
            request: {
              headers: [
                { name: 'b', style: HttpParamStyles.Simple, required: true },
                { name: 'c', style: HttpParamStyles.Simple, required: true },
              ],
              query: [
                { name: 'b', style: HttpParamStyles.Form, required: true },
                { name: 'c', style: HttpParamStyles.Form, required: true },
              ],
              path: [
                { name: 'a', style: HttpParamStyles.Simple, required: true },
                { name: 'b', style: HttpParamStyles.Simple, required: true },
              ],
              body: {
                required: true,
                contents: [
                  {
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
        responses: [{ code: '200', headers: [], contents: [] }],
        request: {
          headers: [
            { name: 'a', style: HttpParamStyles.Simple, required: false },
            { name: 'b', style: HttpParamStyles.Simple, required: true },
            { name: 'c', style: HttpParamStyles.Simple, required: false },
          ],
          query: [
            { name: 'a', style: HttpParamStyles.Form, required: false },
            { name: 'b', style: HttpParamStyles.Form, required: true },
            { name: 'c', style: HttpParamStyles.Form, required: false },
          ],
          path: [
            { name: 'a', style: HttpParamStyles.Simple, required: true },
            { name: 'b', style: HttpParamStyles.Simple, required: false },
          ],
          body: {
            required: true,
            contents: [
              {
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

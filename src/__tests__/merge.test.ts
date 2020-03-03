import { HttpParamStyles, IHttpOperation } from '@stoplight/types/dist';
import { mergeOperations, mergeResponses } from '../merge';

describe('mergeResponses()', () => {
  it('merges headers correctly', () => {
    expect(
      mergeResponses(
        [
          {
            code: '200',
            headers: [
              { name: '200h1', style: HttpParamStyles.Simple },
              { name: '200h2', style: HttpParamStyles.Simple },
            ],
          },
          {
            code: '400',
            headers: [
              { name: '400h1', style: HttpParamStyles.Simple },
              { name: '400h2', style: HttpParamStyles.Simple },
            ],
          },
        ],
        [
          {
            code: '200',
            headers: [
              { name: '200h2', style: HttpParamStyles.Simple },
              { name: '200h3', style: HttpParamStyles.Simple },
            ],
          },
          {
            code: '500',
            headers: [
              { name: '500h1', style: HttpParamStyles.Simple },
              { name: '500h2', style: HttpParamStyles.Simple },
            ],
          },
        ],
      ),
    ).toEqual([
      {
        code: '200',
        headers: [
          { name: '200h1', style: HttpParamStyles.Simple },
          { name: '200h2', style: HttpParamStyles.Simple },
          { name: '200h3', style: HttpParamStyles.Simple },
        ],
        contents: [],
      },
      {
        code: '400',
        headers: [
          { name: '400h1', style: HttpParamStyles.Simple },
          { name: '400h2', style: HttpParamStyles.Simple },
        ],
      },
      {
        code: '500',
        headers: [
          { name: '500h1', style: HttpParamStyles.Simple },
          { name: '500h2', style: HttpParamStyles.Simple },
        ],
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
            servers: [{ url: 'http://exmaple.com' }],
          },
        ],
        [
          {
            id: '2',
            method: 'get',
            path: '/a',
            responses: [{ code: '200' }],
            servers: [{ url: 'https://exmaple.com' }],
          },
        ],
      ),
    ).toEqual([
      {
        id: '1',
        method: 'get',
        path: '/a',
        responses: [{ code: '200', headers: [], contents: [] }],
        servers: [{ url: 'http://exmaple.com' }, { url: 'https://exmaple.com' }],
      },
    ]);
  });
});

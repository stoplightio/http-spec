import {
  BodyParameter,
  FormDataParameter,
  HeaderParameter,
  PathParameter,
  QueryParameter
} from 'swagger-schema-official';

import { createContext } from '../../../oas/context';
import { translateToRequest as _translateToRequest } from '../request';

const translateToRequest = (parameters: any[]) => {
  const document = { consumes: ['*'], paths: { '/api': { get: { parameters } } } };
  const ctx = createContext(document);
  return _translateToRequest.call(ctx, document.paths['/api'], document.paths['/api'].get);
};

describe('request', () => {
  const fakeBodyParameter: BodyParameter = { in: 'body', name: 'param' };
  const fakeFormParameter: FormDataParameter = { in: 'formData', name: 'param', type: 'number' };
  const fakeQueryParameter: QueryParameter = { in: 'query', name: 'param' };
  const fakeHeaderParameter: HeaderParameter = { in: 'header', name: 'param' };
  const fakePathParameter: PathParameter = { in: 'path', name: 'param', required: true };

  it('given single body param should translate to request with body', () => {
    expect(translateToRequest([fakeBodyParameter])).toMatchSnapshot({
      body: {
        id: expect.any(String),
        contents: [
          {
            id: expect.any(String),
          },
        ],
        name: 'param',
      },
    });
  });

  it('given single form param should translate to request with form', () => {
    expect(translateToRequest([fakeFormParameter])).toMatchSnapshot({
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

  it('given single path param should translate to request with path', () => {
    expect(translateToRequest([fakePathParameter])).toMatchSnapshot({
      path: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given single query param should translate to request with query', () => {
    expect(translateToRequest([fakeQueryParameter])).toMatchSnapshot({
      query: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given single header param should translate to request with header', () => {
    expect(translateToRequest([fakeHeaderParameter])).toMatchSnapshot({
      headers: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given two query params should translate', () => {
    expect(translateToRequest([fakeQueryParameter, fakeQueryParameter])).toMatchSnapshot({
      query: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given two header params should translate', () => {
    expect(translateToRequest([fakeHeaderParameter, fakeHeaderParameter])).toMatchSnapshot({
      headers: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('given two path params should translate', () => {
    expect(translateToRequest([fakePathParameter, fakePathParameter])).toMatchSnapshot({
      path: [
        {
          id: expect.any(String),
        },
      ],
    });
  });

  it('should translate mixed request', () => {
    expect(
      translateToRequest([
        fakeBodyParameter,
        fakeQueryParameter,
        fakePathParameter,
        fakeHeaderParameter,
        fakeFormParameter,
      ]),
    ).toMatchSnapshot({
      body: {
        id: expect.any(String),
        contents: [
          {
            id: expect.any(String),
          },
        ],
        name: 'param'
      },
      headers: [
        {
          id: expect.any(String),
        },
      ],
      path: [
        {
          id: expect.any(String),
        },
      ],
      query: [
        {
          id: expect.any(String),
        },
      ],
    });
  });
});

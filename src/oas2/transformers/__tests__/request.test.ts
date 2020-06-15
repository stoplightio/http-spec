import {
  BodyParameter,
  FormDataParameter,
  HeaderParameter,
  PathParameter,
  QueryParameter,
} from 'swagger-schema-official';

import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from '../params';
import { translateToRequest } from '../request';

jest.mock('../params');
jest.mock('../../guards');

describe('request', () => {
  const consumes = ['*'];
  const fakeParameter: FormDataParameter = {
    name: 'name',
    type: 'string',
    in: 'formData',
  };
  const fakeBodyParameter: BodyParameter = { in: 'body', name: 'param' };
  const fakeFormParameter: FormDataParameter = { in: 'formData', name: 'param', type: 'number' };
  const fakeQueryParameter: QueryParameter = { in: 'query', name: 'param' };
  const fakeHeaderParameter: HeaderParameter = { in: 'header', name: 'param' };
  const fakePathParameter: PathParameter = { in: 'path', name: 'param', required: true };

  beforeEach(() => {
    (translateToBodyParameter as jest.Mock).mockReturnValue(fakeBodyParameter);
    (translateFromFormDataParameters as jest.Mock).mockReturnValue(fakeFormParameter);
    (translateToQueryParameter as jest.Mock).mockReturnValue(fakeQueryParameter);
    (translateToPathParameter as jest.Mock).mockReturnValue(fakePathParameter);
    (translateToHeaderParam as jest.Mock).mockReturnValue(fakeHeaderParameter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('given empty params collection should return empty object', () => {
    expect(translateToRequest([], consumes)).toEqual({});
  });

  it('given single body param should translate to request with body', () => {
    expect(translateToRequest([fakeBodyParameter], consumes)).toMatchSnapshot();
  });

  it('given single form param should translate to request with form', () => {
    expect(translateToRequest([fakeFormParameter], consumes)).toMatchSnapshot();
  });

  it('given single path param should translate to request with path', () => {
    expect(translateToRequest([fakePathParameter], consumes)).toMatchSnapshot();
  });

  it('given single query param should translate to request with query', () => {
    expect(translateToRequest([fakeQueryParameter], consumes)).toMatchSnapshot();
  });

  it('given single header param should translate to request with header', () => {
    expect(translateToRequest([fakeHeaderParameter], consumes)).toMatchSnapshot();
  });

  it('given two query params should translate', () => {
    expect(translateToRequest([fakeQueryParameter, fakeQueryParameter], consumes)).toMatchSnapshot();
  });

  it('given two header params should translate', () => {
    expect(translateToRequest([fakeHeaderParameter, fakeHeaderParameter], consumes)).toMatchSnapshot();
  });

  it('given two path params should translate', () => {
    expect(translateToRequest([fakePathParameter, fakePathParameter], consumes)).toMatchSnapshot();
  });

  it('should translate mixed request', () => {
    expect(
      translateToRequest([fakeParameter, fakeParameter, fakeParameter, fakeParameter, fakeParameter], consumes),
    ).toMatchSnapshot();
  });
});

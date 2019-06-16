import { FormDataParameter } from 'swagger-schema-official';

import {
  isBodyParameter,
  isFormDataParameter,
  isHeaderParameter,
  isPathParameter,
  isQueryParameter,
} from '../../guards';
import {
  translateFromFormDataParameter,
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
  const fakeBodyParameter = { in: 'body' };
  const fakeFormParameter = { in: 'body', type: 'form' };
  const fakeQueryParameter = { in: 'query' };
  const fakeHeaderParameter = { in: 'header' };
  const fakePathParameter = { in: 'path' };

  beforeEach(() => {
    (translateToBodyParameter as jest.Mock).mockReturnValue(fakeBodyParameter);
    (translateFromFormDataParameter as jest.Mock).mockReturnValue(fakeFormParameter);
    (translateToQueryParameter as jest.Mock).mockReturnValue(fakeQueryParameter);
    (translateToPathParameter as jest.Mock).mockReturnValue(fakePathParameter);
    (translateToHeaderParam as jest.Mock).mockReturnValue(fakeHeaderParameter);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('given empty params collection should return empty object', () => {
    expect(translateToRequest([], consumes)).toEqual({});
  });

  test('given single body param should translate to request with body', () => {
    (isBodyParameter as any).mockReturnValue(true);
    expect(translateToRequest([fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given single form param should translate to request with form', () => {
    (isFormDataParameter as any).mockReturnValue(true);
    expect(translateToRequest([fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given single path param should translate to request with path', () => {
    (isPathParameter as any).mockReturnValue(true);
    expect(translateToRequest([fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given single query param should translate to request with query', () => {
    (isQueryParameter as any).mockReturnValue(true);
    expect(translateToRequest([fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given single header param should translate to request with header', () => {
    (isHeaderParameter as any).mockReturnValue(true);
    expect(translateToRequest([fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given single unknown param should translate to empty request', () => {
    expect(translateToRequest([fakeParameter], consumes)).toEqual({});
  });

  test('given two query params should translate', () => {
    (isQueryParameter as any).mockReturnValueOnce(true);
    (isQueryParameter as any).mockReturnValueOnce(true);
    expect(translateToRequest([fakeParameter, fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given two header params should translate', () => {
    (isHeaderParameter as any).mockReturnValueOnce(true);
    (isHeaderParameter as any).mockReturnValueOnce(true);
    expect(translateToRequest([fakeParameter, fakeParameter], consumes)).toMatchSnapshot();
  });

  test('given two path params should translate', () => {
    (isPathParameter as any).mockReturnValueOnce(true);
    (isPathParameter as any).mockReturnValueOnce(true);
    expect(translateToRequest([fakeParameter, fakeParameter], consumes)).toMatchSnapshot();
  });

  test('should translate mixed request', () => {
    (isBodyParameter as any).mockReturnValueOnce(true);
    (isFormDataParameter as any).mockReturnValueOnce(true);
    (isQueryParameter as any).mockReturnValueOnce(true);
    (isHeaderParameter as any).mockReturnValueOnce(true);
    (isPathParameter as any).mockReturnValueOnce(true);
    expect(
      translateToRequest([fakeParameter, fakeParameter, fakeParameter, fakeParameter, fakeParameter], consumes),
    ).toMatchSnapshot();
  });
});

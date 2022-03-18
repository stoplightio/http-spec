import {
  BodyParameter,
  FormDataParameter,
  HeaderParameter,
  PathParameter,
  QueryParameter,
} from 'swagger-schema-official';

import { createContext, DEFAULT_ID_GENERATOR } from '../../../context';
import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from '../params';
import { translateToRequest as _translateToRequest } from '../request';

jest.mock('../params');

const translateToRequest = (path: Record<string, unknown>, parameters: any[]) => {
  const ctx = createContext({ consumes: ['*'], paths: { '/api': { parameters } } }, DEFAULT_ID_GENERATOR);
  return _translateToRequest.call(ctx, path, { parameters });
};

describe('request', () => {
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

  it('given single body param should translate to request with body', () => {
    expect(translateToRequest({}, [fakeBodyParameter])).toMatchSnapshot();
  });

  it('given single form param should translate to request with form', () => {
    expect(translateToRequest({}, [fakeFormParameter])).toMatchSnapshot();
  });

  it('given single path param should translate to request with path', () => {
    expect(translateToRequest({}, [fakePathParameter])).toMatchSnapshot();
  });

  it('given single query param should translate to request with query', () => {
    expect(translateToRequest({}, [fakeQueryParameter])).toMatchSnapshot();
  });

  it('given single header param should translate to request with header', () => {
    expect(translateToRequest({}, [fakeHeaderParameter])).toMatchSnapshot();
  });

  it('given two query params should translate', () => {
    expect(translateToRequest({}, [fakeQueryParameter, fakeQueryParameter])).toMatchSnapshot();
  });

  it('given two header params should translate', () => {
    expect(translateToRequest({}, [fakeHeaderParameter, fakeHeaderParameter])).toMatchSnapshot();
  });

  it('given two path params should translate', () => {
    expect(translateToRequest({}, [fakePathParameter, fakePathParameter])).toMatchSnapshot();
  });

  it('should translate mixed request', () => {
    expect(
      translateToRequest({}, [fakeParameter, fakeParameter, fakeParameter, fakeParameter, fakeParameter]),
    ).toMatchSnapshot();
  });
});

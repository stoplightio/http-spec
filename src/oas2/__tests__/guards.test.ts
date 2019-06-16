import { Parameter } from 'swagger-schema-official';
import { isBodyParameter, isFormDataParameter, isHeaderParameter, isPathParameter, isQueryParameter } from '../guards';

describe('guards', () => {
  const bodyParam: Parameter = {
    name: 'n',
    in: 'body',
  };

  test('isBodyParameter', () => {
    expect(isBodyParameter(bodyParam)).toEqual(true);
  });

  test('not isBodyParameter', () => {
    expect(
      isBodyParameter({
        name: 'n',
        in: 'formData',
        type: 'string',
      }),
    ).toEqual(false);
  });

  test('isFormDataParameter', () => {
    const param: Parameter = {
      name: 'n',
      in: 'formData',
      type: 'number',
    };
    expect(isFormDataParameter(param)).toEqual(true);
  });

  test('not isFormDataParameter', () => {
    expect(isFormDataParameter(bodyParam)).toEqual(false);
  });

  test('isQueryParameter', () => {
    const param: Parameter = {
      name: 'n',
      in: 'query',
      type: 'string',
    };
    expect(isQueryParameter(param)).toEqual(true);
  });

  test('not isQueryParameter', () => {
    expect(isQueryParameter(bodyParam)).toEqual(false);
  });

  test('isPathParameter', () => {
    const param: Parameter = {
      name: 'n',
      in: 'path',
      required: true,
      type: 'integer',
    };
    expect(isPathParameter(param)).toEqual(true);
  });

  test('not isPathParameter', () => {
    expect(isPathParameter(bodyParam)).toEqual(false);
  });

  test('isHeaderParameter', () => {
    const param: Parameter = {
      name: 'n',
      in: 'header',
      type: 'integer',
    };
    expect(isHeaderParameter(param)).toEqual(true);
  });

  test('not isHeaderParameter', () => {
    expect(isHeaderParameter(bodyParam)).toEqual(false);
  });
});

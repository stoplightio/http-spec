import {
  BodyParameter,
  FormDataParameter,
  HeaderParameter,
  Parameter,
  PathParameter,
  QueryParameter,
} from 'swagger-schema-official';

export function isBodyParameter(parameter: Parameter): parameter is BodyParameter {
  return parameter.in === 'body';
}

export function isFormDataParameter(parameter: Parameter): parameter is FormDataParameter {
  return parameter.in === 'formData';
}

export function isQueryParameter(parameter: Parameter): parameter is QueryParameter {
  return parameter.in === 'query';
}

export function isPathParameter(parameter: Parameter): parameter is PathParameter {
  return parameter.in === 'path';
}

export function isHeaderParameter(parameter: Parameter): parameter is HeaderParameter {
  return parameter.in === 'header';
}

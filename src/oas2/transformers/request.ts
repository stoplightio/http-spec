import { IHttpOperationRequest } from '@stoplight/types';
import { BodyParameter, FormDataParameter, Parameter } from 'swagger-schema-official';

import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from './params';

export function translateToRequest(parameters: Parameter[], consumes: string[]): IHttpOperationRequest {
  const bodyParameters = parameters.filter((p): p is BodyParameter => p.in === 'body');
  const formDataParameters = parameters.filter((p): p is FormDataParameter => p.in === 'formData');
  const request: IHttpOperationRequest = {};

  // if 'body' and 'form data' defined prefer 'body'
  if (!!bodyParameters.length) {
    // There can be only one body parameter (taking first one)
    request.body = translateToBodyParameter(bodyParameters[0], consumes);
  } else if (!!formDataParameters.length) {
    request.body = translateFromFormDataParameters(formDataParameters, consumes);
  }

  return parameters.reduce(reduceRemainingParameters, request);
}

function reduceRemainingParameters(request: IHttpOperationRequest, parameter: Parameter) {
  if (parameter.in === 'query') {
    const queryParameter = translateToQueryParameter(parameter);
    request.query = (request.query || []).concat(queryParameter);
  } else if (parameter.in === 'path') {
    const pathParameter = translateToPathParameter(parameter);
    request.path = (request.path || []).concat(pathParameter);
  } else if (parameter.in === 'header') {
    const headerParameter = translateToHeaderParam(parameter);
    request.headers = (request.headers || []).concat(headerParameter);
  }
  return request;
}

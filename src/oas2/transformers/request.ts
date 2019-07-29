import { IHttpOperationRequest } from '@stoplight/types';
import { Parameter } from 'swagger-schema-official';
import { isBodyParameter, isFormDataParameter, isHeaderParameter, isPathParameter, isQueryParameter } from '../guards';
import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from './params';

export function translateToRequest(parameters: Parameter[], consumes: string[]): IHttpOperationRequest {
  const bodyParameters = parameters.filter(isBodyParameter);
  const formDataParameters = parameters.filter(isFormDataParameter);
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
  if (isQueryParameter(parameter)) {
    const queryParameter = translateToQueryParameter(parameter);
    request.query = (request.query || []).concat(queryParameter);
  } else if (isPathParameter(parameter)) {
    const pathParameter = translateToPathParameter(parameter);
    request.path = (request.path || []).concat(pathParameter);
  } else if (isHeaderParameter(parameter)) {
    const headerParameter = translateToHeaderParam(parameter);
    request.headers = (request.headers || []).concat(headerParameter);
  }
  return request;
}

import { IHttpOperationRequest } from '@stoplight/types';
import { Parameter } from 'swagger-schema-official';

import { isBodyParameter, isFormDataParameter, isHeaderParameter, isPathParameter, isQueryParameter } from '../guards';
import {
  translateFromFormDataParameter,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from './params';

export function translateToRequest(parameters: Parameter[], consumes: string[]): IHttpOperationRequest {
  return parameters.reduce((request: IHttpOperationRequest, parameter: Parameter) => {
    if (isBodyParameter(parameter)) {
      request.body = translateToBodyParameter(parameter, consumes);
    } else if (isFormDataParameter(parameter)) {
      request.body = translateFromFormDataParameter(parameter, request.body, consumes);
    } else if (isQueryParameter(parameter)) {
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
  }, {});
}

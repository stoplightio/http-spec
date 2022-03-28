import type { IHttpOperationRequest } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { isNonNullable } from '../../guards';
import { OasVersion } from '../../oas';
import { iterateOasParams } from '../../oas/accessors';
import { getConsumes } from '../accessors';
import { isHeaderParam, isPathParam, isQueryParam } from '../guards';
import { Oas2TranslateFunction } from '../types';
import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from './params';

export const translateToRequest: Oas2TranslateFunction<
  [path: Record<string, unknown>, operation: Record<string, unknown>],
  IHttpOperationRequest
> = function (path, operation) {
  const consumes = getConsumes(this.document, operation);
  const parameters = iterateOasParams.bind(this)(OasVersion.OAS2, operation.parameters, path.parameters);

  const params: Omit<Required<IHttpOperationRequest>, 'body'> = {
    headers: [],
    query: [],
    cookie: [],
    path: [],
  };

  let bodyParameter;
  const formDataParameters = [];

  for (const param of parameters) {
    if (isQueryParam(param)) {
      params.query.push(translateToQueryParameter.call(this, param));
    } else if (isPathParam(param)) {
      params.path.push(translateToPathParameter.call(this, param));
    } else if (isHeaderParam(param)) {
      params.headers.push(translateToHeaderParam.call(this, param));
    } else if (param.in === 'body') {
      bodyParameter = translateToBodyParameter.call(this, param, consumes);
    } else if (param.in === 'formData') {
      formDataParameters.push(param);
    }
  }

  let body;
  // if 'body' and 'form data' defined prefer 'body'
  if (!!bodyParameter) {
    // There can be only one body parameter (taking first one)
    body = bodyParameter;
  } else if (!!formDataParameters.length) {
    body = translateFromFormDataParameters.call(this, formDataParameters, consumes);
  }

  // if 'body' and 'form data' defined prefer 'body'

  return {
    ...params,

    ...pickBy(
      {
        body,
      },
      isNonNullable,
    ),
  };
};

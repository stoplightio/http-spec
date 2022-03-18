import type { IHttpOperationRequest } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import type { BodyParameter, FormDataParameter } from 'swagger-schema-official';

import { isNonNullable } from '../../guards';
import { OasVersion } from '../../oas';
import { queryValidOasParameters } from '../../oas/accessors';
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
  const parameters = queryValidOasParameters.bind(this)(OasVersion.OAS2, operation.parameters, path.parameters);

  const bodyParameter = parameters.find((p): p is BodyParameter => p.in === 'body');
  const formDataParameters = parameters.filter((p): p is FormDataParameter => p.in === 'formData');

  const params: Omit<Required<IHttpOperationRequest>, 'body'> = {
    headers: [],
    query: [],
    cookie: [],
    path: [],
  };

  let bodyParameter;
  let formDataParameters;
  if (!!bodyParameter) {
    // There can be only one body parameter (taking first one)
  } else if (!!formDataParameters.length) {
    body = translateFromFormDataParameters.call(this, formDataParameters, consumes);
  }

  for (const param of parameters) {
    if (isQueryParam(param)) {
      params.query.push(translateToQueryParameter.call(this, param));
    } else if (isPathParam(param)) {
      params.path.push(translateToPathParameter.call(this, param));
    } else if (isHeaderParam(param)) {
      params.headers.push(translateToHeaderParam.call(this, param));
    } else if (param.in === 'body') {
      bodyParameter = translateToBodyParameter.call(this, bodyParameter, consumes);
    } else if (param.in === 'formData') {
    }
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

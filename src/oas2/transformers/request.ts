import type { IHttpOperationRequest } from '@stoplight/types';

import { isNonNullable } from '../../guards';
import { OasVersion } from '../../oas';
import { createOasParamsIterator } from '../../oas/accessors';
import { getConsumes } from '../accessors';
import { isBodyParam, isFormDataParam, isHeaderParam, isPathParam, isQueryParam } from '../guards';
import { Oas2TranslateFunction } from '../types';
import {
  translateFromFormDataParameters,
  translateToBodyParameter,
  translateToHeaderParam,
  translateToPathParameter,
  translateToQueryParameter,
} from './params';
import pickBy = require('lodash.pickby');
import { Oas2ParamBase } from '../../oas/guards';

const iterateOasParams = createOasParamsIterator(OasVersion.OAS2);

export const translateToRequest: Oas2TranslateFunction<
  [path: Record<string, unknown>, operation: Record<string, unknown>],
  IHttpOperationRequest
> = function (path, operation) {
  const consumes = getConsumes(this.document, operation);
  const parameters = iterateOasParams.call(this, operation, path);

  const params: Omit<Required<IHttpOperationRequest>, 'body'> = {
    headers: [],
    query: [],
    cookie: [],
    path: [],
  };

  let bodyParameter;
  const formDataParameters: (Oas2ParamBase & { in: 'formData' })[] = [];

  for (const param of parameters) {
    if (isQueryParam(param)) {
      params.query.push(translateToQueryParameter.call(this, param));
    } else if (isPathParam(param)) {
      params.path.push(translateToPathParameter.call(this, param));
    } else if (isHeaderParam(param)) {
      params.headers.push(translateToHeaderParam.call(this, param));
    } else if (isBodyParam(param)) {
      bodyParameter = translateToBodyParameter.call(this, param, consumes);
    } else if (isFormDataParam(param)) {
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

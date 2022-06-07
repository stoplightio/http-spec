import type { IHttpOperationResponse, Optional, Reference } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../../context';
import { isNonNullable, isString } from '../../guards';
import { isReferenceObject } from '../../oas/guards';
import { getSharedKey } from '../../oas/resolver';
import { ArrayCallbackParameters } from '../../types';
import { entries } from '../../utils';
import { isResponseObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateHeaderObject, translateMediaTypeObject } from './content';

const translateToResponse = withContext<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[statusCode: string, response: unknown]>,
    Optional<IHttpOperationResponse | Reference>
  >
>(function ([statusCode, response]) {
  const maybeResponseObject = this.maybeResolveLocalRef(response);

  if (isReferenceObject(maybeResponseObject)) {
    return maybeResponseObject;
  }

  if (!isResponseObject(maybeResponseObject)) return;

  const actualKey = this.context === 'service' ? getSharedKey(maybeResponseObject) : statusCode;

  return {
    id: this.generateId(`http_response-${this.parentId}-${actualKey}`),
    code: statusCode,
    headers: entries(maybeResponseObject.headers).map(translateHeaderObject, this).filter(isNonNullable),
    contents: entries(maybeResponseObject.content).map(translateMediaTypeObject, this).filter(isNonNullable),

    ...pickBy(
      {
        description: maybeResponseObject.description,
      },
      isString,
    ),
  };
});

export const translateToResponses: Oas3TranslateFunction<[responses: unknown], (IHttpOperationResponse | Reference)[]> =
  function (responses) {
    return entries(responses).map(translateToResponse, this).filter(isNonNullable);
  };

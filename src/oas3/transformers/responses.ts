import type { IHttpOperationResponse, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withJsonPath } from '../../context';
import { isNonNullable, isString } from '../../guards';
import { ArrayCallbackParameters } from '../../types';
import { entries } from '../../utils';
import { isResponseObject } from '../guards';
import { Oas3TranslateFunction } from '../types';
import { translateHeaderObject, translateMediaTypeObject } from './content';

const translateToResponse = withJsonPath<
  Oas3TranslateFunction<
    ArrayCallbackParameters<[statusCode: string, response: unknown]>,
    Optional<IHttpOperationResponse>
  >
>(function ([statusCode, response]) {
  const resolvedResponse = this.maybeResolveLocalRef(response);
  if (!isResponseObject(resolvedResponse)) return;

  this.state.enter('responses', statusCode);

  return {
    id: this.generateId('response'),
    code: statusCode,
    headers: entries(resolvedResponse.headers).map(translateHeaderObject, this).filter(isNonNullable),
    contents: entries(resolvedResponse.content).map(translateMediaTypeObject, this).filter(isNonNullable),

    ...pickBy(
      {
        description: resolvedResponse.description,
      },
      isString,
    ),
  };
});

export const translateToResponses: Oas3TranslateFunction<[responses: unknown], IHttpOperationResponse[]> = function (
  responses,
) {
  return entries(responses).map(translateToResponse, this).filter(isNonNullable);
};

import { isObject, map, unionBy } from 'lodash';

import { maybeResolveLocalRef } from '../utils';

export function getValidOasParameters<ParamType extends { name: string; in: string }>(
  document: unknown,
  operationParameters: ParamType[] | undefined,
  pathParameters: ParamType[] | undefined,
) {
  const op = map(operationParameters, x => maybeResolveLocalRef(document, x) as ParamType);
  const pp = map(pathParameters, x => maybeResolveLocalRef(document, x) as ParamType);

  return unionBy(op, pp, (parameter?: ParamType) => {
    return isObject(parameter) ? `${parameter.name}-${parameter.in}` : 'invalid';
  }).filter(isObject);
}

export function getOasTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter(tag => typeof tag !== 'object').map(String) : [];
}

import { Extensions } from '@stoplight/types';
import { fromPairs, isObject, map, unionBy } from 'lodash';

import { maybeResolveLocalRef } from '../utils';

type ParamTypeBase = { name: string; in: string };

const ROOT_EXTENSIONS = ['x-internal'];

export function getValidOasParameters<ParamType extends ParamTypeBase>(
  document: unknown,
  operationParameters: ParamType[] | undefined,
  pathParameters: ParamType[] | undefined,
) {
  const resolvedOperationParams = map(operationParameters, x => maybeResolveLocalRef(document, x) as ParamType);
  const resolvedPathParams = map(pathParameters, x => maybeResolveLocalRef(document, x) as ParamType);

  return unionBy(resolvedOperationParams, resolvedPathParams, (parameter?: ParamType) => {
    return isObject(parameter) ? `${parameter.name}-${parameter.in}` : 'invalid';
  })
    .filter(isObject)
    .filter(isValidOasParameter);
}

const isValidOasParameter = (parameter: Partial<ParamTypeBase>): parameter is ParamTypeBase =>
  'name' in parameter && typeof parameter.name === 'string' && 'in' in parameter && typeof parameter.in === 'string';

export function getOasTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter(tag => typeof tag !== 'object').map(String) : [];
}

export function getExtensions(target: Record<string, unknown>): Extensions {
  return fromPairs(Object.entries(target).filter(([key]) => key.startsWith('x-') && !ROOT_EXTENSIONS.includes(key)));
}

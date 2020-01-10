import { isObject, unionBy } from 'lodash';

export function getOasParameters<ParamType extends { name: string; in: string }>(
  operationParameters: ParamType[] | undefined,
  pathParameters: ParamType[] | undefined,
) {
  return unionBy(operationParameters, pathParameters, (parameter?: ParamType) =>
    isObject(parameter) ? `${parameter.name}-${parameter.in}` : 'invalid',
  ).filter(isObject);
}

export function getOasTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter(tag => typeof tag !== 'object').map(String) : [];
}

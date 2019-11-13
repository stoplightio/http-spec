import { unionBy } from 'lodash';

export function getOasParameters<ParamType extends { name: string; in: string }>(
  operationParameters: ParamType[] | undefined,
  pathParameters: ParamType[] | undefined,
) {
  return unionBy(operationParameters, pathParameters, (parameter?: ParamType) =>
    parameter && typeof parameter === 'object' ? `${parameter.name}-${parameter.in}` : 'invalid',
  );
}

export function getOasTags(tags: unknown): string[] {
  return Array.isArray(tags) ? tags.filter(tag => typeof tag !== 'object').map(String) : [];
}

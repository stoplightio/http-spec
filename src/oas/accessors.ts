import { unionBy } from 'lodash';

export function getOasParameters<ParamType extends { name: string; in: string }>(
  operationParameters: ParamType[] | undefined,
  pathParameters: ParamType[] | undefined,
) {
  return unionBy(operationParameters, pathParameters, (parameter?: ParamType) =>
    parameter && typeof parameter === 'object' ? `${parameter.name}-${parameter.in}` : 'invalid',
  );
}

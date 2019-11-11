import { unionBy } from 'lodash';
import { OperationObject } from 'openapi3-ts';
import { Operation } from 'swagger-schema-official';

export function getOasParameters<ParamType extends { name: string; in: string }>(
  operationParameters: ParamType[] | undefined,
  pathParameters: ParamType[] | undefined,
) {
  return unionBy(operationParameters, pathParameters, (parameter?: ParamType) =>
    parameter && typeof parameter === 'object' ? `${parameter.name}-${parameter.in}` : 'invalid',
  );
}

export function getOasOperationTags(operation: OperationObject | Operation): string[] {
  return Array.isArray(operation.tags) ? operation.tags.filter(tag => typeof tag !== 'object').map(String) : [];
}

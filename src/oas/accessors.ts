import type { Extensions } from '@stoplight/types';

import { Fragment } from '../types';
import { entries, maybeResolveLocalRef } from '../utils';
import { isValidOas2Param, isValidOas3Param, Oas2ParamBase, Oas3ParamBase, ParamBase } from './guards';
import { OasVersion } from './types';

const ROOT_EXTENSIONS = ['x-internal'];

function getParameters(document: Fragment, spec: OasVersion.OAS2, params: unknown): Oas2ParamBase[];
function getParameters(document: Fragment, spec: OasVersion.OAS3, params: unknown): Oas3ParamBase[];
function getParameters(document: Fragment, spec: OasVersion, params: unknown): ParamBase[] {
  if (!Array.isArray(params)) return [];

  const resolved = params.map(maybeResolveLocalRef.bind(null, document));
  return spec === OasVersion.OAS2 ? resolved.filter(isValidOas2Param) : resolved.filter(isValidOas3Param);
}

const getIdForParameter = (param: ParamBase) => `${param.name}-${param.in}`;

export function getValidOasParameters(
  document: Fragment,
  spec: OasVersion.OAS2,
  operationParams: unknown,
  pathParams: unknown,
): Oas2ParamBase[];
export function getValidOasParameters(
  document: Fragment,
  spec: OasVersion.OAS3,
  operationParams: unknown,
  pathParams: unknown,
): Oas3ParamBase[];
export function getValidOasParameters(
  document: Fragment,
  spec: any,
  operationParams: unknown,
  pathParams: unknown,
): ParamBase[] {
  const uniqueParameters: Record<string, ParamBase> = {};

  const params = [...getParameters(document, spec, operationParams), ...getParameters(document, spec, pathParams)];

  for (const param of params) {
    uniqueParameters[getIdForParameter(param)] ??= param;
  }

  return Object.values(uniqueParameters);
}

export function getExtensions(target: unknown): Extensions {
  return Object.fromEntries(entries(target).filter(([key]) => key.startsWith('x-') && !ROOT_EXTENSIONS.includes(key)));
}

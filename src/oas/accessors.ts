import type { Extensions } from '@stoplight/types';

import { Fragment, TransformerContext } from '../types';
import { entries, maybeResolveLocalRef } from '../utils';
import { isValidOas2Param, isValidOas3Param, Oas2ParamBase, Oas3ParamBase, ParamBase } from './guards';
import { OasVersion } from './types';

const ROOT_EXTENSIONS = ['x-internal'];

function queryParameters(
  this: TransformerContext,
  spec: OasVersion.OAS2,
  params: unknown,
  seenParams: Set<string>,
): Iterable<[index: number, param: Oas2ParamBase]>;
function queryParameters(
  this: TransformerContext,
  spec: OasVersion.OAS3,
  params: unknown,
  seenParams: Set<string>,
): Iterable<[index: number, param: Oas3ParamBase]>;
function* queryParameters(
  this: TransformerContext,
  spec: OasVersion,
  params: unknown,
  seenParams: Set<string>,
): Iterable<[index: number, param: ParamBase]> {
  if (!Array.isArray(params)) return;

  const resolved = params.map(this.maybeResolveLocalRef, this);
  const guard = spec === OasVersion.OAS2 ? isValidOas2Param : isValidOas3Param;
  for (const [index, param] of resolved.entries()) {
    if (!guard(param)) continue;
    const key = getIdForParameter(param);
    if (seenParams.has(key)) continue;
    seenParams.add(key);
    yield [index, param];
  }
}

const getIdForParameter = (param: ParamBase) => `${param.name}-${param.in}`;

export function queryValidOasParameters(
  this: TransformerContext,
  spec: OasVersion.OAS2,
  operationParams: unknown,
  pathParams: unknown,
): Iterable<Oas2ParamBase>;
export function queryValidOasParameters(
  this: TransformerContext,
  spec: OasVersion.OAS3,
  operationParams: unknown,
  pathParams: unknown,
): Iterable<Oas3ParamBase>;
export function* queryValidOasParameters(
  this: TransformerContext,
  spec: any,
  operationParams: unknown,
  pathParams: unknown,
): Iterable<ParamBase> {
  const seenParams = new Set<string>();
  const method = this.state.path[2];
  const l = this.state.path.length - 1;

  for (const [i, param] of queryParameters.call(this, spec, operationParams, seenParams)) {
    this.state.exit(l);
    this.state.enter(method, 'parameters', String(i));
    yield param;
  }

  for (const [i, param] of queryParameters.call(this, spec, pathParams, seenParams)) {
    this.state.exit(l);
    this.state.enter('parameters', String(i));
    yield param;
  }

  this.state.exit(l);
  this.state.enter(method);
}

export function getExtensions(target: unknown): Extensions {
  return Object.fromEntries(entries(target).filter(([key]) => key.startsWith('x-') && !ROOT_EXTENSIONS.includes(key)));
}

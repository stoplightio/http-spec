import type { Extensions } from '@stoplight/types';

import { Fragment, TransformerContext } from '../types';
import { entries } from '../utils';
import { isValidOas2Param, isValidOas3Param, Oas2ParamBase, Oas3ParamBase, ParamBase } from './guards';
import { OasVersion } from './types';

const ROOT_EXTENSIONS = ['x-internal'];

const getIdForParameter = (param: ParamBase) => `${param.name}-${param.in}`;

type OasParamsIterator<N> = (this: TransformerContext, path: Fragment, operation: Fragment) => Iterable<N>;

export function createOasParamsIterator(spec: OasVersion.OAS2): OasParamsIterator<Oas2ParamBase>;
export function createOasParamsIterator(spec: OasVersion.OAS3): OasParamsIterator<Oas3ParamBase>;
export function createOasParamsIterator(spec: OasVersion): OasParamsIterator<Oas2ParamBase | Oas3ParamBase> {
  return function* (path, operation) {
    const seenParams = new Set();
    const { parentId, context } = this;
    const opParams = Array.isArray(operation.parameters) ? operation.parameters : [];
    const params = [...opParams, ...(Array.isArray(path.parameters) ? path.parameters : [])];

    for (let i = 0; i < params.length; i++) {
      const param = this.maybeResolveLocalRef(params[i]);
      if (!(spec === OasVersion.OAS2 ? isValidOas2Param : isValidOas3Param)(param)) continue;

      const key = getIdForParameter(param);

      if (seenParams.has(key)) continue;
      seenParams.add(key);

      if (this.context !== 'service') {
        this.context = i < opParams.length ? 'operation' : 'path';
      }

      yield param;
    }

    this.context = context;
    this.parentId = parentId;
  };
}

export function getExtensions(target: unknown): Extensions {
  return Object.fromEntries(entries(target).filter(([key]) => key.startsWith('x-') && !ROOT_EXTENSIONS.includes(key)));
}

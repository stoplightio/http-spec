import type { Extensions } from '@stoplight/types';
import { Reference } from '@stoplight/types';

import { Fragment, TransformerContext } from '../types';
import { entries } from '../utils';
import { isReferenceObject, isValidOas2ParameterObject, isValidOas3ParameterObject } from './guards';
import { Oas2ParamBase, Oas3ParamBase, OasVersion, ParamBase } from './types';

const ROOT_EXTENSIONS = ['x-internal'];

const getIdForParameter = (param: ParamBase) => `${param.name}-${param.in}`;

type OasParamsIterator<N> = (this: TransformerContext, path: Fragment, operation: Fragment) => Iterable<N>;

export function createOasParamsIterator(spec: OasVersion.OAS2): OasParamsIterator<Oas2ParamBase | Reference>;
export function createOasParamsIterator(spec: OasVersion.OAS3): OasParamsIterator<Oas3ParamBase | Reference>;
export function createOasParamsIterator(
  spec: OasVersion,
): OasParamsIterator<Oas2ParamBase | Oas3ParamBase | Reference> {
  return function* (path, operation) {
    const seenParams = new Set();
    const { parentId, context } = this;
    const opParams = Array.isArray(operation.parameters) ? operation.parameters : [];
    const params = [...opParams, ...(Array.isArray(path.parameters) ? path.parameters : [])];

    for (let i = 0; i < params.length; i++) {
      const maybeParameterObject = this.maybeResolveLocalRef(params[i]);
      if (isReferenceObject(maybeParameterObject)) {
        yield params[i];
        this.context = context;
        this.parentId = parentId;
        continue;
      }

      if (!(spec === OasVersion.OAS2 ? isValidOas2ParameterObject : isValidOas3ParameterObject)(maybeParameterObject)) {
        this.context = context;
        this.parentId = parentId;
        continue;
      }

      const key = getIdForParameter(maybeParameterObject);

      if (seenParams.has(key)) {
        this.context = context;
        this.parentId = parentId;
        continue;
      }
      seenParams.add(key);

      if (this.context !== 'service') {
        this.context = i < opParams.length ? 'operation' : 'path';
      }

      yield maybeParameterObject;
    }

    this.context = context;
    this.parentId = parentId;
  };
}

export function getExtensions(target: unknown): Extensions {
  return Object.fromEntries(entries(target).filter(([key]) => key.startsWith('x-') && !ROOT_EXTENSIONS.includes(key)));
}

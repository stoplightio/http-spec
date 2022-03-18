import { isPlainObject, pathToPointer, pointerToPath, resolveInlineRef } from '@stoplight/json';
import type { JsonPath, Segment } from '@stoplight/types';
// @ts-ignore
import * as fnv from 'fnv-plus';

import type { Fragment, IdGenerator, TransformerContext, TransformerState, TranslateFunction } from './types';
import { maybeResolveLocalRef } from './utils';

const ID_STORE = new WeakMap<Fragment, string>();

export const hash = (input: string): string => fnv.fast1a32hex(input);

export const DEFAULT_ID_GENERATOR: IdGenerator = ctx => pathToPointer(ctx.state.path as JsonPath);

export class ContextState<T extends Fragment> implements TransformerState<T> {
  #path: JsonPath;
  #resolvedPath: JsonPath | null;

  parentFragment: Record<string, unknown>;

  constructor(public readonly document: T) {
    this.#path = [];
    this.#resolvedPath = null;
    this.parentFragment = document;
  }

  get path() {
    return this.#path;
  }

  get resolvedPath() {
    return this.#resolvedPath ?? this.#path;
  }

  #resolveIfNeeded(value: unknown) {
    if (isPlainObject(value) && typeof value.$ref === 'string') {
      this.#resolvedPath = pointerToPath(value.$ref);
      return resolveInlineRef(this.document, value.$ref);
    }

    return value;
  }

  get fragment(): any {
    if (this.#path.length === 0) return this.document;

    this.#resolvedPath = null;

    let value: unknown = this.#resolveIfNeeded(this.document);
    for (const segment of this.#path) {
      if (typeof value !== 'object' || value === null) {
        return;
      }

      const v = value[segment];
      value = this.#resolveIfNeeded(v);
      // if (value === v) {
      //   // some bug in TS, cause it sees #resolvedPath as resolvedPath
      //   (this.#resolvedPath as any as JsonPath)?.push(segment);
      // }
    }

    return value;
  }

  enter(...items: Segment[]) {
    if (!items[0]) throw new Error('c');
    return this.#path.push(...items);
  }

  exit(pos: number) {
    this.#path.length = Math.min(this.#path.length, pos);
  }
}

export function createContext<T extends Record<string, unknown>>(
  document: T,
  generateId: IdGenerator<T>,
): TransformerContext<T> {
  const state = new ContextState<T>(document);
  return {
    document,
    maybeResolveLocalRef: maybeResolveLocalRef.bind(null, document),
    generateId(hint) {
      if (typeof state.fragment === 'object' && state.fragment !== null && ID_STORE.has(state.fragment)) {
        return ID_STORE.get(state.fragment)!;
      }

      const id = generateId(this, hint);
      if (typeof state.fragment === 'object' && state.fragment !== null) {
        ID_STORE.set(state.fragment, id);
      }

      return id;
    },
    unwrapIdForFragment(fragment: Fragment): string {
      const existingId = ID_STORE.get(fragment);
      if (existingId === void 0) {
        throw new ReferenceError('Fragment has no associated');
      }

      return existingId;
    },
    state,
  };
}

export function withJsonPath<F extends TranslateFunction<any, any[]> = TranslateFunction<Fragment, unknown[]>>(
  fn: F,
): F {
  return <F>function (...args: Parameters<F>) {
    const state = this.state as ContextState<any>;
    const {
      fragment,
      parentFragment,
      path: { length },
    } = state;
    state.parentFragment = fragment;
    const result = fn.apply(this, args);
    state.parentFragment = parentFragment;
    state.path.length = length;
    return result;
  };
}

import { hasRef, isLocalRef } from '@stoplight/json';

import { idGenerators } from './generators';
import type {
  AvailableContext,
  Fragment,
  IdGenerator,
  RefResolver,
  TransformerContext,
  TranslateFunction,
} from './types';

function wrapGenerateId<T extends Record<string, unknown>>(
  this: TransformerContext<T>,
  generateId: IdGenerator,
): TransformerContext<T>['generateId'] {
  const gn = (value: string) => {
    this.parentId = generateId(value);
    return this.parentId;
  };

  for (const [name, fn] of Object.entries(idGenerators)) {
    gn[name] = (props: Parameters<typeof fn>[0]) => {
      return gn(fn(Object.assign({ parentId: this.parentId }, props) as any));
    };
  }

  return gn as TransformerContext<T>['generateId'];
}

export function createContext<T extends Record<string, unknown>>(
  document: T,
  resolveRef: RefResolver<T>,
  generateId: IdGenerator,
): TransformerContext<T> {
  let context: AvailableContext = 'service';
  let wrappedGenerateId;
  return {
    document,
    get context() {
      return context;
    },
    set context(value) {
      context = value;
      if (value !== 'operation') {
        this.parentId = this.ids[value];
      }
    },
    maybeResolveLocalRef(target: unknown) {
      if (hasRef(target) && isLocalRef(target.$ref)) {
        try {
          return resolveRef.call(this, target);
        } catch {
          return;
        } finally {
          this.parentId = this.ids[context];
        }
      }

      return target;
    },
    get generateId() {
      return (wrappedGenerateId ??= wrapGenerateId.call(this, generateId));
    },
    ids: {
      service: '',
      path: '',
      operation: '',
      callback: '',
    },
    references: {},
    parentId: '',
  };
}

export function withContext<F extends TranslateFunction<any, any[]> = TranslateFunction<Fragment, unknown[]>>(
  fn: F,
): F {
  return <F>function (...args: Parameters<F>) {
    const { context, parentId } = this;
    const result = fn.apply(this, args);
    this.context = context;
    this.parentId = parentId;
    return result;
  };
}

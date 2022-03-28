import { TransformerContext } from './types';
import { maybeResolveLocalRef } from './utils';

export function createContext<T extends Record<string, unknown>>(document: T): TransformerContext<T> {
  return {
    document,
    maybeResolveLocalRef: maybeResolveLocalRef.bind(null, document),
  };
}

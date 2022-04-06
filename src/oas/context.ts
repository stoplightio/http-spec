// @ts-expect-error: no types
import * as fnv from 'fnv-plus';

import { createContext as _createContext } from '../context';
import type { Fragment, IdGenerator } from '../types';
import { resolveRef } from './resolver';

const HASH_32_KINDS = ['http_operation', 'schema'];

function getKind(input: string) {
  const i = input.indexOf('-');
  return input.slice(0, i);
}

const DEFAULT_ID_GENERATOR: IdGenerator = input => {
  const kind = getKind(input);
  return HASH_32_KINDS.some(k => kind === k) ? fnv.fast1a32hex(input) : fnv.fast1a52hex(input);
};

export function createContext<T extends Fragment>(document: T) {
  return _createContext<T>(document, resolveRef, DEFAULT_ID_GENERATOR);
}

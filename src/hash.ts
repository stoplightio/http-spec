// @ts-expect-error: no types
import * as fnv from 'fnv-plus';

import type { IdGenerator } from './types';

// for easier debugging the values going into hash
let SKIP_HASHING = false;

export const setSkipHashing = (skip: boolean) => {
  SKIP_HASHING = skip;
};

export const hash: IdGenerator = (value: string, skipHashing: boolean = SKIP_HASHING): string => {
  // Never change this, as it would affect how the default stable id is generated, and cause mismatches with whatever
  // we already have stored in our DB etc.
  return skipHashing ? value : fnv.fast1a52hex(value);
};

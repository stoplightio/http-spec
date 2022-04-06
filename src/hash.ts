// @ts-expect-error: no types
import * as fnv from 'fnv-plus';

import type { IdGenerator } from './types';

export const hash: IdGenerator = (input, length) =>
  length === 'short' ? fnv.fast1a32hex(input) : fnv.fast1a52hex(input);

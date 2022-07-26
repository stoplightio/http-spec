// @ts-expect-error: no types
import * as fnv from 'fnv-plus';

import type { IdGenerator } from './types';

// export const hash: IdGenerator = input => fnv.fast1a52hex(input);
export const hash: IdGenerator = input => input;

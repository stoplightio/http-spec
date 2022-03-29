import type { DeepPartial } from '@stoplight/types';
import type { Spec } from 'swagger-schema-official';

import { TranslateFunction } from '../types';

export type Oas2TranslateFunction<P extends unknown[], R extends unknown = unknown> = TranslateFunction<
  DeepPartial<Spec>,
  P,
  R
>;

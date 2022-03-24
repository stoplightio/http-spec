import { DeepPartial } from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';

import { TranslateFunction } from '../types';

export type Oas3TranslateFunction<P extends unknown[], R extends unknown = unknown> = TranslateFunction<
  DeepPartial<OpenAPIObject>,
  P,
  R
>;

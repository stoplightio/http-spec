import { DeepPartial } from '@stoplight/types';
import { OpenAPIObject as _OpenAPIObject } from 'openapi3-ts';
import { PathItemObject } from 'openapi3-ts/src/model/OpenApi';
import { ISpecificationExtension } from 'openapi3-ts/src/model/SpecificationExtension';

import { TranslateFunction } from '../types';

export type Oas3TranslateFunction<P extends unknown[], R extends unknown = unknown> = TranslateFunction<
  DeepPartial<OpenAPIObject>,
  P,
  R
>;

export interface OpenAPIObject extends _OpenAPIObject {
  webhooks?: WebhooksObject;
}

export interface WebhooksObject extends ISpecificationExtension {
  [name: string]: PathItemObject;
}

import { IHttpOperation } from '@stoplight/types';
import type { CollectionDefinition } from 'postman-collection';

import type { HttpEndpointOperationTransformer } from '../types';

export type PostmanCollectionHttpOperationTransformer = HttpEndpointOperationTransformer<
  {
    document: CollectionDefinition;
    path: string;
    method: string;
  },
  IHttpOperation
>;

import type { CollectionDefinition } from 'postman-collection';

import type { HttpOperationTransformer } from '../types';

export type PostmanCollectionHttpOperationTransformer = HttpOperationTransformer<{
  document: CollectionDefinition;
  path: string;
  method: string;
}>;

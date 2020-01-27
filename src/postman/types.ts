import { Collection, CollectionDefinition } from 'postman-collection';
import { HttpOperationTransformer, ITransformOperationOpts } from '../types';

export type PostmanCollectionHttpOperationTransformer = HttpOperationTransformer<{
  document: CollectionDefinition;
  path: string;
  method: string;
}>;

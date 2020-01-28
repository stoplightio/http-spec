import { CollectionDefinition } from 'postman-collection';
import { HttpOperationTransformer } from '../types';

export type PostmanCollectionHttpOperationTransformer = HttpOperationTransformer<{
  document: CollectionDefinition;
  path: string;
  method: string;
}>;

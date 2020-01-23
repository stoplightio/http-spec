import { Collection } from 'postman-collection';
import { HttpOperationTransformer, ITransformOperationOpts } from '../types';

export type PostmanCollectionHttpOperationTransformer = HttpOperationTransformer<{
  document: Collection;
  path: string;
  method: string;
}>;

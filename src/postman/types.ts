import { Collection } from 'postman-collection';
import { HttpOperationTransformer, ITransformOperationOpts } from '../types';

export type PostmanCollectionTransformOperationOpts = ITransformOperationOpts<Collection>;
export type PostmanCollectionHttpOperationTransformer = HttpOperationTransformer<
  PostmanCollectionTransformOperationOpts
>;

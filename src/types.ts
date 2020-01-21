import { DeepPartial } from '@stoplight/types';
import { IHttpOperation, IHttpService } from '@stoplight/types/dist';

export interface ITransformServiceOpts<T> {
  document: DeepPartial<T>;
}

export type HttpServiceTransformer<T> = (opts: T) => IHttpService;

export interface ITransformOperationOpts<T> {
  document: DeepPartial<T>;
  path: string;
  method: string;
}

export type HttpOperationTransformer<T> = (opts: T) => IHttpOperation;

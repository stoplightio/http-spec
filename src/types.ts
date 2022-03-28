import type { IHttpOperation, IHttpService } from '@stoplight/types';

export type Fragment = Record<string, unknown>;

export interface ITransformServiceOpts<T extends Fragment> {
  document: T;
}

export type HttpServiceTransformer<T> = (opts: T) => IHttpService;

export interface ITransformOperationOpts<T extends Fragment> {
  document: T;
  path: string;
  method: string;
}

export type HttpOperationTransformer<T> = (opts: T) => IHttpOperation;

export type TransformerContext<T extends Fragment = Fragment> = {
  maybeResolveLocalRef(target: unknown): unknown;
  document: T;
};

export type TranslateFunction<T extends Fragment, P extends unknown[], R extends unknown = unknown> = (
  this: TransformerContext<T>,
  ...params: P
) => R;

export type ArrayCallbackParameters<T> = [T, number, T[]];

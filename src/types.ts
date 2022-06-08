import type { IBundledHttpService, IHttpOperation, IHttpService } from '@stoplight/types';

export type Fragment = Record<string, unknown>;

export type IdGenerator = (value: string) => string;

export type RefResolver<T extends Fragment = Fragment> = (
  this: TransformerContext<T>,
  input: Fragment & { $ref: string },
) => unknown;

export interface ITransformServiceOpts<T extends Fragment> {
  document: T;
  ctx?: TransformerContext<T>;
}

export type HttpServiceTransformer<T> = (opts: T) => IHttpService;

export type HttpServiceBundle<T> = (opts: T) => IBundledHttpService;

export interface ITransformOperationOpts<T extends Fragment> {
  document: T;
  path: string;
  method: string;
  ctx?: TransformerContext<T>;
}

export type HttpOperationTransformer<T> = (opts: T) => IHttpOperation;

export type ArrayCallbackParameters<T> = [T, number, T[]];

export type AvailableContext = 'service' | 'path' | 'operation';

export type TransformerContext<T extends Fragment = Fragment> = {
  document: T;
  context: AvailableContext;
  parentId: string;
  readonly ids: Record<AvailableContext, string>;
  readonly $refs: Record<string, string>;
  generateId(template: string): string;
  maybeResolveLocalRef(target: unknown): unknown;
};

export type TranslateFunction<T extends Fragment, P extends unknown[], R extends unknown = unknown> = (
  this: TransformerContext<T>,
  ...params: P
) => R;

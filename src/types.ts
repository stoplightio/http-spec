import type { IHttpOperation, IHttpService, JsonPath, Segment } from '@stoplight/types';

export type Fragment = Record<string, unknown>;

export type IdGenerator<T extends Fragment = Fragment> = (ctx: TransformerContext<T>, hint: string) => string;

export interface ITransformServiceOpts<T extends Fragment> {
  document: T;
  generateId?: IdGenerator<T>;
}

export type HttpServiceTransformer<T> = (opts: T) => IHttpService;

export interface ITransformOperationOpts<T extends Fragment> {
  document: T;
  path: string;
  method: string;
  generateId?: IdGenerator<T>;
}

export type HttpOperationTransformer<T> = (opts: T) => IHttpOperation;

export type ArrayCallbackParameters<T> = [T, number, T[]];

export type TransformerState<T extends Fragment> = {
  readonly document: T;
  readonly fragment: Fragment;
  readonly parentFragment: Record<string, unknown>;
  readonly path: ReadonlyArray<Segment>;
  readonly resolvedPath: ReadonlyArray<Segment>;
  enter(...path: JsonPath): number;
  exit(pos: number): void;
};

export type TransformerContext<T extends Fragment = Fragment> = {
  document: T;
  generateId(hint: string): string;
  unwrapIdForFragment(fragment: Fragment): string;
  maybeResolveLocalRef(target: unknown): unknown;
  state: TransformerState<T>;
};

export type TranslateFunction<T extends Fragment, P extends unknown[], R extends unknown = unknown> = (
  this: TransformerContext<T>,
  ...params: P
) => R;

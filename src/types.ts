import type { IBundledHttpService, IHttpEndpointOperation, IHttpService } from '@stoplight/types';

import type { idGenerators } from './generators';

export type Fragment = Record<string, unknown>;

export type IdGenerator = (value: string, skipHashing?: boolean) => string;

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

export type EndpointOperationConfig =
  | {
      type: 'operation';
      documentProp: 'paths';
      nameProp: 'path';
    }
  | {
      type: 'webhook';
      documentProp: 'webhooks';
      nameProp: 'name';
    };

export interface ITransformEndpointOperationOpts<T extends Fragment> {
  document: T;
  name: string;
  method: string;
  config: EndpointOperationConfig;
  ctx?: TransformerContext<T>;
}

export type HttpEndpointOperationTransformer<T, TEndpoint extends IHttpEndpointOperation> = (opts: T) => TEndpoint;

export type HttpSecurityKind = 'requirement' | 'scheme';

export type ArrayCallbackParameters<T> = [T, number, T[]];

export type AvailableContext = 'service' | 'path' | 'operation' | 'callback' | 'webhook' | 'webhookName';

export type References = Record<string, { resolved: boolean; value: string }>;

export type TransformerContext<T extends Fragment = Fragment> = {
  document: T;
  context: AvailableContext;
  parentId: string;
  readonly ids: Omit<Record<AvailableContext, string>, 'callback'>;
  readonly references: References;
  generateId: ((template: string) => string) & {
    [key in keyof typeof idGenerators]: (
      props: Omit<Parameters<typeof idGenerators[key]>[0], 'parentId'> & { parentId?: string },
    ) => string;
  };
  maybeResolveLocalRef(target: unknown): unknown;
};

export type TranslateFunction<T extends Fragment, P extends unknown[], R extends unknown = unknown> = (
  this: TransformerContext<T>,
  ...params: P
) => R;

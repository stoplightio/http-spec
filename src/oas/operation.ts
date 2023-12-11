import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, IHttpEndpointOperation } from '@stoplight/types';
import type { OpenAPIObject, OperationObject, PathsObject } from 'openapi3-ts';
import type { Spec } from 'swagger-schema-official';
import pickBy = require('lodash.pickby');

import { isBoolean, isString } from '../guards';
import type { EndpointOperationConfig, Fragment, HttpEndpointOperationTransformer } from '../types';
import { TransformerContext, TranslateFunction } from '../types';
import { extractId } from '../utils';
import { getExtensions } from './accessors';
import { toExternalDocs } from './externalDocs';
import { translateToTags } from './tags';
import { translateToSecurityDeclarationType } from './transformers';

const DEFAULT_METHODS = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'];

export const OPERATION_CONFIG: EndpointOperationConfig = {
  type: 'operation',
  documentProp: 'paths',
  nameProp: 'path',
};

export const WEBHOOK_CONFIG: EndpointOperationConfig = {
  type: 'webhook',
  documentProp: 'webhooks',
  nameProp: 'name',
};

export function transformOasEndpointOperations<
  T extends Fragment & DeepPartial<Spec | OpenAPIObject>,
  TEndpoint extends IHttpEndpointOperation,
>(
  document: T,
  transformer: HttpEndpointOperationTransformer<any, TEndpoint>,
  config: EndpointOperationConfig,
  methods: string[] | null = DEFAULT_METHODS,

  ctx?: TransformerContext<T>,
): TEndpoint[] {
  const entries = isPlainObject(document[config.documentProp]) ? Object.entries(document[config.documentProp]) : [];

  return entries.flatMap(([name, value]) => {
    if (!isPlainObject(value)) return [];

    let operations = Object.keys(value);
    if (methods !== null) {
      operations = operations.filter(pathKey => methods.includes(pathKey));
    }

    return operations.map(method =>
      transformer({
        document,
        name,
        method,
        config,
        ctx,
      }),
    );
  });
}

export const transformOasEndpointOperation: TranslateFunction<
  DeepPartial<OpenAPIObject> | DeepPartial<Spec>,
  [config: EndpointOperationConfig, name: string, method: string],
  Omit<IHttpEndpointOperation, 'responses' | 'request' | 'servers' | 'security' | 'callbacks'>
> = function ({ type, documentProp, nameProp }: EndpointOperationConfig, name: string, method: string) {
  const pathObj = this.maybeResolveLocalRef(this.document?.[documentProp]?.[name]) as PathsObject;
  if (typeof pathObj !== 'object' || pathObj === null) {
    throw new Error(`Could not find ${[documentProp, name].join('/')} in the provided spec.`);
  }

  const obj = this.maybeResolveLocalRef(pathObj[method]) as OperationObject;
  if (!obj) {
    throw new Error(`Could not find ${[documentProp, name, method].join('/')} in the provided spec.`);
  }

  const serviceId = (this.ids.service = String(this.document['x-stoplight']?.id));
  if (type === 'operation') {
    this.ids.path = this.generateId.httpPath({ parentId: serviceId, path: name });
  } else {
    this.ids.webhookName = this.generateId.httpWebhookName({ parentId: serviceId, name });
  }
  let id: string;
  if (this.context === 'callback') {
    id = this.ids.operation =
      extractId(obj) ??
      this.generateId.httpCallbackOperation({
        parentId: serviceId,
        method,
        path: name,
      });
  } else if (type === 'operation') {
    id = this.ids.operation =
      extractId(obj) ?? this.generateId.httpOperation({ parentId: serviceId, method, path: name });
  } else {
    id = this.ids.webhook = extractId(obj) ?? this.generateId.httpWebhook({ parentId: serviceId, method, name });
  }

  this.parentId = id;

  this.context = type;

  return {
    id,

    method,
    [nameProp]: name,

    tags: translateToTags.call(this, obj.tags),
    extensions: getExtensions(obj),

    ...pickBy(
      {
        deprecated: obj.deprecated,
        internal: obj['x-internal'],
      },
      isBoolean,
    ),

    ...pickBy(
      {
        iid: obj.operationId,
        description: obj.description,
        summary: obj.summary,
      },
      isString,
    ),

    securityDeclarationType: translateToSecurityDeclarationType(obj),
    ...toExternalDocs(obj.externalDocs),
  };
};

import { DeepPartial, IHttpOperation } from '@stoplight/types';
import type * as OAS3 from 'openapi3-ts';
import type * as OAS2 from 'swagger-schema-official';

import type {
  HttpEndpointOperationTransformer,
  HttpServiceBundle,
  HttpServiceTransformer,
  ITransformEndpointOperationOpts,
  ITransformServiceOpts,
} from '../types';

export enum OasVersion {
  OAS2 = 2,
  OAS3 = 3,
}

/**
 * Service
 */
export type Oas2TransformServiceOpts = ITransformServiceOpts<
  DeepPartial<OAS2.Spec & { 'x-stoplight': { id: string; slug: string } }>
>;
export type Oas3TransformServiceOpts = ITransformServiceOpts<DeepPartial<OAS3.OpenAPIObject>>;
export type Oas2HttpServiceTransformer = HttpServiceTransformer<Oas2TransformServiceOpts>;
export type Oas3HttpServiceTransformer = HttpServiceTransformer<Oas3TransformServiceOpts>;
export type Oas2HttpServiceBundle = HttpServiceBundle<Oas3TransformServiceOpts>;
export type Oas3HttpServiceBundle = HttpServiceBundle<Oas3TransformServiceOpts>;

/**
 * Operation
 */
export type Oas2TransformOperationOpts = ITransformEndpointOperationOpts<DeepPartial<OAS2.Spec>>;
export type Oas3TransformOperationOpts = ITransformEndpointOperationOpts<DeepPartial<OAS3.OpenAPIObject>>;
export type Oas2HttpOperationTransformer = HttpEndpointOperationTransformer<Oas2TransformOperationOpts, IHttpOperation>;
export type Oas3HttpOperationTransformer = HttpEndpointOperationTransformer<Oas3TransformOperationOpts, IHttpOperation>;

export type Oas3ParamBase = ParamBase & { in: OAS3.ParameterLocation };
export type Oas2ParamBase = ParamBase & { in: OAS2.BaseParameter['in'] };
export type ParamBase = { name: string; in: string } & Record<string, unknown>;

export type PathItemObject = Omit<OAS2.Path, '$ref'> | Omit<OAS3.PathItemObject, '$ref'>;
export type OperationObject = OAS2.Operation | OAS3.OperationObject;

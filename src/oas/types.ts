import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

import {
  HttpOperationTransformer,
  HttpServiceTransformer,
  ITransformOperationOpts,
  ITransformServiceOpts,
} from '../types';

export enum OasVersion {
  OAS2 = 2,
  OAS3 = 3,
}

/**
 * Service
 */
export type Oas2TransformServiceOpts = ITransformServiceOpts<Spec>;
export type Oas3TransformServiceOpts = ITransformServiceOpts<OpenAPIObject>;
export type Oas2HttpServiceTransformer = HttpServiceTransformer<Oas2TransformServiceOpts>;
export type Oas3HttpServiceTransformer = HttpServiceTransformer<Oas3TransformServiceOpts>;

/**
 * Operation
 */
export type Oas2TransformOperationOpts = ITransformOperationOpts<Spec>;
export type Oas3TransformOperationOpts = ITransformOperationOpts<OpenAPIObject>;
export type Oas2HttpOperationTransformer = HttpOperationTransformer<Oas2TransformOperationOpts>;
export type Oas3HttpOperationTransformer = HttpOperationTransformer<Oas3TransformOperationOpts>;

import {
  IApiKeySecurityScheme,
  IBasicSecurityScheme,
  IBearerSecurityScheme,
  IOauth2SecurityScheme,
  IOpenIdConnectSecurityScheme,
} from '@stoplight/types';
import { OpenAPIObject } from 'openapi3-ts';
import { Spec } from 'swagger-schema-official';

export declare type HttpSecurityScheme =
  | IApiKeySecurityScheme
  | IBearerSecurityScheme
  | IBasicSecurityScheme
  | IOauth2SecurityScheme
  | IOpenIdConnectSecurityScheme;

// prefixing with T to avoid tslinter "no-shadow" error
export interface ITranslateOperationOptions<TSpec> {
  document: TSpec;
  path: string;
  method: string;
}

export type Oas2TranslateOperationOptions = ITranslateOperationOptions<Spec>;
export type Oas3TranslateOperationOptions = ITranslateOperationOptions<OpenAPIObject>;

export const enum OasVersion {
  OAS2 = 2,
  OAS3 = 3,
}

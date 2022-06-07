import { JSONSchema7 } from 'json-schema';
import { Dictionary } from './basic';
import { IShareableNode, INode, INodeExample, INodeExternalExample } from './graph';
import { IServer } from './servers';
/**
 * HTTP Service
 */
export interface IHttpService extends INode, IShareableNode {
    name: string;
    version: string;
    servers?: IServer[];
    security?: HttpSecurityScheme[];
    securitySchemes?: HttpSecurityScheme[];
    termsOfService?: string;
    contact?: {
        name?: string;
        url?: string;
        email?: string;
    };
    license?: {
        name: string;
        url?: string;
        identifier?: string;
    };
    logo?: {
        altText: string;
        href?: string;
        url?: string;
        backgroundColor?: string;
    };
}
/**
 * HTTP Operation
 */
export interface IHttpOperation extends INode, IShareableNode {
    method: string;
    path: string;
    request?: IHttpOperationRequest | Reference;
    responses: (IHttpOperationResponse | Reference)[];
    servers?: IServer[];
    callbacks?: (IHttpCallbackOperation | Reference)[];
    security?: HttpSecurityScheme[][];
    deprecated?: boolean;
    internal?: boolean;
}
export declare type IHttpCallbackOperation = Omit<IHttpOperation, 'servers' | 'security' | 'callbacks'> & {
    callbackName: string;
};
export interface IHttpOperationRequest {
    path?: (IHttpPathParam | Reference)[];
    query?: (IHttpQueryParam | Reference)[];
    headers?: (IHttpHeaderParam | Reference)[];
    cookie?: (IHttpCookieParam | Reference)[];
    body?: IHttpOperationRequestBody | Reference;
}
export interface IHttpOperationRequestBody extends IShareableNode {
    contents?: IMediaTypeContent[];
    required?: boolean;
    description?: string;
}
export interface IHttpOperationResponse extends IShareableNode {
    code: string;
    contents?: IMediaTypeContent[];
    headers?: (IHttpHeaderParam | Reference)[];
    description?: string;
}
/**
 * HTTP Params
 */
export interface IHttpParam extends IHttpContent, IShareableNode {
    name: string;
    style: HttpParamStyles;
    description?: string;
    explode?: boolean;
    required?: boolean;
    deprecated?: boolean;
}
export declare enum HttpParamStyles {
    Simple = "simple",
    Matrix = "matrix",
    Label = "label",
    Form = "form",
    CommaDelimited = "commaDelimited",
    SpaceDelimited = "spaceDelimited",
    PipeDelimited = "pipeDelimited",
    DeepObject = "deepObject"
}
export interface IHttpPathParam extends IHttpParam {
    style: HttpParamStyles.Label | HttpParamStyles.Matrix | HttpParamStyles.Simple;
}
export interface IHttpQueryParam extends IHttpParam {
    style: HttpParamStyles.Form | HttpParamStyles.CommaDelimited | HttpParamStyles.SpaceDelimited | HttpParamStyles.PipeDelimited | HttpParamStyles.DeepObject;
    allowEmptyValue?: boolean;
    allowReserved?: boolean;
}
export interface IHttpHeaderParam extends IHttpParam {
    style: HttpParamStyles.Simple;
}
export interface IHttpCookieParam extends IHttpParam {
    style: HttpParamStyles.Form;
}
/**
 * HTTP Content
 */
export interface IHttpContent extends IShareableNode {
    schema?: JSONSchema7;
    examples?: (INodeExample | INodeExternalExample | Reference)[];
    encodings?: IHttpEncoding[];
}
export interface IMediaTypeContent extends IHttpContent {
    mediaType: string;
}
export interface IHttpEncoding {
    property: string;
    style: HttpParamStyles.Form | HttpParamStyles.CommaDelimited | HttpParamStyles.SpaceDelimited | HttpParamStyles.PipeDelimited | HttpParamStyles.DeepObject;
    headers?: (IHttpHeaderParam | Reference)[];
    mediaType?: string;
    explode?: boolean;
    allowReserved?: boolean;
}
/**
 * HTTP Security
 */
export declare type HttpSecurityScheme = IApiKeySecurityScheme | IBearerSecurityScheme | IBasicSecurityScheme | IOauth2SecurityScheme | IOpenIdConnectSecurityScheme | IMutualTLSSecurityScheme;
interface ISecurityScheme extends IShareableNode {
    key: string;
    description?: string;
}
export interface IApiKeySecurityScheme extends ISecurityScheme {
    type: 'apiKey';
    name: string;
    in: 'query' | 'header' | 'cookie';
}
export interface IBearerSecurityScheme extends ISecurityScheme {
    type: 'http';
    scheme: 'bearer';
    bearerFormat?: string;
}
export interface IBasicSecurityScheme extends ISecurityScheme {
    type: 'http';
    scheme: 'basic' | 'digest';
}
export interface IOpenIdConnectSecurityScheme extends ISecurityScheme {
    type: 'openIdConnect';
    openIdConnectUrl: string;
}
export interface IOauth2SecurityScheme extends ISecurityScheme {
    type: 'oauth2';
    flows: IOauthFlowObjects;
}
export interface IMutualTLSSecurityScheme extends ISecurityScheme {
    type: 'mutualTLS';
}
export interface IOauthFlowObjects {
    implicit?: IOauth2ImplicitFlow;
    password?: IOauth2PasswordFlow;
    clientCredentials?: IOauth2ClientCredentialsFlow;
    authorizationCode?: IOauth2AuthorizationCodeFlow;
}
export interface IOauth2Flow {
    scopes: Dictionary<string, string>;
    refreshUrl?: string;
}
export interface IOauth2ImplicitFlow extends IOauth2Flow {
    authorizationUrl: string;
}
export interface IOauth2AuthorizationCodeFlow extends IOauth2Flow {
    authorizationUrl: string;
    tokenUrl: string;
}
export interface IOauth2PasswordFlow extends IOauth2Flow {
    tokenUrl: string;
}
export interface IOauth2ClientCredentialsFlow extends IOauth2Flow {
    tokenUrl: string;
}
export declare type Reference = {
    $ref: string;
    summary?: string;
    description?: string;
};
export interface Extensions {
    [key: string]: unknown;
}
export {};

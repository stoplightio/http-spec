import { isPlainObject } from '@stoplight/json';
import type { DeepPartial, Dictionary } from '@stoplight/types';
import { HttpParamStyles } from '@stoplight/types';
import { ParameterLocation } from 'openapi3-ts';
import type { InfoObject } from 'openapi3-ts/src/model/OpenApi';
import type { Info } from 'swagger-schema-official';
import { BaseParameter } from 'swagger-schema-official';

export function hasXLogo(
  info: DeepPartial<Info | InfoObject>,
): info is DeepPartial<Info | InfoObject> & { 'x-logo': Dictionary<unknown> } {
  return isPlainObject(info['x-logo']);
}

const VALID_OAS3_PARAM_LOCATION: ParameterLocation[] = ['query', 'header', 'path', 'cookie'];
const VALID_OAS2_PARAM_LOCATION: BaseParameter['in'][] = ['query', 'header', 'path', 'body', 'formData'];

const VALID_PARAM_STYLES: HttpParamStyles[] = Object.values(HttpParamStyles);

export type Oas3ParamBase = { name: string; in: ParameterLocation };
export type Oas2ParamBase = { name: string; in: BaseParameter['in'] };
export type ParamBase = { name: string; in: string };

export const isValidOasParam = (param: unknown): param is ParamBase =>
  isPlainObject(param) && typeof param.name === 'string' && typeof param.in === 'string';

export const isValidOas2Param = (param: unknown): param is Oas2ParamBase =>
  isValidOasParam(param) && VALID_OAS2_PARAM_LOCATION.includes(param.in as BaseParameter['in']);

export const isValidOas3Param = (param: unknown): param is Oas3ParamBase =>
  isValidOasParam(param) && VALID_OAS3_PARAM_LOCATION.includes(param.in as ParameterLocation);

export const isValidParamStyle = (style: unknown): style is HttpParamStyles =>
  VALID_PARAM_STYLES.includes(style as HttpParamStyles);

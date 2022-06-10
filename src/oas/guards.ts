import { hasRef, isPlainObject } from '@stoplight/json';
import { DeepPartial, HttpParamStyles, Reference } from '@stoplight/types';
import type * as OAS3 from 'openapi3-ts';
import type * as OAS2 from 'swagger-schema-official';

import type { Oas2ParamBase, Oas3ParamBase, ParamBase } from './types';

export function hasXLogo(
  info: DeepPartial<OAS2.Info | OAS3.InfoObject>,
): info is DeepPartial<OAS2.Info | OAS3.InfoObject> & { 'x-logo': Record<string, unknown> } {
  return isPlainObject(info['x-logo']);
}

const VALID_OAS3_PARAM_LOCATION: OAS3.ParameterLocation[] = ['query', 'header', 'path', 'cookie'];
const VALID_OAS2_PARAM_LOCATION: OAS2.BaseParameter['in'][] = ['query', 'header', 'path', 'body', 'formData'];

const VALID_PARAM_STYLES: HttpParamStyles[] = Object.values(HttpParamStyles);

export const isValidParameterObject = (param: unknown): param is ParamBase =>
  isPlainObject(param) && typeof param.name === 'string' && typeof param.in === 'string';

export const isValidOas2ParameterObject = (param: unknown): param is Oas2ParamBase =>
  isValidParameterObject(param) && VALID_OAS2_PARAM_LOCATION.includes(param.in as OAS2.BaseParameter['in']);

export const isValidOas3ParameterObject = (param: unknown): param is Oas3ParamBase =>
  isValidParameterObject(param) && VALID_OAS3_PARAM_LOCATION.includes(param.in as OAS3.ParameterLocation);

export const isValidParamStyle = (style: unknown): style is HttpParamStyles =>
  VALID_PARAM_STYLES.includes(style as HttpParamStyles);

export function isReferenceObject(maybeReferenceObject: unknown): maybeReferenceObject is Reference {
  return hasRef(maybeReferenceObject);
}

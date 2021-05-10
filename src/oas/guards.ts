import { DeepPartial, Dictionary } from '@stoplight/types';
import { InfoObject } from 'openapi3-ts/src/model/OpenApi';
import { Info } from 'swagger-schema-official';

import { isDictionary } from '../utils';

export function hasXLogo(
  info: DeepPartial<Info | InfoObject>,
): info is DeepPartial<Info | InfoObject> & { 'x-logo': Dictionary<unknown> } {
  return isDictionary(info['x-logo']);
}

import { DeepPartial, HttpSecurityScheme, IHttpService, IServer } from '@stoplight/types';
import { compact, flatMap, get, values } from 'lodash';
import { Spec } from 'swagger-schema-official';

import { translateToSingleSecurity } from './transformers/securities';

export function transformOas2Service(document: DeepPartial<Spec>): IHttpService {
  const securitySchemes = values(document.securityDefinitions).map(sec =>
    sec ? translateToSingleSecurity(sec) : [],
  ) as HttpSecurityScheme[];

  const security = compact(
    flatMap(document.security, sec =>
      sec ? Object.keys(sec).map(n => translateToSingleSecurity(get(document, ['securityDefinitions', n]))) : [],
    ),
  ) as HttpSecurityScheme[];

  return {
    id: '?http-service-id?',
    name: get(document.info, 'title') || 'no-title',
    ...document.info,
    servers: (document.schemes || ['https']).map<IServer>(scheme => ({
      name: (document.info && document.info.title) || '',
      description: undefined,
      url: scheme + '://' + (document.host || '') + (document.basePath || ''),
    })),
    // @ts-ignore
    tags: compact(document.tags || []),
    security,
    securitySchemes,
  };
}

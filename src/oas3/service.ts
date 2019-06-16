import { HttpSecurityScheme, IServer } from '@stoplight/types';
import { compact, flatMap, get } from 'lodash';
import { SecuritySchemeObject } from 'openapi3-ts';

import { Oas3HttpServiceTransformer } from '../oas/types';
import { transformToSingleSecurity } from './transformers/securities';

export const transformOas3Service: Oas3HttpServiceTransformer = ({ document }) => {
  const servers = compact(
    (document.servers || []).map(server =>
      server
        ? {
            name: get(document.info, 'title'),
            description: server.description,
            url: server.url,
          }
        : null,
    ),
  ) as IServer[];

  // @ts-ignore TODO: fix typing
  const security = compact(
    flatMap(document.security || [], sec =>
      sec
        ? compact(
            Object.keys(sec).map(n =>
              n ? transformToSingleSecurity(get(document, ['components', 'securitySchemes', n])) : null,
            ),
          )
        : null,
    ),
  ) as HttpSecurityScheme[];

  const securitySchemes = compact(
    Object.values((document.components && document.components.securitySchemes) || [])
      .filter(scheme => typeof scheme === 'object')
      .map(sec => (sec ? transformToSingleSecurity(sec as SecuritySchemeObject) : undefined)),
  ) as HttpSecurityScheme[];

  return {
    id: '?http-service-id?',
    name: get(document.info, 'title') || 'no-title',
    ...document.info,
    servers,
    // @ts-ignore
    tags: compact(document.tags || []),
    security,
    securitySchemes,
  };
};

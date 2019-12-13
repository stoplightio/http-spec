import { HttpSecurityScheme, IServer } from '@stoplight/types';
import { compact, flatMap } from 'lodash';

import { Oas3HttpServiceTransformer } from '../oas/types';
import { isSecurityScheme } from './guards';
import { transformToSingleSecurity } from './transformers/securities';

export const transformOas3Service: Oas3HttpServiceTransformer = ({ document }) => {
  const servers = compact<IServer>(
    document.servers?.map?.(server =>
      server
        ? {
            name: document.info?.title ?? '',
            description: server.description,
            url: server.url,
          }
        : null,
    ),
  );

  const securitySchemes = compact<HttpSecurityScheme>(
    Object.keys(document.components?.securitySchemes || []).map(key => {
      const definition = document?.components?.securitySchemes?.[key];
      return isSecurityScheme(definition) && transformToSingleSecurity(definition, key);
    }),
  );

  // @ts-ignore TODO: fix typing
  const security = compact(
    flatMap(document.security || [], sec =>
      sec
        ? compact(
            Object.keys(sec).map(key => {
              return securitySchemes.find(securityScheme => {
                return securityScheme.key === key;
              });
            }),
          )
        : null,
    ),
  ) as HttpSecurityScheme[];

  return {
    id: '?http-service-id?',
    name: document.info?.title ?? 'no-title',
    ...document.info,
    servers,
    // @ts-ignore
    tags: compact(document.tags || []),
    security,
    securitySchemes,
  };
};

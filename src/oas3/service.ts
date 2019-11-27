import { HttpSecurityScheme, IServer } from '@stoplight/types';
import { compact, flatMap, isObject } from 'lodash';
import { SecuritySchemeObject } from 'openapi3-ts';

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

  // @ts-ignore TODO: fix typing
  const security = compact(
    flatMap(document.security || [], sec =>
      sec
        ? compact(
            Object.keys(sec).map(n => {
              const definition = document?.components?.securitySchemes?.[n];
              return isSecurityScheme(definition) && transformToSingleSecurity(definition);
            }),
          )
        : null,
    ),
  ) as HttpSecurityScheme[];

  const securitySchemes = compact<HttpSecurityScheme>(
    Object.values(document.components?.securitySchemes || [])
      .filter(isObject)
      .map(sec => (sec ? transformToSingleSecurity(sec as SecuritySchemeObject) : undefined)),
  );

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

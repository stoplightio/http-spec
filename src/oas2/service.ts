import { HttpSecurityScheme, IServer } from '@stoplight/types';
import { compact, flatMap, isString } from 'lodash';

import { Oas2HttpServiceTransformer } from '../oas/types';
import { translateToSingleSecurity } from './transformers/securities';

export const transformOas2Service: Oas2HttpServiceTransformer = ({ document }) => {
  const securitySchemes = compact<HttpSecurityScheme>(
    Object.keys(document.securityDefinitions || []).map(key => {
      const definition = document?.securityDefinitions?.[key];
      return translateToSingleSecurity(definition, key);
    }),
  );

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

  const schemes: string[] = !Array.isArray(document.schemes) ? [] : document.schemes.filter(isString);

  return {
    id: '?http-service-id?',
    name: document.info?.title ?? 'no-title',
    ...document.info,
    servers: schemes.map<IServer>(scheme => ({
      name: document.info?.title ?? '',
      description: undefined,
      url: scheme + '://' + (document.host || '') + (document.basePath || ''),
    })),
    // @ts-ignore
    tags: compact(document.tags || []),
    security,
    securitySchemes,
  };
};

import { HttpSecurityScheme, IServer, Optional } from '@stoplight/types';
import { compact, flatMap, get, isString, values } from 'lodash';

import { Oas2HttpServiceTransformer } from '../oas/types';
import { translateToSingleSecurity } from './transformers/securities';

export const transformOas2Service: Oas2HttpServiceTransformer = ({ document }) => {
  const securitySchemes = compact<HttpSecurityScheme>(
    values(document.securityDefinitions).map<Optional<HttpSecurityScheme>>(sec =>
      sec ? translateToSingleSecurity(sec) : void 0,
    ),
  );

  const security = compact<HttpSecurityScheme>(
    flatMap(document.security, sec =>
      sec ? Object.keys(sec).map(n => translateToSingleSecurity(get(document, ['securityDefinitions', n]))) : [],
    ),
  );

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

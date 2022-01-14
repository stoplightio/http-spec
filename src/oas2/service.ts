import { isPlainObject } from '@stoplight/json';
import pickBy from 'lodash.pickby';

import { createContext, DEFAULT_ID_GENERATOR } from '../context';
import { isNonNullable, isString } from '../guards';
import { resolveRef } from '../oas/resolver';
import { transformOasService } from '../oas/service';
import { Oas2HttpServiceTransformer } from '../oas/types';
import { entries } from '../utils';
import { translateToSingleSecurity } from './transformers/securities';
import { translateToServer } from './transformers/servers';

export const transformOas2Service: Oas2HttpServiceTransformer = ({ document }) => {
  const ctx = createContext(document, resolveRef, DEFAULT_ID_GENERATOR);
  const httpService = transformOasService.call(ctx);

  if (document.info?.license) {
    httpService.license = {
      ...document.info.license,
      name: document.info.license.name || '',
    };
  }

  const schemes = Array.isArray(document.schemes) ? document.schemes.filter(isString) : [];

  const servers = schemes.map(translateToServer, ctx).filter(isNonNullable);

  if (servers.length) {
    httpService.servers = servers;
  }

  const securitySchemes = entries(document.securityDefinitions)
    .map(([key, definition]) => {
      return isPlainObject(definition) ? translateToSingleSecurity.call(ctx, { ...definition, key }) : null;
    })
    .filter(isNonNullable);

  if (securitySchemes.length) {
    httpService.securitySchemes = securitySchemes;
  }

  const security = Array.isArray(document.security)
    ? document.security
        .flatMap(sec => {
          if (!isPlainObject(sec)) return null;

          return Object.keys(sec).map(key => {
            const ss = securitySchemes.find(securityScheme => securityScheme.key === key);
            if (ss && ss.type === 'oauth2') {
              const flows = {};
              for (const flowKey in ss.flows) {
                const flow = ss.flows[flowKey];
                flows[flowKey] = {
                  ...flow,
                  scopes: pickBy(flow.scopes, (_val: string, scopeKey: string) => {
                    const secKey = sec[key];
                    if (secKey) return secKey.includes(scopeKey);
                    return undefined;
                  }),
                };
              }

              return {
                ...ss,
                flows,
              };
            }

            return ss;
          });
        })
        .filter(isNonNullable)
    : [];

  if (security.length) {
    httpService.security = security;
  }

  return httpService;
};

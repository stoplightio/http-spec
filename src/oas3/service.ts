import { isPlainObject } from '@stoplight/json';
import type { Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');
import { createContext, withJsonPath } from '../context';
import { isNonNullable } from '../guards';
import { DEFAULT_ID_GENERATOR } from '../oas/id';
import { transformOasService } from '../oas/service';
import type { Oas3HttpServiceTransformer } from '../oas/types';
import { ArrayCallbackParameters } from '../types';
import { entries } from '../utils';
import { SecurityWithKey } from './accessors';
import { isSecurityScheme } from './guards';
import { translateToSingleSecurity } from './transformers/securities';
import { translateToServer } from './transformers/servers';
import { Oas3TranslateFunction } from './types';

export const transformOas3Service: Oas3HttpServiceTransformer = ({ document, generateId = DEFAULT_ID_GENERATOR }) => {
  const ctx = createContext(document, generateId);
  const httpService = transformOasService.call(ctx);

  if (typeof document.info?.summary === 'string') {
    httpService.summary = document.info.summary;
  }

  if (document.info?.license) {
    const { name, identifier, ...license } = document.info.license;
    httpService.license = {
      ...license,
      name: typeof name === 'string' ? name : '',
      ...(typeof identifier === 'string' && { identifier }),
    };
  }

  const servers = Array.isArray(document.servers)
    ? document.servers.map(translateToServer, ctx).filter(isNonNullable)
    : [];

  if (servers.length) {
    httpService.servers = servers;
  }

  const securitySchemes = entries(document.components?.securitySchemes)
    .map(translateSecurityScheme, ctx)
    .filter(isNonNullable);

  if (securitySchemes.length) {
    httpService.securitySchemes = securitySchemes;
  }

  const security = (Array.isArray(document.security) ? document.security : [])
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
                return false;
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
    .filter(isNonNullable);

  if (security.length) {
    httpService.security = security;
  }

  return httpService;
};

const translateSecurityScheme = withJsonPath<
  Oas3TranslateFunction<ArrayCallbackParameters<[name: string, scheme: unknown]>, Optional<SecurityWithKey>>
>(function ([key, definition]) {
  if (!isSecurityScheme(definition)) return;

  this.state.enter('components', 'securitySchemes', key);

  const transformed = translateToSingleSecurity.call(this, definition);
  if (transformed && 'key' in transformed) {
    transformed.key = key;
  }

  return transformed;
});

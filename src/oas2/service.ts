import { HttpSecurityScheme, IHttpService, IOauth2Flow, IServer } from '@stoplight/types';
import { compact, filter, flatMap, isString, keys, mapValues, pickBy } from 'lodash';

import { Oas2HttpServiceTransformer } from '../oas/types';
import { isTagObject } from './guards';
import { translateToSingleSecurity } from './transformers/securities';

export const transformOas2Service: Oas2HttpServiceTransformer = ({ document }) => {
  const httpService: IHttpService = {
    id: '?http-service-id?',
    version: document.info?.version ?? '',
    name: document.info?.title ?? 'no-title',
  };

  if (document.info?.description) {
    httpService.description = document.info.description;
  }

  if (document.info?.contact) {
    httpService.contact = document.info.contact;
  }

  if (document.info?.license) {
    httpService.license = {
      ...document.info.license,
      name: document.info.license.name || '',
    };
  }

  if (document.info?.termsOfService) {
    httpService.termsOfService = document.info.termsOfService;
  }

  const schemes = filter(document.schemes, scheme => scheme && isString(scheme));
  const servers = schemes.map<IServer>(scheme => ({
    name: document.info?.title ?? '',
    description: undefined,
    url: scheme + '://' + (document.host || '') + (document.basePath || ''),
  }));
  if (servers.length) {
    httpService.servers = servers;
  }

  const securitySchemes = compact<HttpSecurityScheme>(
    keys(document.securityDefinitions).map(key => {
      const definition = document?.securityDefinitions?.[key];
      if (!definition) return undefined;

      return translateToSingleSecurity(definition, key);
    }),
  );
  if (securitySchemes.length) {
    httpService.securitySchemes = securitySchemes;
  }

  const security = compact(
    flatMap(document.security, sec => {
      if (!sec) return null;

      return keys(sec).map(key => {
        const ss = securitySchemes.find(securityScheme => securityScheme.key === key);
        if (ss && ss.type === 'oauth2') {
          return {
            ...ss,
            flows: mapValues(ss.flows, (flow: IOauth2Flow) => ({
              ...flow,
              scopes: pickBy(flow.scopes, (_val: string, scopeKey: string) => {
                const secKey = sec[key];
                if (secKey) return secKey.includes(scopeKey);
                return false;
              }),
            })),
          };
        }

        return ss;
      });
    }),
  );

  if (security.length) {
    //@ts-ignore I hate doing this, but unfortunately Lodash types are (rightfully) very loose and put undefined when it can't happen
    httpService.security = security;
  }

  const tags = filter(document.tags, isTagObject);
  if (tags.length) {
    httpService.tags = tags;
  }

  return httpService;
};

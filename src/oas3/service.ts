import { HttpSecurityScheme, IHttpService, IServer } from '@stoplight/types';
import { compact, filter, flatMap, keys, map, pickBy } from 'lodash';

import { Oas3HttpServiceTransformer } from '../oas/types';
import { isXLogo } from '../oas2/guards';
import { isSecurityScheme, isTagObject } from './guards';
import { transformToSingleSecurity } from './transformers/securities';
import { translateServerVariables } from './transformers/servers';

export const transformOas3Service: Oas3HttpServiceTransformer = ({ document }) => {
  const httpService: IHttpService = {
    id: '?http-service-id?',
    version: document.info?.version ?? '',
    name: document.info?.title ?? 'no-title',
  };

  if (typeof document.info?.description === 'string') {
    httpService.description = document.info.description;
  }

  if (typeof document.info?.summary === 'string') {
    httpService.summary = document.info.summary;
  }

  if (document.info?.contact) {
    httpService.contact = document.info.contact;
  }

  if (typeof document.info?.license === 'object' && document.info.license !== null) {
    const { name, identifier, ...license } = document.info.license;
    httpService.license = {
      ...license,
      name: typeof name === 'string' ? name : '',
      ...(typeof identifier === 'string' && { identifier }),
    };
  }

  if (document.info?.termsOfService) {
    httpService.termsOfService = document.info.termsOfService;
  }

  if (document.info?.['x-logo'] && isXLogo(document.info['x-logo'])) {
    httpService.logo = {
      altText: document.info['x-logo'].altText,
      href: document.info['x-logo'].href ?? document.info.contact?.url,
      url: document.info['x-logo'].url,
      backgroundColor: document.info['x-logo'].backgroundColor,
    };
  }

  const servers = compact<IServer>(
    map(document.servers, server => {
      if (!server) return null;

      const serv: IServer = {
        name: document.info?.title ?? '',
        description: server.description,
        url: server.url ?? '',
      };

      const variables = server.variables && translateServerVariables(server.variables);
      if (variables && Object.keys(variables).length) serv.variables = variables;

      return serv;
    }),
  );
  if (servers.length) {
    httpService.servers = servers;
  }

  const securitySchemes = compact<HttpSecurityScheme>(
    keys(document.components?.securitySchemes).map(key => {
      const definition = document?.components?.securitySchemes?.[key];
      return isSecurityScheme(definition) && transformToSingleSecurity(definition, key);
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

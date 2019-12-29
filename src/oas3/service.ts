import { HttpSecurityScheme, IHttpService, INodeTag, IServer } from '@stoplight/types';
import { compact, filter, flatMap, keys, map } from 'lodash';

import { Oas3HttpServiceTransformer } from '../oas/types';
import { isSecurityScheme, isTagObject } from './guards';
import { transformToSingleSecurity } from './transformers/securities';

export const transformOas3Service: Oas3HttpServiceTransformer = ({ document }) => {
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

  const servers = compact<IServer>(
    map(document.servers, server => {
      if (!server) return null;

      return {
        name: document.info?.title ?? '',
        description: server.description,
        url: server.url ?? '',
      };
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
        return securitySchemes.find(securityScheme => {
          return securityScheme.key === key;
        });
      });
    }),
  ) as HttpSecurityScheme[];
  if (security.length) {
    httpService.security = security;
  }

  const tags = filter(document.tags, tag => isTagObject(tag)) as INodeTag[];
  if (tags.length) {
    httpService.tags = tags;
  }

  return httpService;
};

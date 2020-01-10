import { HttpSecurityScheme, IHttpService, INodeTag, IServer } from '@stoplight/types';
import { compact, filter, flatMap, isString, keys } from 'lodash';

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
        return securitySchemes.find(securityScheme => {
          return securityScheme.key === key;
        });
      });
    }),
  ) as HttpSecurityScheme[];
  if (security.length) {
    httpService.security = security;
  }

  const tags = filter(document.tags, isTagObject);
  if (tags.length) {
    httpService.tags = tags;
  }

  return httpService;
};

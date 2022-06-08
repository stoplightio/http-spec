import { isPlainObject } from '@stoplight/json';
import type { HttpSecurityScheme, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../context';
import { isNonNullable } from '../guards';
import { createContext } from '../oas/context';
import { bundleResolveRef, setSharedKey } from '../oas/resolver';
import { transformOasService } from '../oas/service';
import { translateSchemaObject } from '../oas/transformers';
import { translateToComponents } from '../oas/transformers/components';
import type { Oas3HttpServiceTransformer } from '../oas/types';
import { ArrayCallbackParameters } from '../types';
import { entries } from '../utils';
import { isSecurityScheme } from './guards';
import { transformOas3Operations } from './operation';
import { translateToExample } from './transformers/examples';
import { translateParameterObject, translateRequestBody } from './transformers/request';
import { translateToResponse } from './transformers/responses';
import { translateToSingleSecurity } from './transformers/securities';
import { translateToServer } from './transformers/servers';
import { Oas3TranslateFunction } from './types';

export const bundleOas3Service: Oas3HttpServiceTransformer = ({ document: _document }) => {
  const ctx = createContext(_document, bundleResolveRef);
  const { document } = ctx;
  const { securitySchemes, ...service } = transformOas3Service({ document, ctx });
  const operations = transformOas3Operations(document, ctx);
  ctx.context = 'service';

  return {
    ...service,
    operations,
    components: translateToComponents.call(ctx, document.components, {
      response: translateToResponse,
      requestBody: translateRequestBody,
      securityScheme: translateSecurityScheme,
      example: translateToExample,
      schema(this: typeof ctx, [key, value]) {
        if (isPlainObject(value)) {
          setSharedKey(value, key);
        }
        return translateSchemaObject.call(this, value);
      },
      parameter(this: typeof ctx, [key, value]) {
        if (isPlainObject(value)) {
          setSharedKey(value, key);
        }
        return translateParameterObject.call(this, value as any);
      },
    }),
  };
};

export const transformOas3Service: Oas3HttpServiceTransformer = ({
  document: _document,
  ctx = createContext(_document),
}) => {
  const { document } = ctx;
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

const translateSecurityScheme = withContext<
  Oas3TranslateFunction<ArrayCallbackParameters<[name: string, scheme: unknown]>, Optional<HttpSecurityScheme>>
>(function ([key, definition]) {
  if (!isSecurityScheme(definition)) return;

  return translateToSingleSecurity.call(this, [key, definition]);
});

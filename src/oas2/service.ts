import { isPlainObject } from '@stoplight/json';
import { HttpSecurityScheme, IHttpOperation, IHttpOperationResponse, Optional, Reference } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../context';
import { isNonNullable, isString } from '../guards';
import { createContext } from '../oas/context';
import { bundleResolveRef } from '../oas/resolver';
import { transformOasService } from '../oas/service';
import { translateToComponents } from '../oas/transformers/components';
import { translateSchemaObjectFromPair } from '../oas/transformers/schema';
import { Oas2HttpServiceBundle, Oas2HttpServiceTransformer, OasVersion } from '../oas/types';
import { ArrayCallbackParameters } from '../types';
import { entries } from '../utils';
import { normalizeProducesOrConsumes } from './accessors';
import { transformOas2Operations } from './operation';
import { translateToSharedParameters } from './transformers/params';
import { translateToResponse } from './transformers/responses';
import { translateToSingleSecurity } from './transformers/securities';
import { translateToServer } from './transformers/servers';
import { Oas2TranslateFunction } from './types';

export const bundleOas2Service: Oas2HttpServiceBundle = ({ document: _document }) => {
  const ctx = createContext(_document, bundleResolveRef);
  const { document } = ctx;

  const { securitySchemes, ...service } = transformOas2Service({ document, ctx });
  const produces = normalizeProducesOrConsumes(ctx.document.produces);
  const components = {
    ...translateToComponents.call(ctx, OasVersion.OAS2, {
      responses([key, value]): Optional<
        IHttpOperationResponse<true> | (Pick<IHttpOperationResponse<true>, 'code'> & Reference)
      > {
        return translateToResponse.call(ctx, produces, key, value);
      },
      definitions: translateSchemaObjectFromPair,
      securitySchemes: translateSecurityScheme,
    }),
    ...translateToSharedParameters.call(ctx, document),
  } as any;

  const operations = transformOas2Operations(document, ctx) as unknown as IHttpOperation<true>[];

  return {
    ...service,
    operations,
    components,
  };
};

export const transformOas2Service: Oas2HttpServiceTransformer = ({ document, ctx = createContext(document) }) => {
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

  const securitySchemes = entries(document.securityDefinitions).map(translateSecurityScheme, ctx).filter(isNonNullable);

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

const translateSecurityScheme = withContext<
  Oas2TranslateFunction<ArrayCallbackParameters<[name: string, scheme: unknown]>, Optional<HttpSecurityScheme>>
>(function ([key, definition]) {
  if (!isPlainObject(definition)) return;

  return translateToSingleSecurity.call(this, { ...definition, key });
});

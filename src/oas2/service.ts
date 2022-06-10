import { isPlainObject } from '@stoplight/json';
import { HttpSecurityScheme, IHttpOperation, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { withContext } from '../context';
import { isNonNullable, isString } from '../guards';
import { createContext } from '../oas/context';
import { isValidOas2ParameterObject } from '../oas/guards';
import { resolveRef, syncReferenceObject } from '../oas/resolver';
import { transformOasService } from '../oas/service';
import { translateToComponents } from '../oas/transformers/components';
import { translateSchemaObjectFromPair } from '../oas/transformers/schema';
import { Oas2HttpServiceBundle, Oas2HttpServiceTransformer, OasVersion } from '../oas/types';
import { ArrayCallbackParameters, RefResolver } from '../types';
import { entries } from '../utils';
import { transformOas2Operations } from './operation';
import { translateToSharedParameters } from './transformers/params';
import { translateToSingleSecurity } from './transformers/securities';
import { translateToServer } from './transformers/servers';
import { Oas2TranslateFunction } from './types';

const oas2BundleResolveRef: RefResolver = function (target) {
  const output = resolveRef.call(this, target);
  if (target.$ref.startsWith('#/responses/')) {
    return output;
  }

  if (isValidOas2ParameterObject(output) && (output.in === 'formData' || output.in === 'body')) {
    return output;
  }

  return syncReferenceObject(target, this.references);
};

export const bundleOas2Service: Oas2HttpServiceBundle = ({ document: _document }) => {
  const ctx = createContext(_document, oas2BundleResolveRef);
  const { document } = ctx;

  const { securitySchemes, ...service } = transformOas2Service({ document, ctx });
  const components = {
    ...translateToComponents.call(ctx, OasVersion.OAS2, {
      definitions: translateSchemaObjectFromPair,
      securityDefinitions: translateSecurityScheme,
    }),
    ...translateToSharedParameters.call(ctx, document),
  };

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

import { IServer } from '@stoplight/types';
import { isString } from 'lodash';
import { Operation, Spec } from 'swagger-schema-official';

import { URI } from '../../utils';

export function translateToServers(spec: Partial<Spec>, operation: Partial<Operation>): IServer[] {
  const schemes = operation.schemes || spec.schemes;
  const { host, basePath } = spec;
  if (typeof host !== 'string' || host.length === 0) {
    return [];
  }

  if (!Array.isArray(schemes)) {
    return [];
  }

  return schemes.filter(isString).map(scheme => {
    let uri = URI()
      .scheme(scheme)
      .host(host);

    if (typeof basePath === 'string' && basePath.length > 0) {
      uri = uri.path(String(basePath));
    }

    return {
      url: uri.toString().replace(/\/$/, ''), // Remove trailing slash
    };
  });
}

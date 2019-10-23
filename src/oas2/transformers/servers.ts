import { IServer } from '@stoplight/types';
import { isString } from 'lodash';
import { Operation, Spec } from 'swagger-schema-official';

import { URI } from '../../utils';

export function translateToServers(spec: Partial<Spec>, operation: Partial<Operation>): IServer[] {
  const schemes = operation.schemes || spec.schemes;
  const { host, basePath } = spec;
  if (!host) {
    return [];
  }

  if (!Array.isArray(schemes)) {
    return [];
  }

  return schemes.filter(isString).map(scheme => {
    let uri = URI()
      .scheme(scheme)
      .host(host);

    if (basePath) {
      uri = uri.path(basePath);
    }

    return {
      url: uri.toString().replace(/\/$/, ''), // Remove trailing slash
    };
  });
}

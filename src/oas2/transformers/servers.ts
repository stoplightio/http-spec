import { DeepPartial, IServer } from '@stoplight/types';
import { isString } from 'lodash';
import { Operation, Spec } from 'swagger-schema-official';

import { URI } from '../../utils';

export function translateToServers(spec: DeepPartial<Spec>, operation: DeepPartial<Operation>): IServer[] {
  if (typeof spec.host !== 'string' || spec.host.length === 0) {
    return [];
  }

  const schemes = operation.schemes || spec.schemes;
  if (!Array.isArray(schemes)) {
    return [];
  }

  const hasBasePath = typeof spec.basePath === 'string' && spec.basePath.length > 0;

  return schemes.filter(isString).map(scheme => {
    let uri = URI()
      .scheme(scheme)
      .host(spec.host);

    if (hasBasePath) {
      uri = uri.path(spec.basePath);
    }

    return {
      url: uri.toString().replace(/\/$/, ''), // Remove trailing slash
    };
  });
}

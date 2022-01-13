import { DeepPartial, IServer } from '@stoplight/types';
import { Operation, Spec } from 'swagger-schema-official';

import { isValidScheme } from '../guards';

export function translateToServers(spec: DeepPartial<Spec>, operation: DeepPartial<Operation>): IServer[] {
  const { host } = spec;
  if (typeof host !== 'string' || host.length === 0) {
    return [];
  }

  const schemes = operation.schemes || spec.schemes;
  if (!Array.isArray(schemes)) {
    return [];
  }

  const basePath = typeof spec.basePath === 'string' && spec.basePath.length > 0 ? spec.basePath : null;

  return schemes.filter(isValidScheme).map(scheme => {
    const uri = new URL('https://localhost');
    uri.host = host;
    uri.protocol = `${scheme}:`;

    if (basePath !== null) {
      uri.pathname = basePath;
    }

    return {
      url: uri.toString().replace(/\/$/, ''), // Remove trailing slash
    };
  });
}

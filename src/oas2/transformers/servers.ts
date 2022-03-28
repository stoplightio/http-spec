import type { IServer, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { isNonNullable, isString } from '../../guards';
import { isValidScheme } from '../guards';
import type { Oas2TranslateFunction } from '../types';

export const translateToServers: Oas2TranslateFunction<[operation: Record<string, unknown>], IServer[]> = function (
  operation,
) {
  let schemes;
  if (Array.isArray(operation.schemes)) {
    schemes = operation.schemes;
  } else if (Array.isArray(this.document.schemes)) {
    schemes = this.document.schemes;
  } else {
    return [];
  }

  return schemes.map(translateToServer, this).filter(isNonNullable);
};

export const translateToServer: Oas2TranslateFunction<[scheme: unknown], Optional<IServer>> = function (scheme) {
  const { host } = this.document;
  if (typeof host !== 'string' || host.length === 0) {
    return;
  }

  if (!isString(scheme) || !isValidScheme(scheme)) return;

  const basePath =
    typeof this.document.basePath === 'string' && this.document.basePath.length > 0 ? this.document.basePath : null;

  const uri = new URL('https://localhost');
  uri.host = host;
  uri.protocol = `${scheme}:`;

  if (basePath !== null) {
    uri.pathname = basePath;
  }

  return {
    url: uri.toString().replace(/\/$/, ''), // Remove trailing slash

    ...pickBy(
      {
        name: this.document.info?.title,
      },
      isString,
    ),
  };
};

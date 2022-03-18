import type { IServer, Optional } from '@stoplight/types';

import { withJsonPath } from '../../context';
import pickBy = require('lodash.pickby');

import { isNonNullable, isString } from '../../guards';
import { ArrayCallbackParameters } from '../../types';
import { isValidScheme } from '../guards';
import type { Oas2TranslateFunction } from '../types';

export const translateToServers: Oas2TranslateFunction<[operation: Record<string, unknown>], IServer[]> = function (
  operation,
) {
  let schemes;
  if (Array.isArray(operation.schemes)) {
    schemes = operation.schemes;
    this.state.exit(2);
  } else if (Array.isArray(this.document.schemes)) {
    schemes = this.document.schemes;
    this.state.exit(0);
  } else {
    return [];
  }

  return schemes.map(translateToServer, this).filter(isNonNullable);
};

export const translateToServer = withJsonPath<
  Oas2TranslateFunction<ArrayCallbackParameters<unknown>, Optional<IServer>>
>(function (scheme, i) {
  const { host } = this.document;
  if (typeof host !== 'string' || host.length === 0) {
    return;
  }

  if (!isString(scheme) || !isValidScheme(scheme)) return;

  this.state.enter('servers', String(i));

  const basePath =
    typeof this.document.basePath === 'string' && this.document.basePath.length > 0 ? this.document.basePath : null;

  const uri = new URL('https://localhost');
  uri.host = host;
  uri.protocol = `${scheme}:`;

  if (basePath !== null) {
    uri.pathname = basePath;
  }

  return {
    id: this.generateId('server'),
    url: uri.toString().replace(/\/$/, ''), // Remove trailing slash

    ...pickBy(
      {
        name: this.document.info?.title,
      },
      isString,
    ),
  };
});

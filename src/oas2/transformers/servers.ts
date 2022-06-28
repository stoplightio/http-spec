import type { IServer, Optional } from '@stoplight/types';

import { withContext } from '../../context';
import pickBy = require('lodash.pickby');

import { isNonNullable, isString } from '../../guards';
import { ArrayCallbackParameters } from '../../types';
import { isValidScheme } from '../guards';
import type { Oas2TranslateFunction } from '../types';

export const translateToServers = withContext<Oas2TranslateFunction<[operation: Record<string, unknown>], IServer[]>>(
  function (operation) {
    let schemes;
    if (Array.isArray(operation.schemes)) {
      schemes = operation.schemes;
      this.context = 'operation';
    } else if (Array.isArray(this.document.schemes)) {
      schemes = this.document.schemes;
      this.context = 'service';
    } else {
      return [];
    }

    return schemes.map(translateToServer, this).filter(isNonNullable);
  },
);

export const translateToServer = withContext<
  Oas2TranslateFunction<ArrayCallbackParameters<unknown>, Optional<IServer>>
>(function (scheme) {
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

  const url = uri.toString().replace(/\/$/, ''); // Remove trailing slash

  return {
    id: this.generateId.httpServer({ url }),
    url,

    ...pickBy(
      {
        name: this.document.info?.title,
      },
      isString,
    ),
  };
});

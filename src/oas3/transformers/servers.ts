import type { INodeVariable, IServer, Optional } from '@stoplight/types';
import pickBy = require('lodash.pickby');

import { isNonNullable, isString } from '../../guards';
import { ArrayCallbackParameters, Fragment } from '../../types';
import { entries } from '../../utils';
import { isServerObject, isServerVariableObject } from '../guards';
import { Oas3TranslateFunction } from '../types';

export const translateToServers: Oas3TranslateFunction<[path: Fragment, operation: Fragment], IServer[]> = function (
  path,
  operation,
) {
  let servers;
  if (Array.isArray(operation.servers)) {
    servers = operation.servers;
  } else if (Array.isArray(path.servers)) {
    servers = path.servers;
  } else if (Array.isArray(this.document.servers)) {
    servers = this.document.servers;
  } else {
    return [];
  }

  return servers.map(translateToServer, this).filter(isNonNullable);
};

export const translateToServer: Oas3TranslateFunction<ArrayCallbackParameters<unknown>, Optional<IServer>> = function (
  server,
) {
  if (!isServerObject(server)) return;

  const variables = translateServerVariables.call(this, server.variables);

  return {
    url: server.url,

    ...pickBy(
      {
        name: this.document.info?.title,
        description: server.description,
      },
      isString,
    ),

    ...pickBy(
      {
        variables,
      },
      isNonNullable,
    ),
  };
};

export const translateServerVariables: Oas3TranslateFunction<
  [variables: unknown],
  Optional<Record<string, INodeVariable>>
> = variables => {
  const serverVariables = entries(variables).map(translateServerVariable).filter(isNonNullable);
  return serverVariables.length > 0 ? Object.fromEntries(serverVariables) : undefined;
};

const translateServerVariable: Oas3TranslateFunction<
  ArrayCallbackParameters<[name: string, variable: unknown]>,
  Optional<[string, INodeVariable]>
> = function ([name, variable]) {
  if (!isServerVariableObject(variable)) return;

  return [
    name,
    {
      default: String(variable.default),

      ...pickBy(
        {
          description: variable.description,
        },
        isString,
      ),

      ...pickBy(
        {
          enum: Array.isArray(variable.enum) ? variable.enum.map(String) : undefined,
        },
        isNonNullable,
      ),
    },
  ];
};

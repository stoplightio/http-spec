import { pickBy } from '@oclif/parser/lib/util';
import type { INodeVariable, IServer, Optional } from '@stoplight/types';

import { withJsonPath } from '../../context';
import { isNonNullable, isString } from '../../guards';
import { ArrayCallbackParameters } from '../../types';
import { entries } from '../../utils';
import { isServerObject, isServerVariableObject } from '../guards';
import { Oas3TranslateFunction } from '../types';

export const translateToServers = withJsonPath<
  Oas3TranslateFunction<[path: Record<string, unknown>, operation: Record<string, unknown>], IServer[]>
>(function (path, operation) {
  let servers;
  if (Array.isArray(operation.servers)) {
    servers = operation.servers;
  } else if (Array.isArray(path.servers)) {
    servers = path.servers;
    this.state.exit(2);
  } else if (Array.isArray(this.state.document.servers)) {
    servers = this.state.document.servers;
    this.state.exit(0);
  } else {
    return [];
  }

  return servers.map(translateToServer, this).filter(isNonNullable);
});

export const translateToServer = withJsonPath<
  Oas3TranslateFunction<ArrayCallbackParameters<unknown>, Optional<IServer>>
>(function (server, i) {
  if (!isServerObject(server)) return;

  this.state.enter('servers', i);

  const variables = translateServerVariables.call(this, server.variables);

  return {
    id: this.generateId('server'),
    url: server.url,

    ...pickBy(
      {
        name: this.state.document.info?.title,
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
});

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
